import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess, mdsvex({ extensions: ['.md'] })],
	kit: {
		adapter: adapter({
			fallback: '200.html'
		}),
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
