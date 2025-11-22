<script>
	import { weblogsMetadata } from '$lib/data/weblog-entries';
</script>

<div class="container">
	<div class="page-header">
		<h1>Weblog</h1>
		<div>Things what we've written.</div>
	</div>
	<ul>
		{#each weblogsMetadata as weblog}
			<li>
				<a href={`/weblog/${weblog.slug}`}>
					{weblog.title}
				</a>
				by {weblog.authorName} ({weblog.publicationDate})
			</li>
		{/each}
	</ul>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 16px;
	}
	.page-header {
		margin-bottom: 1rem;
	}
</style>
