<script lang="ts">
	import type { UpcomingEvent } from '$lib/data/fellow-types.js';

	interface Props {
		events?: UpcomingEvent[];
		itemsPerPage?: number;
	}

	let { events = [], itemsPerPage = 3 }: Props = $props();

	let currentPage = $state(0);

	const totalPages = $derived(Math.ceil(events.length / itemsPerPage));
	const startIndex = $derived(currentPage * itemsPerPage);
	const currentEvents = $derived(events.slice(startIndex, startIndex + itemsPerPage));

	function prev() {
		currentPage = Math.max(0, currentPage - 1);
	}

	function next() {
		currentPage = Math.min(totalPages - 1, currentPage + 1);
	}
</script>

{#if events.length > 0}
	<div class="section">
		<div class="header">
			<h2 class="label">Upcoming events</h2>
			{#if totalPages > 1}
				<div class="pagination">
					<button type="button" onclick={prev} disabled={currentPage === 0} class="nav-btn" aria-label="Previous">
						←
					</button>
					<span class="page-num">{currentPage + 1} / {totalPages}</span>
					<button
						type="button"
						onclick={next}
						disabled={currentPage >= totalPages - 1}
						class="nav-btn"
						aria-label="Next"
					>
						→
					</button>
				</div>
			{/if}
		</div>
		<div class="grid">
			{#each currentEvents as event}
				<div class="event-card">
					<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
						<line x1="16" y1="2" x2="16" y2="6" />
						<line x1="8" y1="2" x2="8" y2="6" />
						<line x1="3" y1="10" x2="21" y2="10" />
					</svg>
					<div class="event-content">
						{#if event.url}
							<a href={event.url} target="_blank" rel="noopener noreferrer" class="event-title">
								{event.title}
							</a>
						{:else}
							<p class="event-title">{event.title}</p>
						{/if}
						<p class="event-status">{event.status}</p>
					</div>
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

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.label {
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(26, 26, 26, 0.5);
		margin: 0;
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

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.event-card {
		border: 1px solid rgba(26, 26, 26, 0.2);
		background: rgba(255, 255, 255, 0.5);
		padding: 0.75rem;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		transition: background 0.2s;
	}

	.event-card:hover {
		background: rgba(255, 255, 255, 0.7);
	}

	.icon {
		flex-shrink: 0;
		color: rgba(26, 26, 26, 0.4);
		margin-top: 2px;
	}

	.event-content {
		flex: 1;
		min-width: 0;
	}

	.event-title {
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		color: #1a1a1a;
		line-height: 1.4;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.event-title a {
		text-decoration: underline;
	}

	.event-title a:hover {
		opacity: 0.8;
	}

	.event-status {
		font-size: 10px;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.6);
		margin: 0.25rem 0 0 0;
	}
</style>
