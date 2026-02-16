import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Fellow slugs to prerender (from cohort + matrix export config)
const fellowSlugs = [
	'fatima',
	'alex-pedori',
	'alexandra-ciocanel',
	'asil-sidahmed',
	'chris-owen',
	'connordunlop',
	'david-powell',
	'emily-mayhew',
	'francesca-galli',
	'frederick-obrien',
	'gamithra-marga',
	'martina-orlea',
	'tuna-acisu'
];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess, mdsvex({ extensions: ['.md'] })],
	kit: {
		adapter: adapter({
			fallback: '200.html'
		}),
		prerender: {
			entries: fellowSlugs.map((s) => `/fellow/${s}`),
			handleUnseenRoutes: 'warn'
		},
		experimental: {
			remoteFunctions: true
		}
	},
	extensions: ['.svelte', '.svx', '.md'],
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
