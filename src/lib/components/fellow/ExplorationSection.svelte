<script lang="ts">
	import type { ExplorationItem } from '$lib/data/fellow-types.js';
	import ContentDetailPanel from '$lib/components/ContentDetailPanel.svelte';

	interface Props {
		items: ExplorationItem[];
	}

	let { items }: Props = $props();
	let selectedItem = $state<ExplorationItem | null>(null);

	function stripFirstHeading(html: string): string {
		return html.replace(/^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>\s*/i, '').trim();
	}
</script>

{#if items.length > 0}
	<div class="section">
		<div class="title-row">
			<div class="accent-bar"></div>
			<h2 class="title">/// EXPLORATION</h2>
		</div>
		<div class="grid">
			{#each items as item}
				<button type="button" class="card border-{item.kind}" onclick={() => (selectedItem = item)}>
					<div class="card-meta">
						<span class="card-date">{item.date}</span>
						<span class="card-kind kind-{item.kind}">{item.kind.toUpperCase()}</span>
					</div>
					<p class="card-title">{item.title}</p>
				</button>
			{/each}
		</div>
	</div>
{/if}

<ContentDetailPanel
	open={selectedItem !== null}
	title={selectedItem?.title}
	date={selectedItem?.date}
	contentType={selectedItem?.kind}
	emoji={selectedItem?.emoji}
	onClose={() => (selectedItem = null)}
>
	{#if selectedItem}
		<div class="detail-content">
			{#if selectedItem.formattedBody}
				{@html stripFirstHeading(selectedItem.formattedBody)}
			{:else if selectedItem.content}
				{@html selectedItem.content.replace(/\n/g, '<br>')}
			{:else}
				<p>{selectedItem.title}</p>
			{/if}
			{#if selectedItem.threadReplies && selectedItem.threadReplies.length > 0}
				<div class="thread">
					<h3 class="thread-heading">Thread</h3>
					{#each selectedItem.threadReplies as reply}
						<div class="thread-reply">
							{#if reply.formattedBody}
								{@html reply.formattedBody}
							{:else}
								{@html reply.body.replace(/\n/g, '<br>')}
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</ContentDetailPanel>

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
		background: #7B6B8F;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		color: #1a1a1a;
		margin: 0;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (min-width: 1024px) {
		.grid { grid-template-columns: repeat(3, 1fr); }
	}

	.card {
		border: 1px solid rgba(26, 26, 26, 0.2);
		border-left: 4px solid #7B6B8F;
		background: rgba(255, 255, 255, 0.5);
		padding: 0.75rem;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s;
		min-width: 0;
		overflow: hidden;
	}

	.card.border-question { border-left-color: #7B6B8F; }
	.card.border-idea     { border-left-color: #6B8B7F; }

	.card:hover {
		background: rgba(26, 26, 26, 0.05);
	}

	.card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.card-date {
		font-size: 10px;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.5);
	}

	.card-kind {
		font-size: 9px;
		font-family: 'IBM Plex Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.5rem;
		border-radius: 2px;
		color: white;
	}

	.card-kind.kind-question { background: #7B6B8F; }
	.card-kind.kind-idea     { background: #6B8B7F; }

	.card-title {
		font-size: 0.875rem;
		font-family: 'IBM Plex Mono', monospace;
		color: #1a1a1a;
		line-height: 1.4;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
	}

	.detail-content {
		white-space: pre-wrap;
	}

	.detail-content :global(a) {
		word-break: break-all;
	}

	.thread {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(26, 26, 26, 0.2);
	}

	.thread-heading {
		font-size: 0.875rem;
		font-weight: 600;
		font-family: 'IBM Plex Mono', monospace;
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(26, 26, 26, 0.7);
	}

	.thread-reply {
		padding: 1rem 0;
		border-bottom: 1px solid rgba(26, 26, 26, 0.1);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.thread-reply:last-child {
		border-bottom: none;
	}

	.thread-reply :global(blockquote) {
		border-left: 3px solid rgba(26, 26, 26, 0.3);
		padding-left: 1rem;
		margin: 0.5rem 0;
		font-style: italic;
		color: rgba(26, 26, 26, 0.8);
	}
</style>
