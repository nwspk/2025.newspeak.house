<script lang="ts">
	import { genreColors } from '$lib/styles';

	let { genre, selectedGenre = $bindable() }: { genre: string; selectedGenre: string | undefined } =
		$props();
</script>

<div
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
>
	<div
		class="genre-tag"
		style="background-color: {selectedGenre === genre
			? genreColors[genre]
			: 'transparent'}; border: 3px solid {genreColors[genre]}; color: {selectedGenre === genre
			? 'white'
			: genreColors[genre]};"
	>
		{genre}
	</div>
</div>

<style>
	.genre-tag {
		color: white;
		font-size: 0.9rem;
		border-radius: 8px;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		width: fit-content;
	}
</style>
