<script lang="ts">
	/**
	 * Reusable side panel for displaying content detail (field notes, etc.).
	 * Similar to the homepage cohort profile panel - slides in from the right.
	 */
	interface Props {
		open: boolean;
		title?: string;
		date?: string;
		onClose: () => void;
		children?: import('svelte').Snippet;
	}

	let { open, title, date, onClose, children }: Props = $props();
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="panel-overlay" onclick={onClose}></div>
	<div class="side-panel">
		<div class="panel-content">
			<button class="close-button" onclick={onClose}>✕</button>
			{#if title}
				<h2>{title}</h2>
			{/if}
			{#if date}
				<span class="date">{date}</span>
			{/if}
			<div class="detail-slot">
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.panel-overlay {
		position: fixed;
		top: 96px;
		left: 0;
		width: 100%;
		height: calc(100vh - 96px);
		background: rgba(0, 0, 0, 0.3);
		z-index: 99;
		cursor: pointer;
	}

	.side-panel {
		position: fixed;
		right: 0;
		top: 96px;
		width: min(60vw, 640px);
		background: rgba(232, 232, 220, 0.98);
		backdrop-filter: blur(20px);
		border-left: 3px solid #d62828;
		box-sizing: border-box;
		height: calc(100vh - 96px);
		overflow-y: auto;
		z-index: 100;
	}

	.panel-content {
		padding: 2rem 2.5rem 3rem;
		position: relative;
	}

	.close-button {
		position: sticky;
		top: 0;
		float: right;
		margin: -0.5rem -0.5rem 1rem 1rem;
		width: 40px;
		height: 40px;
		border: 2px solid #1a1a1a;
		background: rgba(255, 255, 255, 0.95);
		color: #1a1a1a;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'IBM Plex Mono', monospace;
		z-index: 10;
	}

	.close-button:hover {
		background: #d62828;
		color: white;
		border-color: #d62828;
		transform: rotate(90deg);
	}

	.panel-content h2 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #0a0a0a;
		font-family: 'Crimson Pro', serif;
	}

	.date {
		display: block;
		font-size: 0.75rem;
		color: #999;
		margin-bottom: 1.5rem;
		font-family: 'IBM Plex Mono', monospace;
	}

	.detail-slot {
		font-size: 0.95rem;
		line-height: 1.7;
		color: #333;
	}

	.detail-slot :global(a) {
		color: #d62828;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.4);
	}

	.detail-slot :global(a:hover) {
		text-decoration-color: #d62828;
	}

	.detail-slot :global(h3) {
		font-size: 1.2rem;
		margin: 1.5rem 0 0.75rem 0;
	}

	.detail-slot :global(p) {
		margin-bottom: 1rem;
	}

	.detail-slot :global(p:last-child) {
		margin-bottom: 0;
	}

	.detail-slot :global(blockquote) {
		border-left: 3px solid #d62828;
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: #555;
	}

	@media (max-width: 768px) {
		.side-panel {
			width: 100vw;
		}
	}
</style>
