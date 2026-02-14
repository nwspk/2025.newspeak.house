<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/library', label: 'Library' },
		{ href: '/guest-room', label: 'Guest Room' },
		{ href: '/contact', label: 'Contact' }
	];

	function isActive(pathname: string, href: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(href + '/');
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
	<nav class="breadcrumb-nav">
		{#each navItems as item}
			<a href={item.href} class="nav-link" class:active={isActive($page.url.pathname, item.href)}>
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

	@media (max-width: 768px) {
		.container {
			flex-direction: column;
			padding: 1.5rem;
			gap: 1.5rem;
			align-items: flex-start;
		}

		.breadcrumb-nav {
			flex-direction: column;
			gap: 0.75rem;
			align-items: flex-start;
		}

		.nav-link {
			border-right: none;
			padding: 0;
		}
	}
</style>
