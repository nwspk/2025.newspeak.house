<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { committee } from '$lib/data/committee';
	import type { Version, Project } from '$lib/types/awards';
	import ProjectCard from '$lib/components/awards/ProjectCard.svelte';
	import VersionTimeline from '$lib/components/awards/VersionTimeline.svelte';

	let { data } = $props();

	let versions = $state(data.versions as Version[]);
	let resultsMap = $state(data.resultsMap as Record<string, Project[]>);
	let resultsMeta = $state((data.resultsMeta ?? {}) as Record<string, boolean>);

	let selectedVersion = $state(data.currentVersion as string);

	const CODEOWNERS_URL =
		'https://github.com/nwspk/politech-awards-2026/blob/main/.github/CODEOWNERS';
	const EVALUATION_REPO = 'https://github.com/nwspk/politech-awards-2026';
	const LUMA_SHOWCASE_URL = 'https://luma.com/4j8zzq1s';
	const PROCESS_URL =
		'https://github.com/nwspk/politech-awards-2026/blob/main/PROCESS.md';

	const chartColors = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];

	const selectedVersionData = $derived(versions.find((v) => v.version === selectedVersion));
	const results = $derived(resultsMap[selectedVersion] ?? []);
	const top5 = $derived(results.slice(0, 5));
	const bottom5 = $derived(results.length >= 10 ? results.slice(-5) : []);

	function formatDate(iso: string) {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function setVersion(v: string) {
		selectedVersion = v;
		if (browser) {
			const u = new URL(window.location.href);
			u.searchParams.set('version', v);
			window.history.replaceState({}, '', u.toString());
		}
	}

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	onMount(() => {
		if (!browser) return;
		const params = new URLSearchParams(window.location.search);
		const v = params.get('version');
		const validVersions = versions.map((x) => x.version);
		if (v && validVersions.includes(v)) {
			selectedVersion = v;
		}
	});
</script>

<svelte:head>
	<title>Political Technology Awards · Newspeak House 25/26</title>
	<meta
		name="description"
		content="Political Technology Awards — open evaluation by the 2025–26 fellowship cohort. Browse algorithm versions, scores, and assessments. Showcase 31 March 2026."
	/>
</svelte:head>

<div class="awards-page">
	<!-- Hero -->
	<section class="hero">
		<h1>The Political Technology Awards</h1>
		<p class="subtitle">
			Awards show + open evaluation repo by the 2025–26 fellowship cohort.
			Recognizing projects that advance democratic participation, government
			transparency, and civic engagement through technology.
		</p>
		<div class="hero-actions">
			<button
				class="action-btn action-btn--filled"
				style="border-left-color: hsl(var(--chart-1))"
				onclick={() => scrollTo('rankings')}
			>
				Review the rankings
			</button>
			<button
				class="action-btn action-btn--outline"
				style="border-left-color: hsl(var(--chart-2))"
				onclick={() => scrollTo('showcase')}
			>
				What we're doing
			</button>
			<a
				class="action-btn action-btn--outline"
				style="border-left-color: hsl(var(--chart-3))"
				href={LUMA_SHOWCASE_URL}
				target="_blank"
				rel="noopener noreferrer"
			>
				Attend the showcase
			</a>
		</div>
	</section>

	<hr class="divider" />

	<!-- Rankings: Timeline + Results Panel -->
	<section id="rankings" class="rankings-grid">
		<VersionTimeline
			{versions}
			{selectedVersion}
			onselect={setVersion}
			{chartColors}
			{formatDate}
		/>

		<div class="panel">
			{#if selectedVersionData}
				{#if resultsMeta[selectedVersion]}
					<div class="fallback">
						<span class="fallback-icon">⚠</span>
						<div>
							<p class="fallback-heading">Using fallback data</p>
							<p class="fallback-text">
								Per-version historical results are not yet available. Showing current
								algorithm output from results.json.
							</p>
						</div>
					</div>
				{/if}

				<div class="panel-version-info">
					<h2 class="panel-title">
						{selectedVersion} · {formatDate(selectedVersionData.date)}
						<a href={selectedVersionData.prUrl} target="_blank" rel="noopener noreferrer" class="pr-link">
							PR #{selectedVersionData.prUrl.split('/').pop()}
						</a>
					</h2>

					<div class="info-fields">
						<div class="info-field">
							<h4 class="info-label">Heuristic</h4>
							<p class="info-value">{selectedVersionData.heuristicSummary}</p>
						</div>
						<div class="info-field">
							<h4 class="info-label">Rationale</h4>
							<p class="info-value">{selectedVersionData.rationale}</p>
						</div>
						<div class="info-field">
							<h4 class="info-label">Data Sources</h4>
							<p class="info-value muted">{selectedVersionData.dataSources.join(', ')}</p>
						</div>
					</div>
				</div>

				<!-- Top 5 -->
				<div class="rank-block">
					<div class="rank-header">
						<span class="rank-icon">🏆</span>
						<h3 class="rank-heading">Top 5</h3>
					</div>
					{#if top5.length > 0}
						<div class="card-list">
							{#each top5 as project, i}
								<ProjectCard {project} variant="top" color={chartColors[i % chartColors.length]} />
							{/each}
						</div>
					{:else}
						<p class="empty">No data for this version.</p>
					{/if}
				</div>

				<!-- Bottom 5 -->
				<div class="rank-block">
					<div class="rank-header">
						<span class="rank-icon rank-icon--muted">▽</span>
						<h3 class="rank-heading">Bottom 5</h3>
					</div>
					{#if bottom5.length > 0}
						<div class="card-list">
							{#each bottom5 as project}
								<ProjectCard {project} variant="bottom" />
							{/each}
						</div>
					{:else}
						<p class="empty">Not enough projects (need 10+ for bottom 5).</p>
					{/if}
				</div>

				{#if selectedVersionData.diff.length > 0}
					<div class="diff-block">
						<h4 class="info-label">Changes / Limitations</h4>
						<ul>
							{#each selectedVersionData.diff as change}
								<li>{change}</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/if}
		</div>
	</section>

	<hr class="divider" />

	<!-- Showcase -->
	<section id="showcase" class="showcase">
		<h2 class="section-title">
			<span class="title-bar" style="background:hsl(var(--chart-4))"></span>
			The Political Technology Awards
		</h2>
		<div class="showcase-body">
			<p>
				The Political Technology Awards is an open evaluation exercise run by the 2025–26
				Newspeak House fellowship cohort. We're building a <strong>public, inspectable
				ranking</strong> of civic and political technology projects — the kind of tools that help
				citizens understand institutions, participate in democracy, and hold power to account.
			</p>
			<p>
				Our evaluation process is iterative and transparent. We use a scoring algorithm that
				evolves over time. Each version applies different heuristics and produces a ranked list.
				The algorithm lives in a
				<a href={EVALUATION_REPO} target="_blank" rel="noopener noreferrer">public GitHub repo</a>;
				you can inspect the code, the pull requests, and the rationale for every change. We may
				add written assessments per project as the evaluation matures.
			</p>
			<p>
				Rankings are political. By making our process transparent and iterative, we hope to
				surface both strong projects and the tradeoffs inherent in any evaluation framework.
				A simple tool that empowers marginalized communities ranks higher than a technically
				impressive platform that reinforces existing power structures.
			</p>
		</div>

		<div class="showcase-share">
			<h3 class="share-title">
				<span class="title-bar title-bar--sm" style="background:hsl(var(--chart-5))"></span>
				Contest the rankings
			</h3>
			<p class="share-text">
				Our evaluation process is open and contestable. We encourage you to review our
				methodology, examine our data, and share your own rankings. Political technology
				evaluation is inherently political — different values lead to different conclusions,
				and that's exactly as it should be.
			</p>
			<a
				href={PROCESS_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="process-link"
				style="border-left-color:hsl(var(--chart-5))"
			>
				Read our process documentation →
			</a>
		</div>
	</section>

	<hr class="divider" />

	<!-- Committee -->
	<section id="committee" class="committee">
		<h2 class="section-title">
			<span class="title-bar" style="background:hsl(var(--chart-3))"></span>
			Awards Committee
		</h2>
		<p class="committee-desc">
			Our committee brings together expertise in civic technology, political science, digital
			rights, and community organizing. The committee is defined in the
			<strong>CODEOWNERS</strong> file in the evaluation repository — everyone listed there can
			approve changes to the algorithm and assessments.
		</p>

		<div class="avatar-row">
			{#each committee as member, i}
				{@const color = chartColors[i % chartColors.length]}
				<div class="avatar-card">
					<span class="avatar" style="border-color:hsl(var(--{color}))">
						{#if member.photo}
							<img src={member.photo} alt={member.name} />
						{:else}
							<span class="initials">{member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
						{/if}
					</span>
					<span class="avatar-name">{member.name}</span>
				</div>
			{/each}
		</div>

		<p class="committee-links">
			<a href={CODEOWNERS_URL} target="_blank" rel="noopener noreferrer">View committee (CODEOWNERS) →</a>
			<span class="link-sep">|</span>
			<a href="/">Full cohort page →</a>
		</p>
	</section>
</div>

<style>
	/* Page layout */
	.awards-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2.5rem 1.75rem 4rem;
	}

	.divider {
		border: none;
		border-top: 1px solid rgba(26, 26, 26, 0.15);
		margin: 3rem 0;
	}

	/* Hero */
	.hero h1 {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 600;
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
		letter-spacing: -0.01em;
		line-height: 1.1;
		margin: 0 0 0.75rem 0;
	}

	.subtitle {
		font-size: 1.05rem;
		line-height: 1.65;
		color: rgba(26, 26, 26, 0.8);
		max-width: 54ch;
		margin: 0 0 1.5rem 0;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.action-btn {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.88rem;
		font-weight: 600;
		padding: 0.6rem 1.25rem;
		border: 2px solid #1a1a1a;
		border-left-width: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}

	.action-btn--filled {
		background: #1a1a1a;
		color: #d0d0c4;
	}
	.action-btn--filled:hover {
		background: rgba(26, 26, 26, 0.85);
		color: #d0d0c4;
	}

	.action-btn--outline {
		background: rgba(255, 255, 255, 0.5);
		color: #1a1a1a;
	}
	.action-btn--outline:hover {
		background: rgba(26, 26, 26, 0.08);
		color: #1a1a1a;
	}

	/* Rankings grid */
	.rankings-grid {
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: 2rem;
		align-items: start;
	}

	/* Results panel */
	.panel {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		min-width: 0;
	}

	.fallback {
		display: flex;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		background: rgba(214, 40, 40, 0.06);
		border-left: 3px solid #d62828;
	}
	.fallback-icon {
		font-size: 1.1rem;
		flex-shrink: 0;
	}
	.fallback-heading {
		font-size: 0.85rem;
		font-weight: 700;
		margin: 0 0 0.2rem 0;
	}
	.fallback-text {
		font-size: 0.78rem;
		color: rgba(26, 26, 26, 0.7);
		margin: 0;
		line-height: 1.5;
	}

	.panel-version-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.panel-title {
		font-size: 1.25rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		margin: 0;
	}
	.pr-link {
		font-size: 0.82rem;
		font-weight: 500;
		color: #d62828;
		text-decoration: underline dotted rgba(214, 40, 40, 0.4);
		text-underline-offset: 2px;
	}
	.pr-link:hover {
		text-decoration-color: #d62828;
		color: #d62828;
	}

	.info-fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.info-field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.info-label {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(26, 26, 26, 0.55);
		margin: 0;
	}
	.info-value {
		font-size: 0.9rem;
		line-height: 1.6;
		margin: 0;
	}
	.info-value.muted {
		color: rgba(26, 26, 26, 0.7);
	}

	/* Ranking blocks */
	.rank-block {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.rank-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.rank-icon {
		font-size: 1.1rem;
	}
	.rank-icon--muted {
		opacity: 0.5;
	}
	.rank-heading {
		font-size: 1.1rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		margin: 0;
	}

	.card-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.empty {
		font-style: italic;
		color: rgba(26, 26, 26, 0.5);
		font-size: 0.88rem;
	}

	.diff-block ul {
		padding-left: 1.25rem;
		margin: 0.35rem 0 0;
	}
	.diff-block li {
		font-size: 0.88rem;
		color: rgba(26, 26, 26, 0.75);
		line-height: 1.55;
	}

	/* Showcase */
	.section-title {
		font-size: 1.5rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		margin: 0 0 1.25rem 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.title-bar {
		display: inline-block;
		width: 5px;
		height: 1.6rem;
		border-radius: 3px;
		flex-shrink: 0;
	}
	.title-bar--sm {
		width: 4px;
		height: 1.15rem;
	}

	.showcase-body {
		max-width: 74ch;
	}
	.showcase-body p {
		font-size: 0.95rem;
		line-height: 1.7;
		color: rgba(26, 26, 26, 0.9);
		margin-bottom: 0.85rem;
	}
	.showcase-body a {
		color: #d62828;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.4);
		text-underline-offset: 2px;
	}
	.showcase-body a:hover {
		text-decoration-color: #d62828;
	}

	.showcase-share {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(26, 26, 26, 0.15);
	}

	.share-title {
		font-size: 1.1rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		margin: 0 0 0.75rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.share-text {
		font-size: 0.9rem;
		line-height: 1.7;
		color: rgba(26, 26, 26, 0.8);
		max-width: 74ch;
		margin-bottom: 1rem;
	}

	.process-link {
		display: inline-flex;
		align-items: center;
		font-size: 0.88rem;
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 500;
		padding: 0.5rem 1rem;
		border-left: 4px solid;
		background: rgba(255, 255, 255, 0.4);
		color: #1a1a1a;
		text-decoration: none;
		transition: background 0.15s ease;
	}
	.process-link:hover {
		background: rgba(255, 255, 255, 0.7);
		color: #1a1a1a;
	}

	/* Committee */
	.committee-desc {
		font-size: 0.9rem;
		color: rgba(26, 26, 26, 0.65);
		max-width: 74ch;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.avatar-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1.75rem;
		margin-bottom: 1.5rem;
	}

	.avatar-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		max-width: 110px;
	}

	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		overflow: hidden;
		border: 3px solid;
		background: rgba(255, 255, 255, 0.5);
		flex-shrink: 0;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.initials {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.95rem;
		font-weight: 600;
		color: #555;
	}

	.avatar-name {
		font-size: 0.82rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		text-align: center;
		line-height: 1.3;
	}

	.committee-links {
		font-size: 0.88rem;
	}
	.committee-links a {
		color: #d62828;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.4);
		text-underline-offset: 2px;
	}
	.committee-links a:hover {
		text-decoration-color: #d62828;
	}

	.link-sep {
		margin: 0 0.5rem;
		color: #aaa;
	}

	/* Mobile */
	@media (max-width: 900px) {
		.awards-page {
			padding: 2rem 1.25rem 3rem;
		}

		.rankings-grid {
			grid-template-columns: 1fr;
		}

		.hero h1 {
			font-size: clamp(1.8rem, 6vw, 2.5rem);
		}

		.avatar-row {
			gap: 1.25rem;
		}
	}
</style>
