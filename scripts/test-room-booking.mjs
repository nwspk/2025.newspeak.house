#!/usr/bin/env node

const BASE = process.env.ROOM_BOOKING_URL ?? 'http://localhost:5173/api/room-booking';

const A = 'Huda Abdirahim';
const B = 'Jamie Coombes';
const C = 'Nick Botti';
const dayA = '2026-07-27';
const dayB = '2026-07-28';
const dayC = '2026-07-29';

let passed = 0;
let failed = 0;

function assert(condition, message) {
	if (condition) {
		passed += 1;
		console.log(`  ✓ ${message}`);
	} else {
		failed += 1;
		console.error(`  ✗ ${message}`);
	}
}

async function api(body) {
	const response = await fetch(BASE, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const result = await response.json();
	return { response, result };
}

function holder(state, date) {
	return state.days[date].holder;
}

function pendingTrade(state) {
	return state.trades.find((trade) => trade.status === 'pending');
}

async function run() {
	console.log(`Testing room booking API at ${BASE}\n`);

	let { response, result } = await api({ action: 'reset' });
	assert(response.ok && result.ok, 'reset');
	let state = result.state;

	// claim
	({ result } = await api({ action: 'claim', date: dayA, member: A }));
	state = result.state;
	assert(holder(state, dayA) === A && state.days[dayA].status === 'claimed', 'claim day A');

	({ response, result } = await api({ action: 'claim', date: dayB, member: A }));
	assert(!response.ok, 'reject claim for day allocated to someone else');

	({ result } = await api({ action: 'claim', date: dayB, member: B }));
	({ result } = await api({ action: 'claim', date: dayC, member: C }));
	state = result.state;
	assert(holder(state, dayC) === C, 'claim day C');

	// reject invalid wallet
	({ response, result } = await api({
		action: 'register_wallet',
		member: A,
		address: 'not-an-address'
	}));
	assert(!response.ok, 'reject invalid wallet address');

	// register wallet (0x)
	({ result } = await api({
		action: 'register_wallet',
		member: A,
		address: '0x1234567890123456789012345678901234567890'
	}));
	state = result.state;
	assert(state.wallet_addresses[A]?.address.startsWith('0x'), 'register wallet (0x)');

	// register ENS
	({ result } = await api({
		action: 'register_wallet',
		member: B,
		address: 'nwspk.eth'
	}));
	state = result.state;
	assert(state.wallet_addresses[B]?.address === 'nwspk.eth', 'register ENS name');

	// day swap A <-> B
	({ result } = await api({
		action: 'trade_request',
		type: 'day_swap',
		initiator: A,
		initiator_date: dayA,
		counterpart: B,
		counterpart_date: dayB,
		irl_note: ''
	}));
	state = result.state;
	let trade = pendingTrade(state);
	assert(trade && state.days[dayA].status === 'trade_pending', 'request day swap');

	({ result } = await api({
		action: 'trade_respond',
		trade_id: trade.id,
		responder: B,
		accept: true
	}));
	state = result.state;
	assert(holder(state, dayA) === B && holder(state, dayB) === A, 'accept day swap A<->B');

	// A (now on dayB) trades with C — must use held day dayB
	({ result } = await api({
		action: 'trade_request',
		type: 'day_swap',
		initiator: A,
		initiator_date: dayB,
		counterpart: C,
		counterpart_date: dayC,
		irl_note: ''
	}));
	state = result.state;
	trade = pendingTrade(state);
	assert(trade, 'request second day swap using held day');

	({ result } = await api({
		action: 'trade_respond',
		trade_id: trade.id,
		responder: C,
		accept: true
	}));
	state = result.state;
	assert(holder(state, dayB) === C && holder(state, dayC) === A, 'accept day swap A<->C after prior swap');

	// cannot offer a day you do not hold
	({ response, result } = await api({
		action: 'trade_request',
		type: 'day_swap',
		initiator: A,
		initiator_date: dayA,
		counterpart: B,
		counterpart_date: dayB,
		irl_note: ''
	}));
	assert(!response.ok, 'reject trade for day initiator does not hold');

	// decline trade
	({ result } = await api({ action: 'reset' }));
	({ result } = await api({ action: 'claim', date: dayA, member: A }));
	({ result } = await api({ action: 'claim', date: dayB, member: B }));
	({ result } = await api({
		action: 'trade_request',
		type: 'day_swap',
		initiator: A,
		initiator_date: dayA,
		counterpart: B,
		counterpart_date: dayB,
		irl_note: ''
	}));
	trade = pendingTrade(result.state);
	({ result } = await api({
		action: 'trade_respond',
		trade_id: trade.id,
		responder: B,
		accept: false
	}));
	state = result.state;
	assert(holder(state, dayA) === A && holder(state, dayB) === B, 'decline trade restores holders');

	// release to pool
	({ result } = await api({ action: 'swap', date: dayA, member: A }));
	state = result.state;
	assert(state.days[dayA].status === 'pool' && holder(state, dayA) === null, 'release to pool');

	// pool interest
	({ result } = await api({ action: 'claim', date: dayA, member: B }));
	state = result.state;
	assert(state.pool_claims[dayA]?.includes(B), 'join pool');

	({ result } = await api({ action: 'claim', date: dayA, member: C }));
	state = result.state;
	assert(state.pool_claims[dayA]?.length === 2, 'multiple pool interests');

	// irl offer
	({ result } = await api({ action: 'reset' }));
	({ result } = await api({ action: 'claim', date: dayB, member: B }));
	({ result } = await api({
		action: 'trade_request',
		type: 'irl_offer',
		initiator: A,
		counterpart: B,
		counterpart_date: dayB,
		irl_note: 'pizza night'
	}));
	state = result.state;
	trade = pendingTrade(state);
	assert(trade?.type === 'irl_offer', 'irl offer request');

	({ result } = await api({
		action: 'trade_respond',
		trade_id: trade.id,
		responder: B,
		accept: true
	}));
	state = result.state;
	assert(holder(state, dayB) === A, 'accept irl offer transfers day to initiator');

	function tomorrowKey() {
		const date = new Date();
		date.setDate(date.getDate() + 1);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	// pool auto-assign: sole claimant on the day before
	const tomorrow = tomorrowKey();
	({ result } = await api({ action: 'reset' }));
	state = result.state;
	if (state.days[tomorrow]) {
		({ result } = await api({ action: 'claim', date: tomorrow, member: A }));
		state = result.state;
		const tomorrowDay = state.days[tomorrow];
		if (tomorrowDay.status === 'claimed' && tomorrowDay.holder === A) {
			assert(true, 'pool auto-assign sole claimant on day before');
		} else {
			assert(
				tomorrowDay.status === 'pool' && state.pool_claims[tomorrow]?.includes(A),
				'pool interest when auto-assign does not apply yet'
			);
		}
	} else {
		console.log('  - skip pool auto-assign (tomorrow outside booking window)');
	}

	// reject mutations on past days
	const yesterday = (() => {
		const date = new Date();
		date.setDate(date.getDate() - 1);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	})();
	if (state.days[yesterday]) {
		({ response } = await api({ action: 'claim', date: yesterday, member: A }));
		assert(!response.ok, 'reject claim on past day');
	}

	// getHeldDateForMember logic (imported check via API behavior already covered)

	console.log(`\n${passed} passed, ${failed} failed`);
	process.exit(failed > 0 ? 1 : 0);
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
