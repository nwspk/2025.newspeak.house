<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/reset.css';
	import '$lib/styles/main.css';

	import favicon from '$lib/assets/newspeak-logo.png';
	import cohortGroupPhoto from '$lib/assets/cohort-group-photo.JPEG';
	import Navigation from '$lib/components/Navigation.svelte';

	const SITE_ORIGIN = 'https://2025.newspeak.house';

	let { children } = $props();
	let scrolled = $state(false);

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 20;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Newspeak House 25/26</title>
	<meta name="description" content="Newspeak House Fellowship 2025/26" />
	<!-- Link preview / thumbnail: cohort group photo -->
	<meta property="og:image" content={SITE_ORIGIN + cohortGroupPhoto} />
	<meta property="og:title" content="Newspeak House 25/26" />
	<meta property="og:description" content="Newspeak House Fellowship 2025/26" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={SITE_ORIGIN + cohortGroupPhoto} />
</svelte:head>

<header class:scrolled>
	<Navigation />
</header>

<main>
	{@render children?.()}
</main>

<style>
	header {
		background: rgba(180, 180, 160, 0.4);
		backdrop-filter: blur(10px);
		border-bottom: 2px solid rgba(26, 26, 26, 0.2);
		position: sticky;
		top: 0;
		z-index: 100;
		transition: all 0.3s ease;
		width: 100%;
	}

	header.scrolled {
		background: rgba(180, 180, 160, 0.7);
		backdrop-filter: blur(20px);
		border-bottom-color: rgba(26, 26, 26, 0.4);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	header::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 12%;
		height: 2px;
		background: #d62828;
		transition: width 0.3s ease;
	}

	header.scrolled::after {
		width: 8%;
	}

	main {
		padding: 0;
		margin: 0;
		background: transparent;
		height: calc(100vh - 100px);
		overflow-y: auto;
		position: relative;
		width: 100%;
	}
</style>
