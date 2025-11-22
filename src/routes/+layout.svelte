<script lang="ts">
	import '$lib/styles/reset.css';
	import '$lib/styles/main.css';

	import favicon from '$lib/assets/favicon.jpeg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>NWSPK 25/26</title>
	<meta name="description" content="Newspeak House Fellowship 2025/26" />
</svelte:head>

<header class="chalkboard">
	<a href="/"><h1 style="transform: rotate({Math.random() * 4 - 2}deg);">NWSPK 25/26</h1></a>
	<nav>
		<a href="/library">Library</a>
		<a href="/guest-room">Book the guest room</a>
		<a href="/weblog">Weblog</a>
		<a href="/contact">Contact us</a>
	</nav>
</header>

<main>
	{@render children?.()}
</main>

<style>
	header {
		font-family: 'Chalk', cursive;
		text-align: center;
		padding: 2rem 0 1rem 0;
	}
	.chalkboard {
		background-color: #000000;
		background-image: url('https://www.transparenttextures.com/patterns/concrete-wall-2.png');
		background-repeat: repeat;
	}
	h1 {
		font-size: 3rem;
		margin: 0 0 2rem 0;
		color: hsl(199, 88%, 94%);
	}
	header a {
		color: hsl(188, 100%, 94%);
		text-decoration: none;
	}
	main {
		padding: 1rem;
		margin: 0 auto;
	}
	nav {
		display: flex;
		justify-content: center;
		gap: 2rem;
	}
</style>
