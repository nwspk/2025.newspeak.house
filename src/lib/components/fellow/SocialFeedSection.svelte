<script lang="ts">
	import type { SocialPost } from '$lib/data/fellow-types.js';

	interface Props {
		posts?: SocialPost[];
	}

	let { posts = [] }: Props = $props();
</script>

{#if posts.length > 0}
	<div class="section">
		<div class="title-row">
			<div class="accent-bar"></div>
			<h2 class="title">/// WHAT I'M UP TO</h2>
		</div>
		<div class="posts">
			{#each posts as post}
				<div class="post-card platform-{post.platform ?? 'default'}">
					<div class="post-header">
						<span class="post-date">{post.date}</span>
						{#if post.platform}
							<span class="post-platform platform-badge-{post.platform}">
								{post.platform}
							</span>
						{/if}
					</div>
					{#if post.url}
						<a href={post.url} target="_blank" rel="noopener noreferrer" class="post-content">
							{post.content}
						</a>
					{:else}
						<p class="post-content">{post.content}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.accent-bar {
		width: 4px;
		height: 1.5rem;
		border-radius: 2px;
		background: var(--color-teal);
	}

	.title {
		font-size: 1.25rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		color: #1a1a1a;
		margin: 0;
	}

	.posts {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.post-card {
		border: 1px solid rgba(26, 26, 26, 0.2);
		border-left: 4px solid var(--color-gold);
		background: rgba(255, 255, 255, 0.5);
		padding: 1rem;
	}

	.post-card.platform-twitter  { border-left-color: var(--color-navy); }
	.post-card.platform-bluesky  { border-left-color: var(--color-teal); }
	.post-card.platform-linkedin { border-left-color: var(--color-coral); }
	.post-card.platform-mastodon { border-left-color: var(--color-orange); }

	.post-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.post-date {
		font-size: 10px;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.5);
	}

	.post-platform {
		font-size: 9px;
		font-family: 'IBM Plex Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.5rem;
		border-radius: 2px;
	}

	.post-platform.platform-badge-twitter  { background: rgba(29, 161, 242, 0.1); color: #1DA1F2; }
	.post-platform.platform-badge-bluesky  { background: rgba(0, 133, 255, 0.1);  color: #0085FF; }
	.post-platform.platform-badge-mastodon { background: rgba(99, 100, 255, 0.1);  color: #6364FF; }
	.post-platform.platform-badge-linkedin { background: rgba(10, 102, 194, 0.1);  color: #0A66C2; }

	.post-content {
		font-size: 0.875rem;
		font-family: 'IBM Plex Mono', monospace;
		color: #1a1a1a;
		line-height: 1.6;
		margin: 0;
		text-decoration: none;
		display: block;
	}

	.post-content:hover {
		opacity: 0.8;
	}
</style>
