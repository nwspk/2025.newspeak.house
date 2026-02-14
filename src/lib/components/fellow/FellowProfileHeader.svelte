<script lang="ts">
	interface Props {
		name: string;
		avatar: string;
		bio: string;
		socialLinks: {
			linkedin?: string;
			twitter?: string;
			bluesky?: string;
			github?: string;
			mastodon?: string;
			website?: string;
		};
	}

	let { name, avatar, bio, socialLinks }: Props = $props();

	const hasLinks = $derived(
		!!(
			(socialLinks.twitter && socialLinks.twitter.trim()) ||
			(socialLinks.bluesky && socialLinks.bluesky.trim()) ||
			(socialLinks.github && socialLinks.github.trim()) ||
			(socialLinks.linkedin && socialLinks.linkedin.trim()) ||
			(socialLinks.mastodon && socialLinks.mastodon.trim()) ||
			(socialLinks.website && socialLinks.website.trim())
		)
	);
</script>

<div class="space-y-4">
	<div class="avatar-wrap">
		{#if avatar}
			<img src={avatar} alt={name} class="avatar-img" />
		{:else}
			<span class="avatar-fallback">{name.charAt(0)}</span>
		{/if}
	</div>

	<div class="bio-block">
		<h1 class="name">{name}</h1>
		<p class="bio">{bio}</p>
		<a
			href="https://matrix.to"
			target="_blank"
			rel="noopener noreferrer"
			class="matrix-button"
		>
			<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
			</svg>
			Chat with me on Matrix!
		</a>
	</div>

	{#if hasLinks}
	<div class="links">
		<span class="links-label">LINKS: ACTIVE</span>
		<span class="links-sep">·</span>
		{#if socialLinks.twitter && socialLinks.twitter.trim()}
			<a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" class="link">TWITTER</a>
		{/if}
		{#if socialLinks.twitter && socialLinks.bluesky}
			<span class="links-sep">·</span>
		{/if}
		{#if socialLinks.bluesky && socialLinks.bluesky.trim()}
			<a href={socialLinks.bluesky} target="_blank" rel="noopener noreferrer" class="link">BLUESKY</a>
		{/if}
		{#if socialLinks.bluesky && socialLinks.github}
			<span class="links-sep">·</span>
		{/if}
		{#if socialLinks.github && socialLinks.github.trim()}
			<a href={socialLinks.github} target="_blank" rel="noopener noreferrer" class="link">GITHUB</a>
		{/if}
		{#if socialLinks.github && socialLinks.linkedin}
			<span class="links-sep">·</span>
		{/if}
		{#if socialLinks.linkedin && socialLinks.linkedin.trim()}
			<a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" class="link">LINKEDIN</a>
		{/if}
		{#if socialLinks.mastodon && socialLinks.mastodon.trim()}
			{#if socialLinks.linkedin}
				<span class="links-sep">·</span>
			{/if}
			<a href={socialLinks.mastodon} target="_blank" rel="noopener noreferrer" class="link">MASTODON</a>
		{/if}
		{#if socialLinks.website && socialLinks.website.trim()}
			{#if socialLinks.linkedin || socialLinks.mastodon}
				<span class="links-sep">·</span>
			{/if}
			<a href={socialLinks.website} target="_blank" rel="noopener noreferrer" class="link">WEBSITE</a>
		{/if}
	</div>
	{/if}
</div>

<style>
	.space-y-4 {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.avatar-wrap {
		width: 4rem;
		height: 4rem;
		border: 1px solid rgba(26, 26, 26, 0.2);
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(26, 26, 26, 0.08);
		flex-shrink: 0;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-fallback {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.bio-block {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.name {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		font-family: 'Crimson Pro', serif;
	}

	.bio {
		font-size: 0.75rem;
		line-height: 1.6;
		color: rgba(26, 26, 26, 0.7);
		max-width: 48rem;
		margin: 0;
		font-family: 'IBM Plex Mono', monospace;
	}

	.matrix-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		align-self: flex-start;
		background: #1a1a1a;
		color: #e8e8dc;
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition: background 0.2s;
	}

	.matrix-button:hover {
		background: rgba(26, 26, 26, 0.9);
	}

	.icon {
		flex-shrink: 0;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
	}

	.links-label {
		font-size: 10px;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.links-sep {
		color: rgba(26, 26, 26, 0.3);
	}

	.link {
		font-size: 10px;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-decoration: underline;
	}

	.link:hover {
		color: #1a1a1a;
	}
</style>
