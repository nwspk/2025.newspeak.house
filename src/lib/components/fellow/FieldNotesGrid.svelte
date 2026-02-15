<script lang="ts">
	import type { FieldNote } from '$lib/data/fellow-types.js';
	import ContentDetailPanel from '$lib/components/ContentDetailPanel.svelte';

	interface Props {
		notes: FieldNote[];
		itemsPerPage?: number;
	}

	let { notes, itemsPerPage = 9 }: Props = $props();

	type ContentFilter = 'all' | 'field-note' | 'blog-post' | 'journal';

	let currentPage = $state(1);
	let filter = $state<ContentFilter>('all');
	let selectedNote = $state<FieldNote | null>(null);

	const filteredNotes = $derived(
		filter === 'all' ? notes : notes.filter((n) => n.contentType === filter)
	);
	const totalPages = $derived(Math.ceil(filteredNotes.length / itemsPerPage));
	const currentNotes = $derived(
		filteredNotes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	function setFilter(f: ContentFilter) {
		filter = f;
		currentPage = 1;
	}

	const typeLabels: Record<string, string> = {
		'field-note': 'FIELD-NOTE',
		'blog-post': 'BLOG-POST',
		journal: 'JOURNAL'
	};
</script>

<div class="section">
	<div class="header">
		<h2 class="title">/// PUBLICATIONS</h2>
		<div class="filters">
			{#each [['all', 'All'], ['field-note', 'Field Notes'], ['blog-post', 'Blog Posts'], ['journal', 'Journal']] as [value, label]}
				<button
					type="button"
					class="filter-btn"
					class:active={filter === value}
					onclick={() => setFilter(value as ContentFilter)}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>

	<div class="grid">
		{#each currentNotes as note}
			<button type="button" class="note-card" onclick={() => (selectedNote = note)}>
				<div class="note-meta">
					<span class="note-date">{note.date}</span>
					<span class="note-type type-{note.contentType}">
						{typeLabels[note.contentType] ?? note.contentType}
					</span>
				</div>
				<p class="note-title">{note.title}</p>
			</button>
		{/each}
	</div>

	<div class="pagination">
		<button type="button" onclick={() => (currentPage = Math.max(1, currentPage - 1))} disabled={currentPage === 1} class="page-btn">
			&larr; Prev
		</button>
		<span class="page-info">Page {currentPage} of {totalPages}</span>
		<button type="button" onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} class="page-btn">
			Next &rarr;
		</button>
	</div>
</div>

<ContentDetailPanel
	open={selectedNote !== null}
	title={selectedNote?.title}
	date={selectedNote?.date}
	onClose={() => (selectedNote = null)}
>
	{#if selectedNote}
		<div class="detail-content">
			{#if selectedNote.formattedBody}
				{@html selectedNote.formattedBody}
			{:else if selectedNote.rawBody}
				{@html selectedNote.rawBody.replace(/\n/g, '<br>')}
			{:else if selectedNote.content}
				{@html selectedNote.content.replace(/\n/g, '<br>')}
			{:else}
				<p>{selectedNote.summary ?? selectedNote.title}</p>
			{/if}
			{#if selectedNote.links && selectedNote.links.length > 0}
				<p class="links-section">
					<strong>Links:</strong><br />
					{#each selectedNote.links as link}
						<a href={link} target="_blank" rel="noopener noreferrer">{link}</a><br />
					{/each}
				</p>
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

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		color: #1a1a1a;
		margin: 0;
	}

	.filters {
		display: flex;
		gap: 0.5rem;
	}

	.filter-btn {
		height: 1.75rem;
		padding: 0 0.5rem;
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		background: transparent;
		border: 1px solid rgba(26, 26, 26, 0.3);
		cursor: pointer;
	}

	.filter-btn:hover {
		background: rgba(26, 26, 26, 0.05);
	}

	.filter-btn.active {
		background: #1a1a1a;
		color: #e8e8dc;
		border-color: #1a1a1a;
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

	.note-card {
		border: 1px solid rgba(26, 26, 26, 0.2);
		background: rgba(255, 255, 255, 0.5);
		padding: 0.75rem;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s;
		min-width: 0;
		overflow: hidden;
	}

	.note-card:hover {
		background: rgba(26, 26, 26, 0.05);
	}

	.note-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.note-date {
		font-size: 10px;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.5);
	}

	.note-type {
		font-size: 9px;
		font-family: 'IBM Plex Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.5rem;
		border-radius: 2px;
		color: white;
	}

	.note-type.type-field-note { background: #8B7355; }
	.note-type.type-blog-post  { background: #5B7B8F; }
	.note-type.type-journal    { background: #7B6B8F; }

	.note-title {
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

	.pagination {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-top: 0.5rem;
	}

	.page-btn {
		height: 1.75rem;
		padding: 0 0.75rem;
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		background: transparent;
		border: 1px solid rgba(26, 26, 26, 0.3);
		cursor: pointer;
	}

	.page-btn:hover:not(:disabled) {
		background: rgba(26, 26, 26, 0.05);
	}

	.page-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.page-info {
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.6);
	}

	.detail-content {
		white-space: pre-wrap;
	}

	.detail-content :global(a) {
		word-break: break-all;
	}

	.links-section {
		margin-top: 1.5rem;
	}
</style>
