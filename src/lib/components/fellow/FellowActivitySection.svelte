<script lang="ts">
	import type { CurrentActivity } from '$lib/data/fellow-types.js';

	interface Props {
		interests: string[];
		workingOn: string[];
		currentlyExploring: CurrentActivity[];
		readingListItemsPerPage?: number;
	}

	let {
		interests,
		workingOn,
		currentlyExploring,
		readingListItemsPerPage = 5
	}: Props = $props();

	let currentPage = $state(0);

	const totalPages = $derived(Math.ceil(currentlyExploring.length / readingListItemsPerPage));
	const currentReadingList = $derived(
		currentlyExploring.slice(
			currentPage * readingListItemsPerPage,
			(currentPage + 1) * readingListItemsPerPage
		)
	);
</script>

<div class="grid">
	<div class="left-col">
		{#if interests.length > 0}
			<div class="block">
				<h2 class="label">Interested in</h2>
				<div class="tags">
					{#each interests as interest}
						<span class="tag">{interest}</span>
					{/each}
				</div>
			</div>
		{/if}

		{#if workingOn.length > 0}
			<div class="block">
				<h2 class="label">Currently working on</h2>
				<ul class="list">
					{#each workingOn as item}
						<li><span class="bullet">&bull;</span><span>{item}</span></li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>

	<div class="right-col">
		<div class="block-header">
			<h2 class="label">Reading list</h2>
			{#if totalPages > 1}
				<div class="pagination">
					<button type="button" onclick={() => (currentPage = Math.max(0, currentPage - 1))} disabled={currentPage === 0} class="nav-btn" aria-label="Previous">
						&larr;
					</button>
					<span class="page-num">{currentPage + 1} / {totalPages}</span>
					<button
						type="button"
						onclick={() => (currentPage = Math.min(totalPages - 1, currentPage + 1))}
						disabled={currentPage >= totalPages - 1}
						class="nav-btn"
						aria-label="Next"
					>
						&rarr;
					</button>
				</div>
			{/if}
		</div>
		<div class="reading-list">
			{#each currentReadingList as activity}
				<div class="activity-item">
					<span class="emoji">{activity.emoji || '•'}</span>
					<div class="activity-content">
						{#if activity.url}
							<a href={activity.url} target="_blank" rel="noopener noreferrer" class="activity-link">
								{activity.title || activity.url}
							</a>
						{:else}
							<span class="activity-title">{activity.title}</span>
						{/if}
						{#if activity.description}
							<p class="activity-desc">{activity.description}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.left-col {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: 1fr 1fr;
			gap: 4rem;
		}
	}

	.label {
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(26, 26, 26, 0.5);
		margin: 0 0 0.5rem 0;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		padding: 0.25rem 0.75rem;
		background: rgba(26, 26, 26, 0.1);
		color: #1a1a1a;
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		border-radius: 2px;
	}

	.list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.list li {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.8);
		line-height: 1.5;
		margin-bottom: 0.375rem;
	}

	.bullet {
		color: rgba(26, 26, 26, 0.4);
	}

	.block-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.pagination {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-btn {
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
		color: #1a1a1a;
	}

	.nav-btn:hover:not(:disabled) {
		opacity: 0.8;
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.page-num {
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.6);
	}

	.reading-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.activity-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
	}

	.emoji {
		flex-shrink: 0;
		color: rgba(26, 26, 26, 0.6);
	}

	.activity-content {
		flex: 1;
		min-width: 0;
	}

	.activity-link {
		color: #1a1a1a;
		text-decoration: underline;
		word-break: break-all;
	}

	.activity-link:hover {
		opacity: 0.8;
	}

	.activity-title {
		color: #1a1a1a;
	}

	.activity-desc {
		margin: 0.125rem 0 0 0;
		color: rgba(26, 26, 26, 0.6);
		word-break: break-word;
	}
</style>
