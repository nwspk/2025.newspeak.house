import { getStore } from '@netlify/blobs';
import {
	ALLOCATION_ORDER,
	BOOKING_STORE_KEY,
	POOL_LEAD_DAYS,
	createInitialState,
	type BookingState,
	type CohortMember,
	type DayState,
	type DaySwapTrade,
	type IrlOfferTrade,
	type Trade
} from '$lib/data/room-booking';

let memoryState: BookingState | null = null;

function cloneState(state: BookingState): BookingState {
	return structuredClone(state);
}

function getToday(): Date {
	const today = new Date();
	today.setHours(12, 0, 0, 0);
	return today;
}

function parseDate(dateKey: string): Date {
	return new Date(`${dateKey}T12:00:00`);
}

function daysUntil(dateKey: string): number {
	const target = parseDate(dateKey);
	const today = getToday();
	return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getStoreClient() {
	try {
		return getStore(BOOKING_STORE_KEY);
	} catch {
		return null;
	}
}

function normalizeState(state: BookingState): BookingState {
	return {
		...state,
		pool_claims: state.pool_claims ?? {},
		trades: state.trades ?? [],
		wallet_addresses: state.wallet_addresses ?? {}
	};
}

async function readRawState(): Promise<BookingState> {
	const store = getStoreClient();

	if (store) {
		const existing = await store.get('state', { type: 'json' });
		if (existing) {
			return normalizeState(existing as BookingState);
		}
	}

	if (memoryState) {
		return cloneState(memoryState);
	}

	const initial = createInitialState();
	memoryState = cloneState(initial);
	return initial;
}

async function writeRawState(state: BookingState): Promise<void> {
	const store = getStoreClient();
	memoryState = cloneState(state);

	if (store) {
		await store.setJSON('state', state);
	}
}

function applyPoolTransitions(state: BookingState): BookingState {
	const next = cloneState(state);

	for (const [dateKey, day] of Object.entries(next.days)) {
		if (day.status !== 'unconfirmed') continue;
		if (daysUntil(dateKey) > POOL_LEAD_DAYS) continue;

		day.status = 'pool';
		day.holder = null;
		day.claimed_at = null;

		if (!next.pool_claims[dateKey]) {
			next.pool_claims[dateKey] = [];
		}
	}

	return next;
}

function applyPoolAssignments(state: BookingState): BookingState {
	const next = cloneState(state);

	for (const [dateKey, day] of Object.entries(next.days)) {
		if (day.status !== 'pool') continue;
		if (daysUntil(dateKey) !== 1) continue;

		const claims = next.pool_claims[dateKey] ?? [];
		if (claims.length !== 1) continue;

		const [winner] = claims;
		day.holder = winner;
		day.status = 'claimed';
		day.claimed_at = new Date().toISOString();
		next.pool_claims[dateKey] = [];
	}

	return next;
}

function applyAutomaticTransitions(state: BookingState): BookingState {
	return applyPoolAssignments(applyPoolTransitions(state));
}

function assertMember(member: string): asserts member is CohortMember {
	if (!member || !ALLOCATION_ORDER.includes(member as CohortMember)) {
		throw new Error('Unknown cohort member');
	}
}

function getDay(state: BookingState, dateKey: string): DayState {
	const day = state.days[dateKey];
	if (!day) {
		throw new Error('Unknown date');
	}
	return day;
}

function hasPendingTrade(state: BookingState, dateKey: string): boolean {
	return state.trades.some(
		(trade) =>
			trade.status === 'pending' &&
			((trade.type === 'day_swap' && trade.initiator_date === dateKey) ||
				trade.counterpart_date === dateKey)
	);
}

function markTradePending(state: BookingState, dateKey: string) {
	const day = getDay(state, dateKey);
	if (day.status !== 'trade_pending') {
		day.status = 'trade_pending';
	}
}

function restoreDayAfterTrade(state: BookingState, dateKey: string) {
	const day = getDay(state, dateKey);

	if (day.holder && day.claimed_at) {
		day.status = 'claimed';
		return;
	}

	if (daysUntil(dateKey) <= POOL_LEAD_DAYS) {
		day.status = 'pool';
		day.holder = null;
		return;
	}

	day.status = 'unconfirmed';
}

export async function loadBookingState(): Promise<BookingState> {
	const state = await readRawState();
	const withTransitions = applyAutomaticTransitions(state);

	// Cheap deep-equality check before persisting auto-assignments (18 days, small payload).
	if (JSON.stringify(withTransitions) !== JSON.stringify(state)) {
		await writeRawState(withTransitions);
		return withTransitions;
	}

	return state;
}

export async function claimDay(dateKey: string, member: string): Promise<BookingState> {
	assertMember(member);
	const state = await loadBookingState();
	const day = getDay(state, dateKey);

	if (day.status === 'trade_pending') {
		throw new Error('This day has a pending trade');
	}

	if (day.status === 'claimed') {
		throw new Error('This day is already claimed');
	}

	if (day.status === 'unconfirmed') {
		if (member !== day.allocated_to) {
			throw new Error('You can only claim the day allocated to you');
		}

		day.holder = member;
		day.status = 'claimed';
		day.claimed_at = new Date().toISOString();
		await writeRawState(state);
		return state;
	}

	if (day.status === 'pool') {
		const claims = state.pool_claims[dateKey] ?? [];
		if (!claims.includes(member)) {
			claims.push(member);
			state.pool_claims[dateKey] = claims;
		}
		await writeRawState(state);
		return state;
	}

	throw new Error('Unable to claim this day');
}

export async function swapDay(dateKey: string, member: string): Promise<BookingState> {
	assertMember(member);
	const state = await loadBookingState();
	const day = getDay(state, dateKey);

	if (day.status !== 'claimed' || day.holder !== member) {
		throw new Error('Only the current holder can release this day to the pool');
	}

	day.status = 'pool';
	day.holder = null;
	day.claimed_at = null;

	if (!state.pool_claims[dateKey]) {
		state.pool_claims[dateKey] = [];
	}

	await writeRawState(state);
	return state;
}

export async function requestTrade(input: {
	type: 'day_swap' | 'irl_offer';
	initiator: string;
	initiator_date?: string | null;
	counterpart: string;
	counterpart_date: string;
	irl_note?: string;
}): Promise<BookingState> {
	assertMember(input.initiator);
	assertMember(input.counterpart);

	const note = input.irl_note?.trim() ?? '';

	if (input.type === 'irl_offer' && !note) {
		throw new Error('Please describe what you are offering in real life');
	}

	if (input.type === 'day_swap' && !input.initiator_date) {
		throw new Error('Choose the day you are offering');
	}

	const state = await loadBookingState();
	const counterpartDay = getDay(state, input.counterpart_date);

	if (input.type === 'day_swap' && input.initiator_date) {
		const initiatorDay = getDay(state, input.initiator_date);

		if (initiatorDay.holder !== input.initiator) {
			throw new Error('You can only trade a day you currently hold');
		}

		if (
			hasPendingTrade(state, input.initiator_date) ||
			hasPendingTrade(state, input.counterpart_date)
		) {
			throw new Error('One of these days already has a pending trade');
		}

		if (initiatorDay.status === 'pool' || counterpartDay.status === 'pool') {
			throw new Error('Pool days cannot be traded directly yet');
		}
	} else if (hasPendingTrade(state, input.counterpart_date)) {
		throw new Error('This day already has a pending trade');
	}

	if (counterpartDay.status === 'pool') {
		throw new Error('Pool days cannot be traded directly yet');
	}

	const trade: Trade =
		input.type === 'day_swap'
			? ({
					id: crypto.randomUUID(),
					type: 'day_swap',
					initiator: input.initiator,
					initiator_date: input.initiator_date!,
					counterpart: input.counterpart,
					counterpart_date: input.counterpart_date,
					irl_note: note,
					status: 'pending',
					created_at: new Date().toISOString()
				} satisfies DaySwapTrade)
			: ({
					id: crypto.randomUUID(),
					type: 'irl_offer',
					initiator: input.initiator,
					counterpart: input.counterpart,
					counterpart_date: input.counterpart_date,
					irl_note: note,
					status: 'pending',
					created_at: new Date().toISOString()
				} satisfies IrlOfferTrade);

	state.trades.push(trade);

	if (trade.type === 'day_swap') {
		markTradePending(state, trade.initiator_date);
	}

	markTradePending(state, trade.counterpart_date);

	await writeRawState(state);
	return state;
}

export async function respondToTrade(
	tradeId: string,
	responder: string,
	accept: boolean
): Promise<BookingState> {
	assertMember(responder);
	const state = await loadBookingState();
	const trade = state.trades.find((item) => item.id === tradeId && item.status === 'pending');

	if (!trade) {
		throw new Error('Trade not found');
	}

	if (responder !== trade.counterpart && responder !== trade.initiator) {
		throw new Error('Only trade participants can respond');
	}

	if (!accept) {
		trade.status = 'declined';
		if (trade.type === 'day_swap') {
			restoreDayAfterTrade(state, trade.initiator_date);
		}
		restoreDayAfterTrade(state, trade.counterpart_date);
		await writeRawState(state);
		return state;
	}

	if (responder !== trade.counterpart) {
		throw new Error('Only the counterpart can accept this trade');
	}

	if (trade.type === 'irl_offer') {
		const counterpartDay = getDay(state, trade.counterpart_date);
		counterpartDay.holder = trade.initiator;
		counterpartDay.status = 'claimed';
		counterpartDay.claimed_at = new Date().toISOString();
		trade.status = 'accepted';
		await writeRawState(state);
		return state;
	}

	const initiatorDay = getDay(state, trade.initiator_date);
	const counterpartDay = getDay(state, trade.counterpart_date);
	const initiatorHolder = initiatorDay.holder ?? trade.initiator;
	const counterpartHolder = counterpartDay.holder ?? trade.counterpart;

	initiatorDay.holder = counterpartHolder;
	counterpartDay.holder = initiatorHolder;
	initiatorDay.status = 'claimed';
	counterpartDay.status = 'claimed';
	initiatorDay.claimed_at = new Date().toISOString();
	counterpartDay.claimed_at = new Date().toISOString();

	trade.status = 'accepted';
	await writeRawState(state);
	return state;
}

function assertWalletAddress(address: string): string {
	const trimmed = address.trim();
	if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
		return trimmed;
	}
	if (/\.eth$/i.test(trimmed)) {
		return trimmed;
	}
	throw new Error('Enter a valid Ethereum address (0x...) or ENS name ending in .eth');
}

export async function resetBookingState(): Promise<BookingState> {
	const initial = createInitialState();
	await writeRawState(initial);
	return initial;
}

export async function registerWallet(member: string, address: string): Promise<BookingState> {
	assertMember(member);
	const state = await loadBookingState();

	state.wallet_addresses[member] = {
		address: assertWalletAddress(address),
		updated_at: new Date().toISOString()
	};

	await writeRawState(state);
	return state;
}
