import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess, mdsvex({ extensions: ['.md'] })],
	kit: {
<<<<<<< HEAD
		adapter: adapter({
			fallback: '200.html'
		}),
		experimental: {
			remoteFunctions: true
		}
=======
		adapter: adapter()
>>>>>>> e726657f458fce3bd3114828ecf2302365a26b00
	},
	extensions: ['.svelte', '.svx', '.md'],
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
