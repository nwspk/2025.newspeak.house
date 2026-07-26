export const POOL_LEAD_DAYS = 2;
export const BOOKING_START_DATE = '2026-07-30';
export const BOOKING_STORE_KEY = `guest-room-bookings-${BOOKING_START_DATE}`;
export const IDENTITY_STORAGE_KEY = 'guest-room-identity';
export const SNAPSHOT_URL = 'https://snapshot.box/#/s:nwspk.eth';

export const ALLOCATION_ORDER = [
	'Asil Sidahmed',
	'Alex Pedori',
	'Martina Orlea',
	'Aadi Kulkarni',
	'Alexandra Ciocanel',
	'Chris Owen',
	'Connor Dunlop',
	'David Powell',
	'Davit Jintcharadze',
	'Emily Mayhew',
	'Fatima Sarah Khalid',
	'Francesca Galli',
	"Fred O'Brien",
	'Gamithra Marga',
	'Huda Abdirahim',
	'Jamie Coombes',
	'Nick Botti',
	'Tuna Acisu'
] as const;

export type CohortMember = (typeof ALLOCATION_ORDER)[number];

export type DayStatus = 'unconfirmed' | 'claimed' | 'pool' | 'trade_pending';

export type TradeStatus = 'pending' | 'accepted' | 'declined';

export type TradeType = 'day_swap' | 'irl_offer';

export interface DayState {
	allocated_to: CohortMember;
	holder: CohortMember | null;
	status: DayStatus;
	claimed_at: string | null;
}

interface TradeBase {
	id: string;
	initiator: CohortMember;
	counterpart: CohortMember;
	counterpart_date: string;
	irl_note: string;
	status: TradeStatus;
	created_at: string;
}

export interface DaySwapTrade extends TradeBase {
	type: 'day_swap';
	initiator_date: string;
}

export interface IrlOfferTrade extends TradeBase {
	type: 'irl_offer';
}

export type Trade = DaySwapTrade | IrlOfferTrade;

export interface BookingState {
	days: Record<string, DayState>;
	pool_claims: Record<string, CohortMember[]>;
	trades: Trade[];
	wallet_addresses: Partial<Record<CohortMember, WalletRegistration>>;
}

export interface WalletRegistration {
	address: string;
	updated_at: string;
}

export interface CalendarDay {
	date: string;
	label: string;
	dayNumber: number;
	monthLabel: string;
	weekday: string;
}

const START_DATE = new Date(`${BOOKING_START_DATE}T12:00:00`);

function dateKeyForAllocationIndex(index: number): string {
	const date = new Date(START_DATE);
	date.setDate(START_DATE.getDate() + index);
	return padDate(date);
}

function padDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function getBookingDates(): string[] {
	return ALLOCATION_ORDER.map((_, index) => dateKeyForAllocationIndex(index));
}

export function createInitialState(): BookingState {
	const days: Record<string, DayState> = {};

	for (const [index, member] of ALLOCATION_ORDER.entries()) {
		const date = new Date(START_DATE);
		date.setDate(START_DATE.getDate() + index);
		const dateKey = padDate(date);

		days[dateKey] = {
			allocated_to: member,
			holder: member,
			status: 'unconfirmed',
			claimed_at: null
		};
	}

	return {
		days,
		pool_claims: {},
		trades: [],
		wallet_addresses: {}
	};
}

export function formatCalendarDay(dateKey: string): CalendarDay {
	const date = new Date(`${dateKey}T12:00:00`);
	const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
	const monthLabel = date.toLocaleDateString('en-GB', { month: 'short' });

	return {
		date: dateKey,
		label: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
		dayNumber: date.getDate(),
		monthLabel,
		weekday
	};
}

export function getCalendarDays(): CalendarDay[] {
	return getBookingDates().map(formatCalendarDay);
}

export function getBookingPeriodLabel(): string {
	const dates = getBookingDates();
	if (dates.length === 0) return '';

	const first = formatCalendarDay(dates[0]);
	const last = formatCalendarDay(dates[dates.length - 1]);
	return `${first.monthLabel} ${first.dayNumber} – ${last.monthLabel} ${last.dayNumber}`;
}

export function getBookingStartLabel(): string {
	return new Date(`${BOOKING_START_DATE}T12:00:00`).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long'
	});
}

export function bookingToday(): Date {
	const today = new Date();
	today.setHours(12, 0, 0, 0);
	return today;
}

export function daysUntilDate(dateKey: string, today: Date = bookingToday()): number {
	const target = new Date(`${dateKey}T12:00:00`);
	return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isPastDate(dateKey: string): boolean {
	return daysUntilDate(dateKey) < 0;
}

function allocatedDateForMember(member: CohortMember): string | undefined {
	const index = ALLOCATION_ORDER.indexOf(member);
	if (index === -1) return undefined;
	return dateKeyForAllocationIndex(index);
}

export function getHeldDateForMember(
	state: BookingState,
	member: CohortMember
): string | undefined {
	for (const [dateKey, day] of Object.entries(state.days)) {
		if (day.holder === member) return dateKey;
	}

	return allocatedDateForMember(member);
}

export function getPendingTradesForDate(state: BookingState, dateKey: string): Trade[] {
	return state.trades.filter(
		(trade) =>
			trade.status === 'pending' &&
			((trade.type === 'day_swap' && trade.initiator_date === dateKey) ||
				trade.counterpart_date === dateKey)
	);
}

export function tradeSummary(trade: Trade): string {
	if (trade.type === 'irl_offer') {
		return `${trade.initiator} offered: ${trade.irl_note}`;
	}

	if (trade.irl_note.trim()) {
		return `${trade.initiator} wants to swap days · ${trade.irl_note}`;
	}

	return `${trade.initiator} wants to swap days`;
}
