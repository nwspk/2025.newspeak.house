import { redirect } from '@sveltejs/kit';

export function load() {
	throw redirect(302, 'https://newspeakfellowship2025.substack.com/');
}
