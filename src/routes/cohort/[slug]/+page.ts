import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	try {
		const profile = await import(`../../../lib/cohort-profiles/${params.slug}.md`);
		return {
			pageTitle: profile.metadata?.title ?? params.slug,
			pageDescription: profile.metadata?.description ?? '',
			pageContent: profile.default
		};
	} catch {
		throw error(404, 'Profile not found');
	}
};
