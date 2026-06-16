import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	claimDay,
	loadBookingState,
	registerWallet,
	requestTrade,
	resetBookingState,
	respondToTrade,
	swapDay
} from '$lib/server/room-booking-store';

export const prerender = false;

export const GET: RequestHandler = async () => {
	try {
		const state = await loadBookingState();
		return json({ ok: true, state });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load booking state';
		return json({ ok: false, error: message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const action = body.action as string;

		let state;

		switch (action) {
			case 'claim':
				state = await claimDay(body.date, body.member);
				break;
			case 'swap':
				state = await swapDay(body.date, body.member);
				break;
			case 'trade_request':
				state = await requestTrade({
					type: body.type,
					initiator: body.initiator,
					initiator_date: body.initiator_date,
					counterpart: body.counterpart,
					counterpart_date: body.counterpart_date,
					irl_note: body.irl_note
				});
				break;
			case 'trade_respond':
				state = await respondToTrade(body.trade_id, body.responder, Boolean(body.accept));
				break;
			case 'register_wallet':
				state = await registerWallet(body.member, body.address);
				break;
			case 'reset':
				if (!dev) {
					return json({ ok: false, error: 'Reset is only available in development' }, { status: 403 });
				}
				state = await resetBookingState();
				break;
			default:
				return json({ ok: false, error: 'Unknown action' }, { status: 400 });
		}

		return json({ ok: true, state });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Request failed';
		return json({ ok: false, error: message }, { status: 400 });
	}
};
