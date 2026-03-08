<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { committee, type CommitteeMember } from '$lib/data/committee';
	import type { Version, Project } from '$lib/types/awards';
	import AvatarCard from '$lib/components/awards/AvatarCard.svelte';
	import MarkdownBlock from '$lib/components/awards/MarkdownBlock.svelte';
	import ProjectCard from '$lib/components/awards/ProjectCard.svelte';
	import VersionTimeline from '$lib/components/awards/VersionTimeline.svelte';

	/** Map iteration author string (e.g. @jcoombes, Asil) to committee member */
	function authorToMember(author: string | null): CommitteeMember | null {
		if (!author) return null;
		const normalized = author.replace(/^@/, '').toLowerCase();
		const aliasMap: Record<string, string> = { asil: 'asilsidahmed-newspeak' };
		const github = aliasMap[normalized] ?? normalized;
		return committee.find((m) => m.github.toLowerCase() === github) ?? null;
	}

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
	const versionAuthorMember = $derived(
		selectedVersionData?.author ? authorToMember(selectedVersionData.author) : null
	);
	const results = $derived(resultsMap[selectedVersion] ?? []);
	const top5 = $derived(results.slice(0, 5));

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
			The Political Technology Awards is an open evaluation exercise run by the
			2025–26 Newspeak House fellowship cohort. Review the iterations below,
			<a href="#showcase" class="subtitle-link">read me</a>, and join us at the
			Showcase on March 31, 2026 to hear all about it!
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
				<div class="panel-version-info">
					<div class="panel-header-row">
						{#if versionAuthorMember}
							<AvatarCard
								name={versionAuthorMember.name}
								photo={versionAuthorMember.photo}
								color={chartColors[0]}
							/>
						{:else if selectedVersionData.author}
							<AvatarCard
								name={selectedVersionData.author.replace(/^@/, '')}
								color={chartColors[0]}
							/>
						{/if}
						<div class="panel-header-main">
							<h2 class="panel-title">{selectedVersionData.title}</h2>
							<span class="panel-meta">
								{formatDate(selectedVersionData.date)}
								<a href={selectedVersionData.prUrl} target="_blank" rel="noopener noreferrer" class="pr-link">
									PR #{selectedVersionData.prUrl.split('/').pop()}
								</a>
							</span>
						</div>
					</div>

					{#if selectedVersionData.markdownBody}
						<div class="markdown-body-block">
							<MarkdownBlock content={selectedVersionData.markdownBody} />
						</div>
					{:else}
						{#if selectedVersionData.diff.length > 0}
							<div class="diff-block">
								<h4 class="info-label">Changes / Limitations</h4>
								<div class="diff-content">
									{#each selectedVersionData.diff as change}
										<MarkdownBlock content={change} />
									{/each}
								</div>
							</div>
						{/if}

						<div class="info-fields">
							<div class="info-field">
								<h4 class="info-label">Heuristic</h4>
								<p class="info-value">{selectedVersionData.heuristicSummary}</p>
							</div>
							<div class="info-field">
								<h4 class="info-label">Rationale</h4>
								{#if selectedVersionData.rationale}
									<MarkdownBlock content={selectedVersionData.rationale} />
								{:else}
									<p class="info-value">(No rationale provided)</p>
								{/if}
							</div>
							<div class="info-field">
								<h4 class="info-label">Data Sources</h4>
								<p class="info-value muted">{selectedVersionData.dataSources.join(', ')}</p>
							</div>
						</div>
					{/if}
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

				<!-- All rankings -->
				<div class="rank-block">
					<details class="all-rankings-details">
						<summary class="all-rankings-summary">
							<span class="rank-icon rank-icon--muted">▽</span>
							<h3 class="rank-heading">All rankings</h3>
						</summary>
						{#if results.length > 0}
							<ol class="all-rankings-list">
								{#each results as project}
									<li class="all-rankings-item">
										<span class="all-rankings-rank">#{project.rank}</span>
										<a href={project.url} target="_blank" rel="noopener noreferrer" class="all-rankings-link">
											{project.name}
										</a>
										<span class="all-rankings-score">{project.score.toFixed(2)}</span>
									</li>
								{/each}
							</ol>
						{:else}
							<p class="empty">No data for this version.</p>
						{/if}
					</details>
				</div>
			{/if}
		</div>
	</section>

	<hr class="divider" />

	<!-- What we're doing -->
	<section id="showcase" class="showcase">
		<h2 class="section-title">
			<span class="title-bar" style="background:hsl(var(--chart-4))"></span>
			What we're doing
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
				<AvatarCard name={member.name} photo={member.photo} color={color} />
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
	.panel-header-row {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.panel-header-main {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}
	.panel-meta {
		font-size: 0.88rem;
		color: rgba(26, 26, 26, 0.7);
	}
	.panel-meta .pr-link {
		margin-left: 0.35rem;
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
	.markdown-body-block {
		margin-top: 0.5rem;
	}
	.diff-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.35rem;
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

	.all-rankings-details {
		border: 1px solid rgba(26, 26, 26, 0.12);
		border-radius: 2px;
	}
	.all-rankings-summary {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		cursor: pointer;
		list-style: none;
	}
	.all-rankings-summary::-webkit-details-marker {
		display: none;
	}
	.all-rankings-list {
		max-height: 400px;
		overflow-y: auto;
		margin: 0;
		padding: 0.5rem 0.75rem 0.75rem 1rem;
		list-style: none;
		border-top: 1px solid rgba(26, 26, 26, 0.08);
	}
	.all-rankings-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0;
		font-size: 0.85rem;
		border-bottom: 1px solid rgba(26, 26, 26, 0.06);
	}
	.all-rankings-item:last-child {
		border-bottom: none;
	}
	.all-rankings-rank {
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 600;
		color: rgba(26, 26, 26, 0.5);
		min-width: 2.5rem;
	}
	.all-rankings-link {
		flex: 1;
		color: #1a1a1a;
		text-decoration: none;
		word-break: break-all;
	}
	.all-rankings-link:hover {
		text-decoration: underline;
		color: #d62828;
	}
	.all-rankings-score {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.8rem;
		color: rgba(26, 26, 26, 0.5);
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
