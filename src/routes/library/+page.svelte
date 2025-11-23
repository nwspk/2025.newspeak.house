<script lang="ts">
	import LibraryBookInfoCard from '$lib/components/LibraryBookInfoCard.svelte';
	import LibraryGenreTag from '$lib/components/LibraryGenreTag.svelte';
	import { genreColors } from '$lib/styles';

	interface Book {
		title: string;
		description: string;
		authors: string;
		genre: string;
	}

	let { data }: { data: { books: Book[] } } = $props();

	let books = data.books;

	let searchTerm = $state('');
	let selectedGenre: string | undefined = $state(undefined);
	let displayedBooks = $derived(
		books.filter(
			(book) =>
				(book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					book.authors.toLowerCase().includes(searchTerm.toLowerCase())) &&
				(selectedGenre ? book.genre === selectedGenre : true)
		)
	);
	let showGenreFilters = $state(false);
</script>

<div class="info-and-interface-container">
	<h2>Library</h2>

	<p>
		The Newspeak House library has ( around ) <span class="book-count">{books.length}</span> books. Perhaps
		you'd like to read one.
	</p>

	<input type="text" bind:value={searchTerm} placeholder="Search books..." />

	<div
		class="toggle-genre-filters"
		onclick={() => (showGenreFilters = !showGenreFilters)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				showGenreFilters = !showGenreFilters;
			}
		}}
		tabindex="0"
		role="button"
	>
		{showGenreFilters ? 'Hide' : 'Show'} genre filters {showGenreFilters ? '▲' : '▼'}
	</div>
	{#if selectedGenre && !showGenreFilters && searchTerm.length === 0}
		<div style="margin-bottom: 2rem;">
			Showing {displayedBooks.length} books in
			<span style="color: {genreColors[selectedGenre]}">{selectedGenre}</span>
			section.
		</div>
	{/if}

	{#if showGenreFilters}
		<div class="genre-filters-container">
			{#each Object.keys(genreColors) as genre}
				<LibraryGenreTag {genre} bind:selectedGenre />
			{/each}
		</div>
	{/if}
</div>

{#if displayedBooks.length === 0}
	<div class="search-preamble">No matches found for <strong>'{searchTerm}'</strong>.</div>
{:else}
	{#if searchTerm.length > 0}
		<div class="search-preamble">
			Found {displayedBooks.length} matches for <strong>'{searchTerm}'</strong>
			{selectedGenre ? `in ${selectedGenre} section` : ''}:
		</div>
	{/if}
	<div class="results-container">
		{#each displayedBooks as book}
			<LibraryBookInfoCard {book} bind:selectedGenre />
		{/each}
	</div>
{/if}

<style>
	.info-and-interface-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem 2.5rem 2.5rem;
	}

	.info-and-interface-container h2 {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 600;
		margin: 0 0 1.5rem 0;
		color: #0a0a0a;
		letter-spacing: -0.01em;
		line-height: 1.1;
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
	}

	.info-and-interface-container p {
		font-size: 1rem;
		line-height: 1.7;
		color: #1a1a1a;
		margin-bottom: 2rem;
		font-weight: 400;
	}

	.toggle-genre-filters {
		cursor: pointer;
		user-select: none;
		width: fit-content;
		margin-bottom: 2rem;
		padding: 0.5rem 1rem;
		border: 2px solid #1a1a1a;
		background: rgba(255, 255, 255, 0.6);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.toggle-genre-filters:hover {
		background: #1a1a1a;
		color: white;
	}

	.genre-filters-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	input {
		background: transparent;
		border: none;
		border-bottom: 2px solid #1a1a1a;
		font-size: 1.2rem;
		padding: 0.5rem 0;
		margin-bottom: 2rem;
		font-family: 'IBM Plex Mono', monospace;
		width: 100%;
		color: #1a1a1a;
	}

	input::placeholder {
		color: rgba(26, 26, 26, 0.4);
	}

	input:focus {
		outline: none;
		border-bottom-color: #d62828;
	}

	.results-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(275px, 1fr));
		gap: 1rem;
		padding: 0 2.5rem 3rem;
	}

	.book-count {
		color: #d62828;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
	}

	.search-preamble {
		margin-bottom: 2rem;
		font-style: italic;
		padding: 0 2.5rem;
		color: #555;
		font-size: 0.95rem;
	}

	@media (max-width: 768px) {
		.info-and-interface-container {
			padding: 2rem 1.5rem;
		}

		.results-container {
			padding: 0 1.5rem 2rem;
		}

		.search-preamble {
			padding: 0 1.5rem;
		}
	}
</style>
