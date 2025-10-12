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
	}
	.toggle-genre-filters {
		cursor: pointer;
		user-select: none;
		width: fit-content;
		margin-bottom: 2rem;
		padding: 0.4rem 0.5rem;
		border: 2px solid rgba(189, 189, 189, 0.736);
		border-radius: 8px;
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
		border-bottom: 2px solid rgba(189, 189, 189, 0.736);
		font-size: 1.2rem;
		padding: 0.5rem;
		margin-bottom: 2rem;
	}
	input:focus {
		outline: none;
	}
	.results-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(275px, 1fr));
		gap: 1rem;
	}
	.book-count {
		color: #d4356f;
	}
	.search-preamble {
		margin-bottom: 2rem;
		font-style: italic;
	}
</style>
