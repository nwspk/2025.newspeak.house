<script lang="ts">
	import type { Version } from '$lib/types/awards';

	interface Props {
		versions: Version[];
		selectedVersion: string;
		onselect: (version: string) => void;
		chartColors: string[];
		formatDate: (iso: string) => string;
	}

	let { versions, selectedVersion, onselect, chartColors, formatDate }: Props = $props();

	const selectedVersionData = $derived(versions.find((v) => v.version === selectedVersion));
</script>

<div class="sidebar-wrap">
	<!-- Desktop -->
	<div class="sidebar-desktop" role="tablist" aria-label="Algorithm version selector">
		<h3 class="sidebar-label">Timeline</h3>
		{#each versions as v, i}
			{@const color = chartColors[i % chartColors.length]}
			{@const active = selectedVersion === v.version}
			<div class="sidebar-item">
				<button
					class="version-btn"
					class:selected={active}
					role="tab"
					aria-selected={active}
					onclick={() => onselect(v.version)}
				>
					<span class="version-btn-bar" style="background:hsl(var(--{color}))"></span>
					<span class="version-btn-text">{v.version}</span>
				</button>
				{#if active && v.date}
					<div class="version-detail" style="border-left-color:hsl(var(--{color}))">
						<span class="version-detail-title">{v.version}</span>
						<span class="version-detail-date">{formatDate(v.date)}</span>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Mobile -->
	<div class="sidebar-mobile">
		<div class="mobile-row">
			{#each versions as v, i}
				{@const color = chartColors[i % chartColors.length]}
				{@const active = selectedVersion === v.version}
				<button
					class="mobile-btn"
					class:selected={active}
					onclick={() => onselect(v.version)}
				>
					<span class="version-btn-bar" style="background:hsl(var(--{color}))"></span>
					<span class="mobile-btn-text">{v.version}</span>
				</button>
			{/each}
		</div>
		{#if selectedVersionData?.date}
			<div class="mobile-info">
				<span class="mobile-info-title">{selectedVersion}</span>
				<span class="mobile-info-date">{formatDate(selectedVersionData.date)}</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.sidebar-desktop {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: sticky;
		top: 120px;
	}
	.sidebar-mobile {
		display: none;
	}

	.sidebar-label {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(26, 26, 26, 0.55);
		margin: 0 0 0.25rem 0;
	}

	.sidebar-item {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.version-btn {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.88rem;
		font-weight: 500;
		padding: 0.6rem 0.75rem 0.6rem 1rem;
		border: 2px solid #1a1a1a;
		background: rgba(255, 255, 255, 0.5);
		color: #1a1a1a;
		cursor: pointer;
		text-align: left;
		overflow: hidden;
		transition: all 0.15s ease;
	}
	.version-btn:hover {
		background: rgba(26, 26, 26, 0.06);
	}
	.version-btn.selected {
		background: #1a1a1a;
		color: #d0d0c4;
		border-color: #1a1a1a;
	}

	.version-btn-bar {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
	}
	.version-btn-text {
		margin-left: 0.25rem;
	}

	.version-detail {
		padding-left: 0.75rem;
		border-left: 2px solid;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.version-detail-title {
		font-size: 0.78rem;
		font-weight: 700;
	}
	.version-detail-date {
		font-size: 0.72rem;
		color: rgba(26, 26, 26, 0.5);
	}

	@media (max-width: 900px) {
		.sidebar-desktop {
			display: none;
		}
		.sidebar-mobile {
			display: block;
		}

		.mobile-row {
			display: flex;
			gap: 0.5rem;
			overflow-x: auto;
			padding-bottom: 0.5rem;
		}

		.mobile-btn {
			position: relative;
			flex-shrink: 0;
			font-family: 'IBM Plex Mono', monospace;
			font-size: 0.82rem;
			font-weight: 500;
			padding: 0.5rem 0.75rem 0.5rem 1rem;
			border: 2px solid #1a1a1a;
			background: rgba(255, 255, 255, 0.5);
			color: #1a1a1a;
			cursor: pointer;
			overflow: hidden;
			transition: all 0.15s ease;
		}
		.mobile-btn.selected {
			background: #1a1a1a;
			color: #d0d0c4;
		}
		.mobile-btn-text {
			margin-left: 0.25rem;
		}

		.mobile-info {
			margin-top: 0.75rem;
			display: flex;
			flex-direction: column;
			gap: 0.15rem;
		}
		.mobile-info-title {
			font-size: 0.85rem;
			font-weight: 700;
		}
		.mobile-info-date {
			font-size: 0.75rem;
			color: rgba(26, 26, 26, 0.5);
		}
	}
</style>
