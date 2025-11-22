<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/reset.css';
	import '$lib/styles/main.css';

	import favicon from '$lib/assets/favicon.jpeg';

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
</svelte:head>

<header class:scrolled>
	<div class="container">
		<a href="/" class="logo">
			<span class="book-icon">📖</span>
			<div class="logo-text">
				<span class="main-title">NEWSPEAK HOUSE</span>
				<span class="sub-title">25/26</span>
			</div>
		</a>
		<nav>
			<a href="/library" class="nav-link">
				<span class="icon">📚</span>
				<span>Library</span>
			</a>
			<a href="/guest-room" class="nav-link">
				<span class="icon">🏠</span>
				<span>Guest Room</span>
			</a>
			<!-- <a href="/weblog" class="nav-link">
				<span class="icon">📝</span>
				<span>Weblog</span>
			</a> -->
			<a href="/contact" class="nav-link">
				<span class="icon">📡</span>
				<span>Contact</span>
			</a>
		</nav>
	</div>
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

	.container {
		padding: 1.5rem 2.5rem;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 3rem;
		width: 100%;
	}

	.logo {
		display: flex;
		align-items: baseline;
		text-decoration: none;
		transition: transform 0.2s ease;
	}

	.logo:hover {
		transform: translateX(3px);
	}

	.book-icon {
		display: none;
	}

	.logo-text {
		display: flex;
		flex-direction: column;
		line-height: 1;
	}

	.main-title {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: #1a1a1a;
		font-family: 'Crimson Pro', serif;
		font-style: italic;
	}

	.sub-title {
		font-size: 0.8rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		color: #666;
		margin-top: 0.35rem;
		font-family: 'IBM Plex Mono', monospace;
	}

	nav {
		display: none;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: #1a1a1a;
		font-size: 0.85rem;
		font-weight: 500;
		transition: color 0.15s ease;
		letter-spacing: 0.02em;
		position: relative;
		padding: 0 1rem;
		border-right: 1px solid #e0e0e0;
	}

	.nav-link:first-child {
		padding-left: 0;
	}

	.nav-link:last-child {
		border-right: none;
	}

	.nav-link:hover {
		color: #d62828;
	}

	.nav-link .icon {
		display: none;
	}

	@media (max-width: 768px) {
		.container {
			flex-direction: column;
			padding: 1.5rem;
			gap: 1.5rem;
			align-items: flex-start;
		}

		nav {
			flex-direction: column;
			gap: 0.75rem;
			align-items: flex-start;
		}

		.nav-link {
			border-right: none;
			padding: 0;
		}
	}

	main {
		padding: 0;
		margin: 0;
		background: transparent;
		min-height: calc(100vh - 200px);
		position: relative;
		width: 100%;
	}
</style>
