<script lang="ts">
	/**
	 * Reusable side panel for displaying content detail.
	 * Matches the Polymet design: header card with colored border,
	 * date + badge, title, emoji, summary, then body content.
	 */
	interface Props {
		open: boolean;
		title?: string;
		date?: string;
		contentType?: string;
		emoji?: string;
		typeLabel?: string;
		onClose: () => void;
		children?: import('svelte').Snippet;
	}

	let { open, title, date, contentType, emoji, typeLabel, onClose, children }: Props = $props();

	const typeLabels: Record<string, string> = {
		'field-note': 'FIELD NOTE',
		'blog-post': 'BLOG POST',
		journal: 'JOURNAL',
		question: 'QUESTION',
		idea: 'IDEA'
	};

	const displayLabel = $derived(typeLabel ?? typeLabels[contentType ?? ''] ?? '');
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="panel-overlay" onclick={onClose}></div>
	<div class="side-panel">
		<div class="panel-inner">
			<!-- Sticky close bar -->
			<div class="close-bar">
				<button class="close-button" onclick={onClose}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</div>

			<article class="panel-content">
				<!-- Header card -->
				{#if title || date}
					<div class="header-card type-{contentType ?? 'default'}">
						<div class="header-meta">
							{#if date}
								<span class="date">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
										<line x1="16" y1="2" x2="16" y2="6" />
										<line x1="8" y1="2" x2="8" y2="6" />
										<line x1="3" y1="10" x2="21" y2="10" />
									</svg>
									{date}
								</span>
							{/if}
							{#if displayLabel}
								<span class="badge type-{contentType ?? 'default'}">{displayLabel}</span>
							{/if}
						</div>

						{#if title}
							<h2 class="header-title">{title}</h2>
						{/if}

						{#if emoji}
							<div class="header-emoji">{emoji}</div>
						{/if}
					</div>
				{/if}

				<!-- Body content -->
				<div class="body-card">
					<div class="detail-slot">
						{#if children}
							{@render children()}
						{/if}
					</div>
				</div>
			</article>
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
		background: rgba(0, 0, 0, 0.2);
		z-index: 99;
		cursor: pointer;
	}

	.side-panel {
		position: fixed;
		right: 0;
		top: 96px;
		width: min(60vw, 700px);
		background: #f5f1e8;
		box-shadow: -8px 0 30px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		height: calc(100vh - 96px);
		overflow-y: auto;
		z-index: 100;
	}

	.panel-inner {
		display: flex;
		flex-direction: column;
	}

	.close-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		background: #f5f1e8;
		border-bottom: 1px solid rgba(26, 26, 26, 0.1);
		padding: 0.75rem 1.5rem;
	}

	.close-button {
		width: 36px;
		height: 36px;
		border: none;
		background: transparent;
		color: #1a1a1a;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background 0.2s;
	}

	.close-button:hover {
		background: rgba(26, 26, 26, 0.1);
	}

	.panel-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Header card */
	.header-card {
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid rgba(26, 26, 26, 0.1);
		border-left: 4px solid var(--color-coral);
		padding: 1.5rem;
		border-radius: 8px;
	}

	.header-card.type-field-note { border-left-color: var(--color-coral); }
	.header-card.type-blog-post  { border-left-color: var(--color-navy); }
	.header-card.type-journal    { border-left-color: var(--color-orange); }
	.header-card.type-question   { border-left-color: #7B6B8F; }
	.header-card.type-idea       { border-left-color: #6B8B7F; }
	.header-card.type-default    { border-left-color: var(--color-coral); }

	.header-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.date {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: rgba(26, 26, 26, 0.5);
		font-family: 'IBM Plex Mono', monospace;
	}

	.date svg {
		opacity: 0.5;
	}

	.badge {
		font-size: 9px;
		font-family: 'IBM Plex Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.2rem 0.5rem;
		border-radius: 2px;
		color: white;
		flex-shrink: 0;
	}

	.badge.type-field-note { background: #8B7355; }
	.badge.type-blog-post  { background: #5B7B8F; }
	.badge.type-journal    { background: #7B6B8F; }
	.badge.type-question   { background: #7B6B8F; }
	.badge.type-idea       { background: #6B8B7F; }
	.badge.type-default    { background: #8B7355; }

	.header-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		color: #0a0a0a;
		font-family: 'IBM Plex Mono', monospace;
		line-height: 1.3;
	}

	.header-emoji {
		font-size: 2.5rem;
		margin-top: 0.75rem;
	}

	/* Body card */
	.body-card {
		background: rgba(255, 255, 255, 0.4);
		border: 1px solid rgba(26, 26, 26, 0.08);
		padding: 1.5rem;
		border-radius: 8px;
	}

	.detail-slot {
		font-size: 0.95rem;
		line-height: 1.7;
		color: #333;
	}

	.detail-slot :global(a) {
		color: var(--color-coral);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--color-coral) 40%, transparent);
	}

	.detail-slot :global(a:hover) {
		text-decoration-color: var(--color-coral);
	}

	.detail-slot :global(a::after) {
		content: none !important;
	}

	.detail-slot :global(h2),
	.detail-slot :global(h3) {
		font-size: 1.1rem;
		margin: 1.5rem 0 0.75rem 0;
		font-family: 'IBM Plex Mono', monospace;
	}

	.detail-slot :global(p) {
		margin-bottom: 1rem;
	}

	.detail-slot :global(p:last-child) {
		margin-bottom: 0;
	}

	.detail-slot :global(blockquote) {
		border-left: 3px solid var(--color-navy);
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: #555;
	}

	.detail-slot :global(ul),
	.detail-slot :global(ol) {
		padding-left: 1.5rem;
		margin-bottom: 1rem;
	}

	.detail-slot :global(img) {
		max-width: 100%;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.side-panel {
			width: 100vw;
		}
	}
</style>
