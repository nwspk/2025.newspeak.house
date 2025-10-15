<script lang="ts">
	import ContentBlock from '$lib/components/ContentBlock.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.pageTitle} · Newspeak House 25/26</title>
	<meta name="description" content={data.pageDescription} />
</svelte:head>

<div class="main">
	<ContentBlock>
		<h2>{data.pageTitle}</h2>
		<data.pageContent />
	</ContentBlock>
</div>
