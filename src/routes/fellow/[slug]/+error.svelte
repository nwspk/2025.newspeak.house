<script lang="ts">
	import { page } from '$app/stores';

	let { status, message }: { status: number; message?: string } = $props();
</script>

<div class="error-page">
	<div class="content">
		<a href="/" class="back-link">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Back to cohort
		</a>
		<h1>Fellow not found</h1>
		<p>We couldn't find a profile for this fellow.</p>
	</div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		background: #d4cfc0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.content {
		max-width: 32rem;
		text-align: center;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.7);
		text-decoration: none;
		margin-bottom: 2rem;
	}

	.back-link:hover {
		color: #1a1a1a;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		font-family: 'Crimson Pro', serif;
	}

	p {
		color: rgba(26, 26, 26, 0.7);
		margin: 0;
		font-family: 'IBM Plex Mono', monospace;
	}
</style>
