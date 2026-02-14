import { error } from '@sveltejs/kit';
import { getFellowBySlug } from '$lib/data/fellow-data.js';

export async function load({ params }) {
	const fellow = await getFellowBySlug(params.slug);

	if (!fellow) {
		error(404, { message: 'Fellow not found' });
	}

	return { fellow };
}
