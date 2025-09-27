<script lang="ts">
	const cohort = [
		'Aadi Kulkarni',
		'Alex Pedori',
		'Alexandra Ciocanel',
		'Asil Sidahmed',
		'Chris Owen',
		'Connor Dunlop',
		'David Powell',
		'Davit Jintcharadze',
		'Emily Mayhew',
		'Fatima Sarah Khalid',
		'Francesca Galli',
		"Fred O'Brien",
		'Gamithra Marga',
		'Huda Abdirahim',
		'Jamie Coombes',
		'Martina Orlea',
		'Nick Botti',
		'Tuna Acisu'
	];
	const cohortShuffled = cohort.sort(() => Math.random() - 0.5);
</script>

<p>
	The <a href="https://newspeak.house">Newspeak House</a> fellowship programme is designed to support
	mid-career technologists to develop a holistic understanding of the civic landscape in the UK, in order
	to found groundbreaking new projects or seek strategic positions in key institutions.
</p>

<p>This year's candidates:</p>

<ul>
	{#each cohortShuffled as human}
		<li
			style="transform: rotate({Math.random() * 4 - 2}deg); 
            padding-left: {(Math.random() * 2) / 3}rem;
            color: hsl({Math.random() * 360}, 70%, 90%)"
		>
			{human}
		</li>
	{/each}
</ul>

<p>Watch this space.</p>
