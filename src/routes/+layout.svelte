<script lang="ts">
	import '$lib/styles/reset.css';
	import '$lib/styles/main.css';

	import favicon from '$lib/assets/favicon.jpeg';
	import { page } from '$app/state';

	let { children } = $props();

	let isHome = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>NWSPK 25/26</title>
	<meta name="description" content="Newspeak House Fellowship 2025/26" />
</svelte:head>

<div class:chalkboard={isHome}>
	<header class:chalkboard={!isHome}>
		<a href="/"><h1 style="transform: rotate({Math.random() * 4 - 2}deg);">NWSPK 25/26</h1></a>
	</header>

	<main>
		{@render children?.()}
	</main>
</div>

<style>
	header {
		font-family: 'Chalk', cursive;
		text-align: center;
		padding: 2rem 0 1rem 0;
	}
	h1 {
		font-size: 3rem;
		margin: 0 0 2rem 0;
		color: hsl(200, 24%, 85%);
	}
	a {
		text-decoration: none;
	}
	main {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}
</style>
