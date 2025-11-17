<script lang="ts">
	const cohort = [
		{ name: 'Aadi Kulkarni', pageSlug: null },
		{ name: 'Alex Pedori', pageSlug: null },
		{ name: 'Alexandra Ciocanel', pageSlug: null },
		{ name: 'Asil Sidahmed', pageSlug: 'asil-sidahmed' },
		{ name: 'Chris Owen', pageSlug: 'chris-owen' },
		{ name: 'Connor Dunlop', pageSlug: null },
		{ name: 'David Powell', pageSlug: 'david-powell' },
		{ name: 'Davit Jintcharadze', pageSlug: null },
		{ name: 'Emily Mayhew', pageSlug: null },
		{ name: 'Fatima Sarah Khalid', pageSlug: null },
		{ name: 'Francesca Galli', pageSlug: null },
		{ name: "Fred O'Brien", pageSlug: 'frederick-obrien' },
		{ name: 'Gamithra Marga', pageSlug: null },
		{ name: 'Huda Abdirahim', pageSlug: null },
		{ name: 'Jamie Coombes', pageSlug: null },
		{ name: 'Martina Orlea', pageSlug: null },
		{ name: 'Nick Botti', pageSlug: null },
		{ name: 'Tuna Acisu', pageSlug: 'tuna-acisu' }
	];
</script>

<div class="content">
	<p>
		The <a href="https://newspeak.house">Newspeak House</a> fellowship programme is designed to support
		mid-career technologists to develop a holistic understanding of the civic landscape in the UK, in
		order to found groundbreaking new projects or seek strategic positions in key institutions.
	</p>

	<p>This year's candidates:</p>

	<ul>
		{#each cohort as human}
			<li>
				{#if human.pageSlug === null}
					{human.name}
				{:else}
					<a href={`/cohort/${human.pageSlug}`}>{human.name}</a>
				{/if}
			</li>
		{/each}
	</ul>

	<p>
		Watch this space. Or <a href="library">browse the library</a>. Or learn more about
		<a href="/guest-room">how to stay at the house as a guest</a>. As you like.
	</p>
</div>

<style>
	.content {
		max-width: 800px;
		margin: 0 auto;
	}
	ul {
		margin: 0 0 2rem 1.5rem;
		padding: 0;
		width: fit-content;
	}
	a {
		text-decoration: underline;
	}
</style>
