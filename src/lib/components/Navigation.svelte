<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/library', label: 'Library' },
		{ href: '/guest-room', label: 'Guest Room' },
		{ href: '/contact', label: 'Contact' }
	];

	let menuOpen = $state(false);

	function isActive(pathname: string, href: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(href + '/');
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<div class="container">
	<a href="/" class="logo">
		<span class="book-icon">📖</span>
		<div class="logo-text">
			<span class="main-title">NEWSPEAK HOUSE</span>
			<span class="sub-title">25/26</span>
		</div>
	</a>
	<button
		class="hamburger"
		class:open={menuOpen}
		onclick={() => (menuOpen = !menuOpen)}
		aria-label={menuOpen ? 'Close menu' : 'Open menu'}
		aria-expanded={menuOpen}
	>
		<span></span>
		<span></span>
		<span></span>
	</button>
	<nav class="breadcrumb-nav" class:open={menuOpen}>
		{#each navItems as item}
			<a href={item.href} class="nav-link" class:active={isActive($page.url.pathname, item.href)} onclick={closeMenu}>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
</div>

<style>
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

	.breadcrumb-nav {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0;
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

	.nav-link.active {
		color: #d62828;
		font-weight: 600;
	}

	/* Hamburger - hidden on desktop */
	.hamburger {
		display: none;
	}

	@media (max-width: 768px) {
		.hamburger {
			display: flex;
			flex-direction: column;
			justify-content: center;
			gap: 5px;
			width: 36px;
			height: 36px;
			padding: 6px;
			background: none;
			border: none;
			cursor: pointer;
			z-index: 110;
			transition: transform 0.2s ease;
		}

		.hamburger span {
			display: block;
			width: 100%;
			height: 2px;
			background: #1a1a1a;
			border-radius: 1px;
			transition: transform 0.3s ease, opacity 0.2s ease;
		}

		.hamburger.open span:nth-child(1) {
			transform: translateY(7px) rotate(45deg);
		}

		.hamburger.open span:nth-child(2) {
			opacity: 0;
		}

		.hamburger.open span:nth-child(3) {
			transform: translateY(-7px) rotate(-45deg);
		}

		.container {
			flex-wrap: wrap;
			padding: 1.5rem;
			gap: 1rem;
			align-items: center;
		}

		.breadcrumb-nav {
			flex-direction: column;
			gap: 0.75rem;
			align-items: flex-start;
			width: 100%;
			max-height: 0;
			overflow: hidden;
			opacity: 0;
			transition: max-height 0.35s ease, opacity 0.25s ease;
		}

		.breadcrumb-nav.open {
			max-height: 300px;
			opacity: 1;
		}

		.nav-link {
			border-right: none;
			padding: 0.5rem 0;
			font-size: 1rem;
		}
	}
</style>
