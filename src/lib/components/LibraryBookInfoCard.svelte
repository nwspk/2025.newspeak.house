<script lang="ts">
	import LibraryGenreTag from './LibraryGenreTag.svelte';

	let {
		book,
		selectedGenre = $bindable()
	}: {
		book: {
			title: string;
			description: string;
			authors: string;
			genre: string;
		};
		selectedGenre: string | undefined;
	} = $props();
</script>

<div class="book-info-container">
	<div class="book-details">
		<h3>{book.title}</h3>
		<div class="book-description">
			{book.description.length > 150 ? book.description.slice(0, 150) + '...' : book.description}
		</div>
		{#if book.authors.length > 0}
			<div>By {book.authors}</div>
		{/if}
	</div>
	<LibraryGenreTag genre={book.genre} bind:selectedGenre />
</div>

<style>
	.book-info-container {
		border: 2px solid #ccccccb7;
		padding: 1rem;
		border-radius: 8px;
		font-size: 1.2rem;
		max-width: 400px;
	}
	.book-details {
		margin-bottom: 1rem;
	}
	h3 {
		margin: 0;
		font-size: 1.4rem;
		line-height: 1.2;
		font-style: italic;
	}
	.book-description {
		font-size: 1rem;
		margin: 0.5rem 0;
	}
</style>
