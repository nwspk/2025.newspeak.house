import type { PageServerLoad } from './$types';
import { loadBookingState } from '$lib/server/room-booking-store';
import {
	ALLOCATION_ORDER,
	POOL_LEAD_DAYS,
	SNAPSHOT_URL,
	getCalendarDays
} from '$lib/data/room-booking';

export const prerender = false;

export const load: PageServerLoad = async () => {
	const state = await loadBookingState();

	return {
		state,
		members: [...ALLOCATION_ORDER],
		calendarDays: getCalendarDays(),
		poolLeadDays: POOL_LEAD_DAYS,
		snapshotUrl: SNAPSHOT_URL
	};
};
