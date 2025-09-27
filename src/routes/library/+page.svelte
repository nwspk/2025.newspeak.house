<script lang="ts">
	interface Book {
		title: string;
		authors: string;
		genre: string;
	}

	let { data }: { data: { books: Book[] } } = $props();

	let books = data.books;

	let searchTerm = $state('');
	let displayedBooks = $derived(
		books.filter(
			(book) =>
				book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				book.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
				book.genre.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);
</script>

<h2>Library</h2>

<input type="text" bind:value={searchTerm} placeholder="Search books..." />

{#if displayedBooks.length === 0}
	<p>No books found.</p>
{:else}
	<ul>
		{#each displayedBooks as book}
			<li>
				<div class="book-info-container">
					<h3>{book.title}</h3>
					<!-- <div>{book.description}</div> -->
					<div>By {book.authors}</div>
					<div class="genre">{book.genre}</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	h3 {
		margin: 0;
	}
	/* Style input to be plain and transparent apart from a white line at the bottom */
	input {
		background: transparent;
		border: none;
		border-bottom: 2px solid white;
		color: white;
		font-size: 1.2rem;
		padding: 0.5rem;
		margin-bottom: 2rem;
		width: 100%;
	}
	input:focus {
		outline: none;
	}
	input::placeholder {
		font-family: 'Chalk';
		color: #ffffff99;
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
</style>
