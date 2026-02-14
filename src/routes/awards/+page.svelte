<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { committee } from '$lib/data/committee';

	interface Version {
		version: string;
		current: boolean;
		date: string;
		prUrl: string;
		heuristicSummary: string;
		rationale: string;
		dataSources: string[];
		topProject: { name: string; score: number };
		diff: string[];
	}

	interface Project {
		rank: number;
		score: number;
		name: string;
		url: string;
		summary: string;
		assessment: string;
	}

	let { data } = $props();

	let versions = $state(data.versions as Version[]);
	let resultsMap = $state(data.resultsMap as Record<string, Project[]>);
	let resultsMeta = $state((data.resultsMeta ?? {}) as Record<string, boolean>);
	let totalCount = $state(data.totalCount ?? 321);

	let selectedVersion = $state(data.currentVersion as string);

	const EVALUATION_REPO = 'https://github.com/nwspk/politech-awards-2026';
	const CODEOWNERS_URL = 'https://github.com/nwspk/politech-awards-2026/blob/main/.github/CODEOWNERS';
	const LUMA_SHOWCASE_URL = 'https://luma.com/4j8zzq1s';

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
		<p class="tagline">Awards show + open evaluation repo by the 2025–26 fellowship cohort.</p>
		<div class="meta">
			<span class="label">STATUS:</span>
			<span class="value">ACTIVE</span>
			<span class="separator">|</span>
			<span class="label">LONG LIST:</span>
			<span class="value">{totalCount}</span>
			<span class="separator">|</span>
			<span class="label">CURRENT VERSION:</span>
			<span class="value">{selectedVersion}</span>
			<span class="separator">|</span>
			<span class="label">SHOWCASE:</span>
			<span class="value">31 MAR 2026</span>
		</div>
		<nav class="hero-links" aria-label="Quick links">
			<a href="#context" class="bracket-link">【→ What we're doing】</a>
			<a href="#timeline" class="bracket-link">【→ Review the rankings】</a>
			<a href={LUMA_SHOWCASE_URL} class="bracket-link" target="_blank" rel="noopener noreferrer"
				>【→ Attend the showcase】
			</a>
		</nav>
	</section>

	<!-- Project context: what we're doing, how we evaluate -->
	<section id="context" class="section context-section">
		<h2 class="section-title">/// WHAT WE'RE DOING HERE</h2>
		<p>
			The Political Technology Awards is an open evaluation exercise run by the 2025–26 Newspeak House
			fellowship cohort. We're building a <strong>public, inspectable ranking</strong> of civic and political
			technology projects — the kind of tools that help citizens understand institutions, participate in
			democracy, and hold power to account.
		</p>
		<p>
			<strong>How we evaluate:</strong> We use a scoring algorithm that evolves over time. Each version
			applies different heuristics (governance signals, civic impact, data completeness, etc.) and produces
			a ranked list. The algorithm lives in a public GitHub repo; you can inspect the code, the pull
			requests, and the rationale for every change. We may add written assessments per project as the evaluation matures.
		</p>
		<p>
			<strong>Why this matters:</strong> Rankings are political. By making our process transparent and
			iterative, we hope to surface both strong projects and the tradeoffs inherent in any evaluation
			framework.
		</p>
	</section>

	<!-- Showcase -->
	<section class="section">
		<h2 class="section-title">/// SHOWCASE</h2>
		<p>
			<strong>31 March 2026 · Newspeak Hall</strong>
		</p>
		<p>
			The Political Technology Awards culminate in a public event at Newspeak Hall. We'll announce the winning projects
			from our long list of 321 civic and political technology tools. The showcase includes a one-hour walkthrough of
			how the algorithm works, the heuristics we've experimented with, and the tradeoffs we've surfaced along the way.
			There will be a public Q&A so you can ask how we think about legitimacy, automation, and the limits of scoring.
		</p>
		<p>
			<a href={LUMA_SHOWCASE_URL} target="_blank" rel="noopener noreferrer">RSVP via Luma →</a>
		</p>
	</section>

	<!-- Timeline of iterations: left = version buttons, right = info + results -->
	<section id="timeline" class="section timeline-section">
		<h2 class="section-title">/// TIMELINE OF ITERATIONS</h2>
		<p class="timeline-intro">
			Here we use "algorithm" to mean the scoring logic that ranks our long list of 321 projects — the heuristics
			(governance signals, civic impact, keyword matching, etc.) and how they're combined. Each iteration is a proposed
			change to that logic, voted on by the committee. Click through the versions below to see the heuristic, rationale,
			and how the top 5 and bottom 5 shifted as we experimented.
		</p>

		<div class="timeline-layout">
			<div class="timeline-sidebar" role="tablist" aria-label="Algorithm version selector">
				{#each versions as v}
					<button
						class="version-tab"
						class:selected={selectedVersion === v.version}
						role="tab"
						aria-selected={selectedVersion === v.version}
						onclick={() => setVersion(v.version)}
					>
						<span class="version-label">{v.version}</span>
						{#if v.date}
							<span class="version-date">{formatDate(v.date)}</span>
						{/if}
					</button>
				{/each}
			</div>

			{#if selectedVersionData}
			<div class="version-panel">
				<div class="version-header">
					<h3>
						{selectedVersion} · {formatDate(selectedVersionData.date)} ·
						<a href={selectedVersionData.prUrl} target="_blank" rel="noopener noreferrer"
							>【PR #{selectedVersionData.prUrl.split('/').pop()}】
						</a>
					</h3>
				</div>

				{#if resultsMeta[selectedVersion]}
					<p class="results-notice">
						<strong>Note:</strong> The evaluation repo exports a single results file. Rankings below reflect the current algorithm output. Per-version historical results are not yet available.
					</p>
				{/if}

				<p class="heuristic"><strong>Heuristic:</strong> {selectedVersionData.heuristicSummary}</p>
				<p class="rationale"><strong>Rationale:</strong> {selectedVersionData.rationale}</p>
				<p><strong>Data sources:</strong> {selectedVersionData.dataSources.join(', ')}</p>

				<!-- Top 5 | Bottom 5 side by side -->
				<div class="rankings-comparison">
					<div class="ranking-column">
						<h4>Top 5</h4>
						{#if top5.length > 0}
							<ol class="ranking-list">
								{#each top5 as project}
									<li>
										<span class="rank-num">{project.rank}.</span>
										<span class="rank-score">{project.score}</span>
										<a href={project.url} target="_blank" rel="noopener noreferrer"
											>{project.name}</a
										>
										{#if project.summary}
											<span class="rank-summary">— {project.summary}</span>
										{/if}
									</li>
								{/each}
							</ol>
						{:else}
							<p class="empty">No data for this version.</p>
						{/if}
					</div>
					<div class="ranking-column">
						<h4>Bottom 5</h4>
						{#if bottom5.length > 0}
							<ol class="ranking-list">
								{#each bottom5 as project}
									<li>
										<span class="rank-num">{project.rank}.</span>
										<span class="rank-score">{project.score}</span>
										<a href={project.url} target="_blank" rel="noopener noreferrer"
											>{project.name}</a
										>
										{#if project.summary}
											<span class="rank-summary">— {project.summary}</span>
										{/if}
									</li>
								{/each}
							</ol>
						{:else}
							<p class="empty">Not enough projects (need 10+ for bottom 5).</p>
						{/if}
					</div>
				</div>

				{#if selectedVersionData.diff.length > 0}
					<p><strong>Changed since previous version:</strong></p>
					<ul>
						{#each selectedVersionData.diff as change}
							<li>{change}</li>
						{/each}
					</ul>
				{/if}
			</div>
			{/if}
		</div>
	</section>

	<!-- Share your rankings -->
	<section class="section">
		<h2 class="section-title">/// CONTEST THE RANKINGS</h2>
		<p>
			If you have a different take on how to evaluate civic and political technology — a new heuristic, different
			weights, or better data sources — you can propose an iteration. Open a pull request in the evaluation repo,
			describe your heuristic and rationale, and the committee votes on it. The process is documented in
			<a href="https://github.com/nwspk/politech-awards-2026/blob/main/PROCESS.md" target="_blank" rel="noopener noreferrer">PROCESS.md</a>.
		</p>

	</section>

	<!-- Committee (from CODEOWNERS) -->
	<section id="committee" class="section committee-section">
		<h2 class="section-title">/// COMMITTEE</h2>
		<div class="committee-bubbles">
			{#each committee as member}
				<div class="committee-member">
					<span
					class="committee-bubble"
					aria-label={member.name}
					title={member.name}
				>
							{#if member.photo}
								<img src={member.photo} alt="" />
							{:else}
								<span class="initials">{member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
							{/if}
				</span>
				</div>
			{/each}
		</div>
		<p>
			The evaluation is judged by {committee.map((m) => m.name).join(', ').replace(/, ([^,]+)$/, ', and $1')} from the 2025–26 fellowship cohort. The committee is defined in the
			<strong>CODEOWNERS</strong> file in the evaluation repository — everyone listed there can approve
			changes to the algorithm and assessments.
		</p>
		<p>
			<a href={CODEOWNERS_URL} target="_blank" rel="noopener noreferrer">View committee (CODEOWNERS) →</a>
			<span class="separator-inline">|</span>
			<a href="/">→ Full cohort page</a>
		</p>
	</section>
</div>

<style>
	.awards-page {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem 4rem;
		box-sizing: border-box;
		text-align: left;
	}

	.hero {
		margin-bottom: 3rem;
		padding-bottom: 2.5rem;
		border-bottom: 1px solid rgba(26, 26, 26, 0.15);
	}

	.hero h1 {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #0a0a0a;
		letter-spacing: -0.01em;
		line-height: 1.1;
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
		text-align: center;
	}

	.tagline {
		font-size: 1rem;
		line-height: 1.6;
		color: #1a1a1a;
		margin: 0 0 1.5rem 0;
		text-align: center;
	}

	.meta {
		font-size: 0.8rem;
		font-family: 'IBM Plex Mono', monospace;
		color: #666;
		letter-spacing: 0.02em;
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.label { font-weight: 600; color: #4a4a4a; }
	.value { font-weight: 700; color: #5a6a4a; }
	.separator { color: #8a8a8a; }

	.hero-links {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem 1.5rem;
	}

	.bracket-link {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		font-weight: 500;
		color: #1a1a1a;
		text-decoration: none;
		padding: 0.25rem 0.5rem;
		border: 2px solid #1a1a1a;
		background: rgba(255, 255, 255, 0.5);
		transition: all 0.2s ease;
	}

	.bracket-link:hover {
		background: #d62828;
		color: white;
		border-color: #d62828;
	}

	.section {
		margin-bottom: 3rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 1.5rem 0;
		letter-spacing: 0.1em;
		font-family: 'IBM Plex Mono', monospace;
		position: relative;
		padding-left: 0;
	}

	.section-title::before {
		content: '';
		display: block;
		width: 60px;
		height: 2px;
		background: #d62828;
		margin: 0 0 0.5rem 0;
	}

	.section p,
	.section li {
		font-size: 1rem;
		line-height: 1.7;
		color: #1a1a1a;
		margin-bottom: 0.75rem;
	}

	.section ul {
		padding-left: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.section a {
		color: #d62828;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.4);
		text-underline-offset: 2px;
	}

	.section a:hover {
		text-decoration-color: #d62828;
	}

	.separator-inline {
		margin: 0 0.5rem;
		color: #888;
	}

	.results-notice {
		padding: 0.75rem 1rem;
		background: rgba(214, 40, 40, 0.08);
		border-left: 3px solid #d62828;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.context-section p,
	.section p {
		max-width: 72ch;
		text-align: left;
	}

	/* Timeline: left sidebar + right content panel */
	.timeline-intro {
		margin-bottom: 1.5rem;
		max-width: 72ch;
	}

	.timeline-layout {
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 2rem;
		align-items: start;
	}

	.timeline-sidebar {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: sticky;
		top: 120px;
	}

	.version-tab {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
		width: 100%;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		padding: 0.75rem 1rem;
		border: 2px solid #1a1a1a;
		background: rgba(255, 255, 255, 0.6);
		color: #1a1a1a;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.version-tab:hover {
		background: rgba(26, 26, 26, 0.08);
	}

	.version-tab.selected {
		background: #1a1a1a;
		color: white;
		border-color: #1a1a1a;
	}

	.version-label {
		font-weight: 600;
	}

	.version-date {
		font-size: 0.75rem;
		color: inherit;
		opacity: 0.8;
		margin-top: 0.25rem;
	}

	.version-tab.selected .version-date {
		opacity: 0.9;
	}

	.version-panel {
		padding: 1.5rem;
		border: 2px solid rgba(26, 26, 26, 0.2);
		background: rgba(255, 255, 255, 0.6);
		text-align: left;
		min-height: 200px;
	}

	.version-panel h3 {
		font-size: 1.15rem;
		margin: 0 0 1rem 0;
		font-family: 'Crimson Pro', serif;
	}

	.version-panel h3 a {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
	}

	.heuristic,
	.rationale {
		margin-bottom: 1rem;
	}

	/* Top 5 | Bottom 5 side by side */
	.rankings-comparison {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin: 2rem 0 1.5rem;
		text-align: left;
	}

	.ranking-column h4 {
		font-size: 0.85rem;
		font-family: 'IBM Plex Mono', monospace;
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #555;
	}

	.ranking-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.ranking-list li {
		margin-bottom: 0.75rem;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem;
		font-size: 0.95rem;
	}

	.rank-num {
		font-family: 'IBM Plex Mono', monospace;
		color: #888;
		font-size: 0.85rem;
	}

	.rank-score {
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 700;
		color: #5a6a4a;
		min-width: 1.5em;
	}

	.ranking-list li a {
		font-weight: 600;
	}

	.rank-summary {
		width: 100%;
		font-size: 0.85rem;
		color: #555;
		margin-left: 0;
	}

	.empty {
		font-style: italic;
		color: #888;
		font-size: 0.9rem;
	}

	/* Committee bubbles */
	.committee-bubbles {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem 2rem;
		margin-bottom: 1.5rem;
	}

	.committee-member {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.committee-bubble {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		overflow: hidden;
		border: 2px solid rgba(26, 26, 26, 0.2);
		background: rgba(255, 255, 255, 0.6);
		flex-shrink: 0;
		text-decoration: none;
		transition: border-color 0.2s ease, transform 0.2s ease;
	}

	.committee-bubble img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.committee-bubble .initials {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1rem;
		font-weight: 600;
		color: #555;
	}

	@media (max-width: 768px) {
		.awards-page {
			padding: 2rem 1rem 3rem;
			max-width: none;
		}

		.timeline-layout {
			grid-template-columns: 1fr;
		}

		.timeline-sidebar {
			position: static;
			flex-direction: row;
			flex-wrap: wrap;
		}

		.version-tab {
			flex: 1 1 auto;
			min-width: 100px;
		}

		.version-date {
			display: none;
		}

		.rankings-comparison {
			grid-template-columns: 1fr;
		}
	}
</style>
