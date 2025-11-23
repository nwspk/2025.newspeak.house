<div class="block">
	<slot />
</div>

<style>
	.block {
		max-width: 800px;
		margin: 0 auto 2rem auto;
		padding: 3rem 2.5rem;
		line-height: 1.7;
	}

	.block :global(h2) {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 600;
		margin: 0 0 1.5rem 0;
		color: #0a0a0a;
		letter-spacing: -0.01em;
		line-height: 1.1;
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
	}

	.block :global(h3) {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 2rem 0 1rem 0;
		color: #1a1a1a;
		font-family: 'Crimson Pro', serif;
	}

	.block :global(p) {
		font-size: 1rem;
		line-height: 1.7;
		color: #1a1a1a;
		margin-bottom: 1.5rem;
	}

	.block :global(ul),
	.block :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}

	.block :global(li) {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	.block :global(a) {
		color: #1a1a1a;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.3);
		text-underline-offset: 0.2em;
		transition: all 0.2s ease;
	}

	.block :global(a:hover) {
		color: #d62828;
		text-decoration-color: #d62828;
	}

	.block :global(strong) {
		font-weight: 700;
		color: #0a0a0a;
	}

	.block :global(code) {
		font-family: 'IBM Plex Mono', monospace;
		background: rgba(26, 26, 26, 0.05);
		padding: 0.2em 0.4em;
		font-size: 0.9em;
	}

	.block :global(blockquote) {
		border-left: 3px solid #d62828;
		padding-left: 1.5rem;
		margin: 1.5rem 0;
		font-style: italic;
		color: #555;
	}

	@media (max-width: 768px) {
		.block {
			padding: 2rem 1.5rem;
		}
	}
</style>
