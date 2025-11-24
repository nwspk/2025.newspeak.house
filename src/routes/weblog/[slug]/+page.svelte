<script lang="ts">
	import ContentBlock from '$lib/components/ContentBlock.svelte';
	import type { Component } from 'svelte';

	let {
		data
	}: {
		data: {
			postTitle: string;
			postStandfirst: string;
			postAuthorName: string;
			postAuthorSlug: string;
			postPublicationDate: string;
			postContent: Component;
		};
	} = $props();
</script>

<svelte:head>
	<title>{data.postTitle} · Newspeak House 25/26</title>
	<meta name="description" content={data.postStandfirst} />
</svelte:head>

<div class="main">
	<ContentBlock>
		<div class="furniture">
			<h2>{data.postTitle}</h2>
			<div class="standfirst">{data.postStandfirst}</div>
			<div>
				By {data.postAuthorName}
			</div>
		</div>
		<data.postContent />
		<small
			>The views expressed in this weblog are those of the author and do not necessarily reflect
			those of the 25/26 fellowship as a whole.</small
		>
	</ContentBlock>
</div>

<style>
	.main {
		margin: 2rem 0;
	}
	.furniture {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}
	h2 {
		margin: 0;
	}
	.standfirst {
		font-style: italic;
		font-size: 1.4rem;
	}
</style>
