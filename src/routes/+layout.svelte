<script lang="ts">
	import favicon from '$lib/assets/favicon.jpeg';
	import '$lib/styles/main.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>NWSPK 25/26</title>
	<meta name="description" content="Newspeak House Fellowship 2025/26" />
</svelte:head>

<a href="/"><h1>NWSPK 25/26</h1></a>

{@render children?.()}

<style>
	a {
		text-decoration: none;
	}
</style>
