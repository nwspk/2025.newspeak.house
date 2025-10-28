import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess, mdsvex({ extensions: ['.md'] })],
	kit: {
		adapter: adapter({
			fallback: '200.html'
		})
	},
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
