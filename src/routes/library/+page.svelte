<script lang="ts">
	import { genreColors } from '$lib/styles';

	interface Book {
		title: string;
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
	{showGenreFilters ? 'Hide' : 'Show'} Genre Filters {showGenreFilters ? '▲' : '▼'}
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
			<div
				class="genre-tag"
				onclick={() => {
					if (selectedGenre === genre) {
						selectedGenre = undefined;
					} else {
						selectedGenre = genre;
					}
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						if (selectedGenre === genre) {
							selectedGenre = undefined;
						} else {
							selectedGenre = genre;
						}
					}
				}}
				tabindex="0"
				role="button"
				style="background-color: {selectedGenre === genre ? genreColors[genre] : 'transparent'};
		border: 3px solid {genreColors[genre]};
		color: {selectedGenre === genre ? 'white' : genreColors[genre]};
		"
			>
				{genre}
			</div>
		{/each}
	</div>
{/if}

{#if displayedBooks.length === 0}
	<div class="search-preamble">No matches found for <strong>'{searchTerm}'</strong>.</div>
{:else}
	{#if searchTerm.length > 0}
		<div class="search-preamble">
			Found {displayedBooks.length} matches for <strong>'{searchTerm}'</strong>
			{selectedGenre ? `in ${selectedGenre} section` : ''}:
		</div>
	{/if}
	<ul>
		{#each displayedBooks as book}
			<li>
				<div class="book-info-container">
					<h3>{book.title}</h3>
					<!-- <div>{book.description}</div> -->
					{#if book.authors.length > 0}
						<div>By {book.authors}</div>
					{/if}
					<div style="color: {genreColors[book.genre]}">{book.genre}</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	h3 {
		margin: 0;
		line-height: 1.2;
		font-style: italic;
	}
	.toggle-genre-filters {
		cursor: pointer;
		user-select: none;
		width: fit-content;
		margin-bottom: 2rem;
		padding: 0.4rem 0.5rem;
		border: 3px solid #39393999;
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
	ul {
		padding: 0;
		list-style: none;
	}
	li {
		max-width: 100%;
		margin-bottom: 2rem;
	}
	.book-info-container {
		/* border: 4px solid #ccccccb7; */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.book-count {
		color: #d4356f;
	}
	.search-preamble {
		margin-bottom: 2rem;
		font-style: italic;
	}
	.genre-tag {
		border-radius: 8px;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
	}
</style>
