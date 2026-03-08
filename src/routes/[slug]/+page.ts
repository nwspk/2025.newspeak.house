import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';

const staticPages = import.meta.glob<{
	metadata: { title: string; description: string };
	default: Component;
}>('../../lib/static-pages/*.md');

export const load = async ({ params }) => {
	// Normalize slug: strip .md/.json suffix so /deliberation-summary.md doesn't become .md.md
	const slug = params.slug.replace(/\.(md|json)$/, '');
	// Only serve markdown pages; .json etc. return 404
	if (params.slug.endsWith('.json')) {
		throw error(404, 'Not found');
	}

	// Glob keys vary by environment; find one that ends with /slug.md
	const pathKey = Object.keys(staticPages).find((k) => k.endsWith(`/${slug}.md`));
	const loader = pathKey ? staticPages[pathKey] : null;
	if (!loader) {
		throw error(404, 'Not found');
	}

	const page = await loader();
	const pageTitle: string = page.metadata.title;
	const pageDescription: string = page.metadata.description;
	const pageContent: Component = page.default;

	return { pageTitle, pageDescription, pageContent };
};
