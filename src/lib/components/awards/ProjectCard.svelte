<script lang="ts">
	import type { Project } from '$lib/types/awards';

	interface Props {
		project: Project;
		variant?: 'top' | 'bottom';
		color?: string;
	}

	let { project, variant = 'top', color }: Props = $props();

	const isTop = $derived(variant === 'top');
</script>

<div
	class="card"
	class:card--top={isTop}
	class:card--bottom={!isTop}
	style={isTop && color ? `border-left-color:hsl(var(--${color}))` : undefined}
>
	<span
		class="card-rank"
		class:card-rank--muted={!isTop}
		style={isTop && color ? `color:hsl(var(--${color}))` : undefined}
	>
		#{project.rank}
	</span>
	<div class="card-body">
		<h5 class="card-name" class:card-name--muted={!isTop}>{project.name}</h5>
		<a
			href={project.url}
			target="_blank"
			rel="noopener noreferrer"
			class="card-url"
			class:card-url--muted={!isTop}
		>
			{project.url}
		</a>
		{#if project.summary}
			<p class="card-desc" class:card-desc--muted={!isTop}>{project.summary}</p>
		{/if}
		<p class="card-score" class:card-score--muted={!isTop}>Score: {project.score.toFixed(2)}</p>
	</div>
</div>

<style>
	.card {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 1.15rem;
		border: 1px solid rgba(26, 26, 26, 0.12);
		transition: border-color 0.15s ease;
	}
	.card--top {
		background: rgba(255, 255, 255, 0.45);
		border-left: 4px solid;
	}
	.card--top:hover {
		border-color: rgba(26, 26, 26, 0.25);
	}
	.card--bottom {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(26, 26, 26, 0.08);
	}

	.card-rank {
		font-size: 1.35rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		flex-shrink: 0;
		line-height: 1.2;
	}
	.card-rank--muted {
		color: rgba(26, 26, 26, 0.25) !important;
	}

	.card-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.card-name {
		font-size: 0.9rem;
		font-weight: 700;
		margin: 0;
	}
	.card-name--muted {
		color: rgba(26, 26, 26, 0.7);
	}

	.card-url {
		font-size: 0.78rem;
		color: rgba(26, 26, 26, 0.5);
		text-decoration: none;
		word-break: break-all;
	}
	.card-url:hover {
		color: #1a1a1a;
		text-decoration: underline;
	}
	.card-url--muted {
		color: rgba(26, 26, 26, 0.4);
	}
	.card-url--muted:hover {
		color: rgba(26, 26, 26, 0.6);
	}

	.card-desc {
		font-size: 0.78rem;
		color: rgba(26, 26, 26, 0.6);
		line-height: 1.5;
		margin: 0;
	}
	.card-desc--muted {
		color: rgba(26, 26, 26, 0.5);
	}

	.card-score {
		font-size: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.4);
		margin: 0;
	}
	.card-score--muted {
		color: rgba(26, 26, 26, 0.3);
	}
</style>
