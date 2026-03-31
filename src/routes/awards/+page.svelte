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

	let { data }: {
		data: {
			versions: Version[];
			resultsMap: Record<string, Project[]>;
			resultsMeta?: Record<string, boolean>;
			hasAssessments?: Record<string, boolean>;
			currentVersion: string;
			processLogMarkdown?: string;
			dataLogMarkdown?: string;
		};
	} = $props();

	let versions = $state(data.versions as Version[]);
	let resultsMap = $state(data.resultsMap as Record<string, Project[]>);
	let resultsMeta = $state((data.resultsMeta ?? {}) as Record<string, boolean>);
	const hasAssessments = data.hasAssessments ?? {};

	let selectedVersion = $state(data.currentVersion as string);

	const CODEOWNERS_URL =
		'https://github.com/nwspk/politech-awards-2026/blob/main/.github/CODEOWNERS';
	const EVALUATION_REPO = 'https://github.com/nwspk/politech-awards-2026';
	const LUMA_SHOWCASE_URL = 'https://luma.com/4j8zzq1s';
	const PROCESS_URL =
		'https://github.com/nwspk/politech-awards-2026/blob/main/docs/logs/process-log.md';
	const ITERATIONS_LOG_URL =
		'https://github.com/nwspk/politech-awards-2026/blob/main/docs/logs/iterations-log.md';
	const DATA_LOG_URL = 'https://github.com/nwspk/politech-awards-2026/blob/main/docs/logs/data-log.md';

	const SHOWCASE_DATE = new Date('2026-03-31');
	let daysRemaining = $state<number | null>(null);
	type DataView = 'attempts' | 'quality';
	let activeDataView = $state<DataView>('attempts');
	let selectedProcessMeetingTitle = $state('');

	const chartColors = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];

	const selectedVersionData = $derived(versions.find((v) => v.version === selectedVersion));
	const versionAuthorMember = $derived(
		selectedVersionData?.author ? authorToMember(selectedVersionData.author) : null
	);
	const versionAuthorMembers = $derived(
		selectedVersionData?.authors
			? selectedVersionData.authors.map((a) => authorToMember(a)).filter(Boolean)
			: versionAuthorMember
				? [versionAuthorMember]
				: []
	);
	const results = $derived(resultsMap[selectedVersion] ?? []);
	const top5 = $derived(results.slice(0, 5));
	const processLogMarkdown = $derived((data.processLogMarkdown ?? '') as string);
	const dataLogMarkdown = $derived((data.dataLogMarkdown ?? '') as string);
	type MarkdownSection = { title: string; body: string };
	type OpenQuestionItem = {
		question: string;
		area: string;
		whyUnresolved: string;
		potentialIdeas: string;
		status: string;
	};

	function markdownToSections(markdown: string): MarkdownSection[] {
		if (!markdown?.trim()) return [];
		const normalized = markdown.replace(/\r\n/g, '\n').trim();
		const parts = normalized.split(/\n(?=##\s+)/g);
		return parts
			.map((part) => {
				const lines = part.trim().split('\n');
				const first = lines[0] ?? '';
				if (first.startsWith('## ')) {
					return {
						title: first.replace(/^##\s+/, '').trim(),
						body: lines.slice(1).join('\n').trim()
					};
				}
				return {
					title: 'Overview',
					body: part.trim()
				};
			})
			.filter((s) => s.body.length > 0);
	}

	function splitByHeading(markdown: string, level: number): MarkdownSection[] {
		if (!markdown?.trim()) return [];
		const normalized = markdown.replace(/\r\n/g, '\n').trim();
		const marker = '#'.repeat(level);
		const parts = normalized.split(new RegExp(`\\n(?=${marker}\\s+)`, 'g'));
		return parts
			.map((part) => {
				const lines = part.trim().split('\n');
				const first = lines[0] ?? '';
				if (first.startsWith(`${marker} `)) {
					return {
						title: first.replace(new RegExp(`^${marker}\\s+`), '').trim(),
						body: lines.slice(1).join('\n').trim()
					};
				}
				return {
					title: 'Overview',
					body: part.trim()
				};
			})
			.filter((s) => s.body.length > 0);
	}

	function extractOpenQuestionsFromMarkdown(markdown: string): OpenQuestionItem[] {
		if (!markdown?.trim()) return [];
		const lines = markdown.replace(/\r\n/g, '\n').split('\n');
		const tableStart = lines.findIndex((line) => line.trim().startsWith('|'));
		if (tableStart < 0) return [];
		const tableLines: string[] = [];
		for (let i = tableStart; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line.startsWith('|')) break;
			tableLines.push(line);
		}
		if (tableLines.length < 3) return [];
		const headers = tableLines[0]
			.split('|')
			.map((x) => x.trim().toLowerCase())
			.filter(Boolean);
		const rows = tableLines
			.slice(2)
			.map((line) => line.split('|').map((x) => x.trim()).filter(Boolean))
			.filter((cells) => cells.length > 0);
		if (headers.length === 0 || rows.length === 0) return [];

		const headerIndex = (name: string) => headers.findIndex((h) => h === name);
		const idxStatus = headerIndex('status');
		const idxArea = headerIndex('area');
		const idxQuestion = headerIndex('question');
		const idxWhy = headerIndex('why unresolved');
		const idxNextAction = headerIndex('next action');

		return rows
			.map((cells) => ({
				question: cells[idxQuestion] ?? '',
				area: cells[idxArea] ?? '',
				whyUnresolved: cells[idxWhy] ?? '',
				potentialIdeas: cells[idxNextAction] ?? '',
				status: cells[idxStatus] ?? ''
			}))
			.filter((row) => row.question.length > 0);
	}

	function parseDateFromTitle(title: string): number {
		const iso = title.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
		if (iso) {
			const t = Date.parse(iso);
			if (!Number.isNaN(t)) return t;
		}
		const alt = title.match(/\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b/)?.[0];
		if (alt) {
			const t = Date.parse(alt);
			if (!Number.isNaN(t)) return t;
		}
		return 0;
	}

	function parseAttemptOrder(title: string): number {
		const attemptNum = title.match(/attempt\s+(\d+)/i)?.[1];
		if (attemptNum) return Number(attemptNum);
		const dateWeight = parseDateFromTitle(title);
		return dateWeight > 0 ? dateWeight : 0;
	}

	const processSections = $derived(markdownToSections(processLogMarkdown));
	const dataSections = $derived(markdownToSections(dataLogMarkdown));
	const processMeetingNotes = $derived(
		processSections.find((s) => s.title.toLowerCase().startsWith('meeting notes'))
	);
	const processMeetingEntries = $derived(
		splitByHeading(processMeetingNotes?.body ?? '', 3)
			.filter((s) => s.title !== 'Overview')
			.filter((s) => !/\*\*Type\*\*:\s*Milestone/i.test(s.body))
			.sort((a, b) => parseDateFromTitle(b.title) - parseDateFromTitle(a.title))
	);
	const selectedProcessMeeting = $derived(
		processMeetingEntries.find((m) => m.title === selectedProcessMeetingTitle) ?? processMeetingEntries[0]
	);
	const processIntroSections = $derived([] as MarkdownSection[]);
	const processSupportingSections = $derived(
		processSections.filter(
			(s) =>
				s.title !== 'Overview' &&
				s.title !== 'Contributor notes' &&
				!s.title.toLowerCase().startsWith('decision and rationale log') &&
				!s.title.toLowerCase().startsWith('logging protocol') &&
				!s.title.toLowerCase().startsWith('meeting notes')
		)
	);
	const processOpenQuestionsSection = $derived(
		processSupportingSections.find((s) => s.title.toLowerCase().startsWith('open questions'))
	);
	const processOpenQuestionsItems = $derived(
		extractOpenQuestionsFromMarkdown(processOpenQuestionsSection?.body ?? '')
	);
	const processSupportingSectionsOther = $derived(
		processSupportingSections.filter((s) => s !== processOpenQuestionsSection)
	);
	const dataAttempts = $derived(
		dataSections.find((s) => s.title.toLowerCase().startsWith('attempts log'))
	);
	const dataAttemptEntries = $derived(
		splitByHeading(dataAttempts?.body ?? '', 3)
			.filter((s) => s.title !== 'Overview')
			.sort((a, b) => parseAttemptOrder(b.title) - parseAttemptOrder(a.title))
	);
	const dataSupportingSections = $derived(
		dataSections.filter(
			(s) =>
				s.title !== 'Overview' &&
				s.title !== 'Contributor notes' &&
				!s.title.toLowerCase().startsWith('attempts log') &&
				!s.title.toLowerCase().startsWith('canonical status')
		)
	);

	/** Countdown color: 20–30 yellow, 6–19 orange, 0–5 red */
	function countdownColor(days: number): string {
		if (days <= 5) return '#d62828';
		if (days < 20) return 'hsl(var(--chart-1))'; /* orange */
		return 'hsl(var(--chart-4))'; /* yellow */
	}

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

	let assessmentLogVersion = $state<string>('');
	let assessmentLogPage = $state(0);
	const ALOG_PAGE_SIZE = 10;

	const assessmentLogVersionData = $derived(
		versions.find(v => v.version === assessmentLogVersion) ?? versions[0]
	);
	const assessmentLogProjects = $derived(
		resultsMap[assessmentLogVersionData?.version ?? ''] ?? []
	);
	const assessmentLogPage_projects = $derived(
		assessmentLogProjects.slice(
			assessmentLogPage * ALOG_PAGE_SIZE,
			(assessmentLogPage + 1) * ALOG_PAGE_SIZE
		)
	);
	const assessmentLogTotalPages = $derived(
		Math.ceil(assessmentLogProjects.length / ALOG_PAGE_SIZE)
	);

	// Assessment text is lazy-loaded client-side to keep the server payload small.
	// Cache: version → map of url → { assessment, assessment_synthetic }
	type AssessmentEntry = { assessment: string; assessment_synthetic: boolean };
	let assessmentCache = $state<Record<string, Record<string, AssessmentEntry>>>({});
	let assessmentLoading = $state(false);

	const AWARDS_REPO_RAW = 'https://raw.githubusercontent.com/nwspk/politech-awards-2026/main';

	async function loadAssessments(version: string) {
		if (assessmentCache[version] !== undefined) return;
		assessmentLoading = true;
		try {
			const res = await fetch(
				`${AWARDS_REPO_RAW}/iterations/${version}/results.json`,
				{ cache: 'no-store' }
			);
			if (res.ok) {
				const raw: unknown = await res.json();
				const items: unknown[] = Array.isArray(raw)
					? raw
					: (raw as { projects?: unknown[] })?.projects ?? [];
				const byUrl: Record<string, AssessmentEntry> = {};
				for (const x of items) {
					const item = x as Record<string, unknown>;
					const url = (item.url ?? item.link ?? '') as string;
					if (url) {
						byUrl[url] = {
							assessment: (item.assessment ?? '') as string,
							assessment_synthetic: (item.assessment_synthetic ?? false) as boolean
						};
					}
				}
				assessmentCache = { ...assessmentCache, [version]: byUrl };
			} else {
				assessmentCache = { ...assessmentCache, [version]: {} };
			}
		} catch {
			assessmentCache = { ...assessmentCache, [version]: {} };
		}
		assessmentLoading = false;
	}

	onMount(() => {
		if (!browser) return;
		const params = new URLSearchParams(window.location.search);
		const v = params.get('version');
		const validVersions = versions.map((x) => x.version);
		if (v && validVersions.includes(v)) {
			selectedVersion = v;
		}
		if (!selectedProcessMeetingTitle && processMeetingEntries.length > 0) {
			selectedProcessMeetingTitle = processMeetingEntries[0].title;
		}
		// Countdown to showcase: days from start of today to showcase date
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const end = new Date(SHOWCASE_DATE);
		end.setHours(0, 0, 0, 0);
		const diffMs = end.getTime() - today.getTime();
		daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

		// Pre-load assessments for the default assessment-log version
		const initialAssessmentVersion = versions[0]?.version;
		if (initialAssessmentVersion) loadAssessments(initialAssessmentVersion);
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
		<div class="hero-content">
			<h1>The Political Technology Awards</h1>
			<p class="subtitle">
				The Political Technology Awards is an open evaluation exercise run by the
				2025–26 Newspeak House fellowship cohort. Review the iterations,
				<a href="#showcase" class="subtitle-link">read about the process</a>, and join us at the
				<a href={LUMA_SHOWCASE_URL} target="_blank" rel="noopener noreferrer" class="subtitle-link">Showcase on March 31, 2026</a>
				to hear all about it!
			</p>
			<div class="hero-actions">
				<button
					class="action-btn action-btn--filled"
					style="border-left-color: hsl(var(--chart-1))"
					onclick={() => scrollTo('rankings')}
				>
					See the Evaluation
				</button>
				<button
					class="action-btn action-btn--outline"
					style="border-left-color: hsl(var(--chart-5))"
					onclick={() => scrollTo('assessment-log')}
				>
					Project Assessments
				</button>
				<button
					class="action-btn action-btn--outline"
					style="border-left-color: hsl(var(--chart-2))"
					onclick={() => scrollTo('process-log')}
				>
					Review the Process
				</button>
				<button
					class="action-btn action-btn--outline"
					style="border-left-color: hsl(var(--chart-3))"
					onclick={() => scrollTo('data-log')}
				>
					See the data
				</button>
				<a
					class="action-btn action-btn--outline"
					style="border-left-color: hsl(var(--chart-4))"
					href={LUMA_SHOWCASE_URL}
					target="_blank"
					rel="noopener noreferrer"
				>
					Attend the Showcase!
				</a>
			</div>
		</div>
		{#if daysRemaining !== null}
			<div
				class="countdown-box"
				style="border-left-color: {countdownColor(daysRemaining)}"
			>
				<span
					class="countdown-number"
					style="color: {countdownColor(daysRemaining)}"
				>
					{daysRemaining}
				</span>
				<span class="countdown-label">
					day{daysRemaining === 1 ? '' : 's'} until the Showcase!
				</span>
			</div>
		{/if}
	</section>

	<hr class="divider" />

	<!-- Rankings + logs -->
	<section id="rankings" class="rankings-section">
		<h2 class="section-title">
			<span class="title-bar" style="background:hsl(var(--chart-1))"></span>
			Evaluation / Algorithm (timeline + rankings)
		</h2>
		<div class="tab-info" style="border-left-color:hsl(var(--chart-1))">
			<p class="tab-info-text">
				Browse the active algorithm timeline and rankings. Each version captures the scoring
				logic, rationale, and ranked outputs from the same evaluation pipeline.
			</p>
		</div>

		<div class="rankings-grid">
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
							{#if versionAuthorMembers.length > 0}
								{#each versionAuthorMembers as member, mi}
									<AvatarCard
										name={member.name}
										photo={member.photo}
										color={chartColors[mi % chartColors.length]}
									/>
								{/each}
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
										PR #{selectedVersionData.prNumber}
									</a>
									{#if selectedVersionData.prStatus}
										<span class="pr-status pr-status--{selectedVersionData.prStatus}">{selectedVersionData.prStatus}</span>
									{/if}
								</span>
							</div>
						</div>

						{#if selectedVersionData.markdownBody}
							<div class="markdown-body-block">
								<MarkdownBlock content={selectedVersionData.markdownBody} />
							</div>
						{:else}
							<div class="info-fields info-fields--ordered">
								<div class="info-field">
									<h4 class="info-label">Heuristic</h4>
									<div class="info-value">
										<MarkdownBlock content={selectedVersionData.heuristicSummary} />
									</div>
								</div>
								<div class="info-field">
									<h4 class="info-label">Rationale</h4>
									{#if selectedVersionData.rationale}
										<div class="info-value">
											<MarkdownBlock content={selectedVersionData.rationale} />
										</div>
									{:else}
										<p class="info-value">(No rationale provided)</p>
									{/if}
								</div>
								<div class="info-field">
									<h4 class="info-label">Data Sources</h4>
									<p class="info-value muted">{selectedVersionData.dataSources.join(', ')}</p>
								</div>
								{#if selectedVersionData.diff.length > 0}
									<div class="info-field">
										<h4 class="info-label">Changes / Limitations</h4>
										<div class="diff-content">
											{#each selectedVersionData.diff as change}
												<MarkdownBlock content={change} />
											{/each}
										</div>
									</div>
								{/if}
								{#if selectedVersionData.assessment}
									<div class="info-field">
										<h4 class="info-label">Assessment</h4>
										<div class="info-value">
											<MarkdownBlock content={selectedVersionData.assessment} />
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>

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
		</div>

		<hr class="divider divider--inner" />

		<div id="assessment-log" class="logs-stack">
			<h2 class="section-title">
				<span class="title-bar" style="background:hsl(var(--chart-5))"></span>
				Project Assessment Log
			</h2>
			<div class="tab-info" style="border-left-color:hsl(var(--chart-5))">
				<p class="tab-info-text">
					Each iteration's ranked projects with assessments. Assessments marked * were inferred from the heuristic — earlier iterations did not produce per-project rationale.
				</p>
			</div>

			<div class="alog-timeline-nav">
				{#each versions as ver, vi}
					<button
						type="button"
						class="alog-tab"
						class:alog-tab--active={assessmentLogVersionData?.version === ver.version}
						style="--tab-color:hsl(var(--{chartColors[vi % chartColors.length]}))"
						onclick={() => { assessmentLogVersion = ver.version; assessmentLogPage = 0; loadAssessments(ver.version); }}
					>
						<span class="alog-tab-ver">{ver.version}</span>
						{#if hasAssessments[ver.version]}
							<span class="alog-tab-dot alog-tab-dot--real" title="jury/agent assessments available"></span>
						{:else}
							<span class="alog-tab-dot alog-tab-dot--synthetic" title="heuristic only"></span>
						{/if}
					</button>
				{/each}
			</div>

			{#if assessmentLogVersionData}
				{@const activeColor = chartColors[versions.findIndex(v => v.version === assessmentLogVersionData.version) % chartColors.length]}
				{@const versionAssessmentMap = assessmentCache[assessmentLogVersionData.version]}
				{@const hasSyntheticOnPage = versionAssessmentMap
					? assessmentLogPage_projects.some(p => versionAssessmentMap[p.url]?.assessment_synthetic)
					: false}
				<div class="alog-panel" style="border-left-color:hsl(var(--{activeColor}))">
					<div class="alog-panel-header">
						<span class="alog-panel-ver" style="color:hsl(var(--{activeColor}))">{assessmentLogVersionData.version}</span>
						<span class="alog-panel-title">{assessmentLogVersionData.title}</span>
						<span class="alog-panel-meta">{formatDate(assessmentLogVersionData.date)} · {assessmentLogProjects.length} projects</span>
					</div>

					<div class="alog-project-list">
						{#each assessmentLogPage_projects as project}
							{@const cached = versionAssessmentMap?.[project.url]}
							<div class="alog-project" style="border-left-color:hsl(var(--{activeColor}))">
								<div class="alog-project-meta">
									<span class="alog-project-rank">#{project.rank}</span>
									<a href={project.url} target="_blank" rel="noopener noreferrer" class="alog-project-name">{project.name}</a>
									<span class="alog-project-score">{project.score.toFixed(1)}</span>
								</div>
								{#if project.summary}
									<p class="alog-project-summary">{project.summary}</p>
								{/if}
								{#if cached?.assessment}
									<p class="alog-project-assessment">{cached.assessment}{cached.assessment_synthetic ? ' *' : ''}</p>
								{:else if versionAssessmentMap === undefined && assessmentLoading}
									<p class="alog-project-assessment alog-loading">Loading assessments…</p>
								{/if}
							</div>
						{/each}
					</div>

					{#if assessmentLogTotalPages > 1}
						<div class="alog-pagination">
							<button
								type="button"
								class="alog-page-btn"
								disabled={assessmentLogPage === 0}
								onclick={() => assessmentLogPage--}
							>← prev</button>
							<span class="alog-page-info">
								{assessmentLogPage + 1} / {assessmentLogTotalPages}
								<span class="alog-page-count">(#{assessmentLogPage * ALOG_PAGE_SIZE + 1}–#{Math.min((assessmentLogPage + 1) * ALOG_PAGE_SIZE, assessmentLogProjects.length)})</span>
							</span>
							<button
								type="button"
								class="alog-page-btn"
								disabled={assessmentLogPage >= assessmentLogTotalPages - 1}
								onclick={() => assessmentLogPage++}
							>next →</button>
						</div>
					{/if}

					{#if hasSyntheticOnPage}
						<p class="alog-synthetic-note">* Assessment inferred from scoring heuristic — this iteration did not produce per-project rationale</p>
					{/if}
				</div>
			{/if}
		</div>

		<hr class="divider divider--inner" />

		<div id="process-log" class="logs-stack">
			<h2 class="section-title">
				<span class="title-bar" style="background:hsl(var(--chart-2))"></span>
				Process (meetings + discussions)
			</h2>
			<div class="tab-info" style="border-left-color:hsl(var(--chart-2))">
				<p class="tab-info-text">
					This log captures committee meetings, governance decisions, and open tradeoffs so
					deliberation remains public, inspectable, and contestable.
				</p>
			</div>
			<div class="logs-panel">
				{#if processLogMarkdown}
					{#if processMeetingEntries.length > 0}
						<h3 class="log-group-heading">Committee Meetings</h3>
						<div class="process-grid">
							<aside class="process-sidebar">
								<h4 class="info-label">Meeting dates</h4>
								<div class="process-date-list">
									{#each processMeetingEntries as meeting, i}
										<button
											class="action-btn action-btn--outline process-date-btn {selectedProcessMeeting?.title === meeting.title ? 'process-date-btn--active' : ''}"
											type="button"
											style={`border-left-color:hsl(var(--${chartColors[i % chartColors.length]}))`}
											onclick={() => (selectedProcessMeetingTitle = meeting.title)}
										>
											{meeting.title}
										</button>
									{/each}
								</div>
							</aside>
							<div class="process-main">
								{#if selectedProcessMeeting}
									<article class="meeting-card" style="border-left-color:hsl(var(--chart-2))">
										<header class="meeting-card-header">
											<span class="meeting-badge">Current view</span>
											<h4 class="meeting-title">{selectedProcessMeeting.title}</h4>
										</header>
										<div class="meeting-card-body">
											<MarkdownBlock content={selectedProcessMeeting.body} />
										</div>
									</article>
								{/if}
							</div>
						</div>
					{/if}
					{#if processSupportingSections.length > 0}
						<hr class="divider divider--inner-sm" />
						<h3 class="log-group-heading">Open Questions & Further Notes</h3>
						<p class="log-caption">
							Outstanding questions and unresolved tradeoffs currently shaping the evaluation process.
						</p>
						<div class="open-notes-list">
							{#if processOpenQuestionsItems.length > 0}
								{#each processOpenQuestionsItems as item, i}
									<details class="open-notes-item" open={i === 0}>
										<summary class="open-notes-summary">
											<span class="open-notes-index">Q{i + 1}</span>
											<span class="open-notes-title">{item.question}</span>
										</summary>
										<div
											class="open-notes-body"
											style={`border-left-color:hsl(var(--${chartColors[(i + 2) % chartColors.length]}))`}
										>
											<div class="open-notes-fields">
												<p><strong>Area:</strong> {item.area || '—'}</p>
												<p><strong>Why unresolved:</strong> {item.whyUnresolved || '—'}</p>
												<p><strong>Potential ideas to resolve:</strong> {item.potentialIdeas || '—'}</p>
											</div>
										</div>
									</details>
								{/each}
							{/if}
							{#each processSupportingSectionsOther as section, i}
								<details class="open-notes-item" open={processOpenQuestionsItems.length === 0 && i === 0}>
									<summary class="open-notes-summary">
										<span class="open-notes-index">N{i + 1}</span>
										<span class="open-notes-title">{section.title}</span>
									</summary>
									<div
										class="open-notes-body"
										style={`border-left-color:hsl(var(--${chartColors[(i + 2) % chartColors.length]}))`}
									>
										<MarkdownBlock content={section.body} />
									</div>
								</details>
							{/each}
						</div>
					{/if}
				{:else}
					<p class="logs-empty">
						Process log unavailable right now.
						<a href={PROCESS_URL} target="_blank" rel="noopener noreferrer">View on GitHub →</a>
					</p>
				{/if}
			</div>
		</div>
		<hr class="divider divider--inner" />

		<div id="data-log" class="logs-stack">
			<h2 class="section-title">
				<span class="title-bar" style="background:hsl(var(--chart-3))"></span>
				Data Gathering
			</h2>
			<div class="tab-info" style="border-left-color:hsl(var(--chart-3))">
				<p class="tab-info-text">
					Track each data collection attempt, what changed in sources and cleaning, and known
					quality gaps that affect downstream evaluation.
				</p>
			</div>
			<div class="logs-panel">
				{#if dataLogMarkdown}
					<div class="data-grid">
						<aside class="data-sidebar">
							<h4 class="info-label">Data view</h4>
							<div class="data-nav-list">
								<button
									type="button"
									class="action-btn action-btn--outline data-nav-btn {activeDataView === 'attempts' ? 'data-nav-btn--active' : ''}"
									style="border-left-color:hsl(var(--chart-3))"
									onclick={() => (activeDataView = 'attempts')}
								>
									Attempts
								</button>
								<button
									type="button"
									class="action-btn action-btn--outline data-nav-btn {activeDataView === 'quality' ? 'data-nav-btn--active' : ''}"
									style="border-left-color:hsl(var(--chart-2))"
									onclick={() => (activeDataView = 'quality')}
								>
									Quality & Methods
								</button>
							</div>
						</aside>
						<div class="data-main">
							{#if activeDataView === 'attempts'}
								{#if dataAttemptEntries.length > 0}
									<h3 class="log-group-heading">Data Gathering Attempts</h3>
									<div class="attempt-list">
										{#each dataAttemptEntries as attempt}
											<article class="attempt-card">
												<header class="attempt-card-header">
													<span class="attempt-pill">{attempt.title}</span>
												</header>
												<div class="attempt-card-body">
													<MarkdownBlock content={attempt.body} />
												</div>
											</article>
										{/each}
									</div>
								{:else}
									<p class="logs-empty">No data attempts found.</p>
								{/if}
							{:else}
								{#if dataSupportingSections.length > 0}
									<h3 class="log-group-heading">Data Quality & Methods</h3>
									<div class="log-sections">
										{#each dataSupportingSections as section, i}
											<div
												class="log-section-card log-section-card--plain"
												style={`border-left-color:hsl(var(--${chartColors[(i + 1) % chartColors.length]}))`}
											>
												<h3 class="log-section-title">{section.title}</h3>
												<MarkdownBlock content={section.body} />
											</div>
										{/each}
									</div>
								{:else}
									<p class="logs-empty">No data quality notes found.</p>
								{/if}
							{/if}
						</div>
					</div>
				{:else}
					<p class="logs-empty">
						Data log unavailable right now.
						<a href={DATA_LOG_URL} target="_blank" rel="noopener noreferrer">View on GitHub →</a>
					</p>
				{/if}
			</div>
		</div>

	</section>

	<hr class="divider" />

	<!-- What we're doing -->
	<section id="showcase" class="showcase">
		<span id="documents" class="anchor"></span>
		<h2 class="section-title">
			<span class="title-bar" style="background:hsl(var(--chart-4))"></span>
			What we're doing
		</h2>
		<div class="showcase-body">
			<p>
				The Political Technology Awards is an open evaluation exercise run by the 2025–26
				Newspeak House fellowship cohort. We're building a <strong>public, inspectable
				ranking</strong> of civic and political technology projects — the kind of tools that help citizens understand institutions, participate in democracy, and hold power to account.
			</p>
			<p>
				Our evaluation process is iterative and transparent. We use a scoring algorithm that evolves over time. Each version applies different heuristics and produces a ranked list. The algorithm lives in a 
				<a href={EVALUATION_REPO} target="_blank" rel="noopener noreferrer">public GitHub repo</a>; you can inspect the code, the pull requests, and the rationale for every change. We may add written assessments per project as the evaluation matures.
			</p>
			<p>
				Rankings are political. By making our process transparent and iterative, we hope to surface both strong projects and the tradeoffs inherent in any evaluation framework. A simple tool that empowers marginalized communities ranks higher than a technically impressive platform that reinforces existing power structures.
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
				class="action-btn action-btn--outline"
				style="border-left-color: hsl(var(--chart-1))"
				href="https://github.com/nwspk/politech-awards-2026/blob/main/CONTRIBUTING.md"
				target="_blank"
				rel="noopener noreferrer"
			>
				Make a contribution to the evaluation
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

	<p class="footer-sources">
		Source documents:
		<a href={EVALUATION_REPO} target="_blank" rel="noopener noreferrer">evaluation repository</a>,
		<a href={ITERATIONS_LOG_URL} target="_blank" rel="noopener noreferrer">iterations log</a>,
		<a href={DATA_LOG_URL} target="_blank" rel="noopener noreferrer">data log</a>, and
		<a href={PROCESS_URL} target="_blank" rel="noopener noreferrer">process log</a>.
	</p>
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
	.divider--inner {
		margin: 2.25rem 0;
	}
	.divider--inner-sm {
		margin: 1.35rem 0 1rem;
	}

	/* Hero */
	.hero {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		align-items: stretch;
		justify-content: space-between;
	}

	.hero-content {
		flex: 1;
		min-width: 0;
	}

	.hero h1 {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 600;
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
		letter-spacing: -0.01em;
		line-height: 1.1;
		margin: 0 0 0.75rem 0;
	}

	.countdown-box {
		/* Same box style as VersionTimeline .version-btn and ProjectCard .card--top */
		border: 2px solid #1a1a1a;
		border-left-width: 4px;
		background: rgba(255, 255, 255, 0.5);
		min-width: 200px;
		min-height: 140px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 1.25rem 1.5rem;
	}

	.countdown-number {
		font-size: 6.5rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		line-height: 1;
		-webkit-text-stroke: 2px rgba(26, 26, 26, 0.6);
		paint-order: stroke fill;
	}

	.countdown-label {
		font-size: 0.95rem;
		font-weight: 600;
		color: #1a1a1a;
		letter-spacing: 0.02em;
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
	.pr-status {
		margin-left: 0.35rem;
		font-size: 0.8rem;
		text-transform: capitalize;
		color: rgba(26, 26, 26, 0.6);
	}
	.pr-status--merged {
		color: rgba(26, 26, 26, 0.5);
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
	.logs-stack {
		margin-top: 2.25rem;
	}
	.tab-info {
		border: 1px solid rgba(26, 26, 26, 0.14);
		border-left: 4px solid;
		background: rgba(255, 255, 255, 0.58);
		padding: 0.85rem 1rem;
		margin-bottom: 1rem;
	}
	.tab-info-text {
		margin: 0;
		color: rgba(26, 26, 26, 0.78);
		font-size: 0.9rem;
		line-height: 1.55;
	}
	.logs-panel {
		padding: 0;
	}
	.log-sections {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.log-section-card {
		border: 1px solid rgba(26, 26, 26, 0.15);
		border-left: 4px solid;
		background: rgba(255, 255, 255, 0.55);
		padding: 0.65rem 0.8rem 0.35rem;
	}
	.log-section-card--plain {
		background: transparent;
	}
	.log-section-title {
		font-size: 0.95rem;
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 700;
		margin: 0 0 0.35rem;
	}
	.log-caption {
		font-size: 0.88rem;
		line-height: 1.65;
		color: rgba(26, 26, 26, 0.78);
		max-width: 74ch;
		margin: -0.1rem 0 0.8rem;
	}
	.open-notes-list {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}
	.open-notes-item {
		border: 1px solid rgba(26, 26, 26, 0.13);
		background: rgba(255, 255, 255, 0.38);
	}
	.open-notes-summary {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		cursor: pointer;
		padding: 0.6rem 0.75rem;
		list-style: none;
		background: rgba(26, 26, 26, 0.03);
	}
	.open-notes-summary::-webkit-details-marker {
		display: none;
	}
	.open-notes-index {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.15rem 0.35rem;
		border: 1px solid rgba(214, 40, 40, 0.28);
		color: #d62828;
		background: rgba(214, 40, 40, 0.08);
	}
	.open-notes-title {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		font-weight: 700;
		color: #1a1a1a;
	}
	.open-notes-body {
		padding: 0.65rem 0.8rem 0.4rem;
		border-left: 4px solid transparent;
		background: rgba(255, 255, 255, 0.48);
	}
	.open-notes-fields p {
		margin: 0 0 0.55rem 0;
		line-height: 1.5;
	}
	.open-notes-fields p:last-child {
		margin-bottom: 0;
	}
	.log-group-heading {
		font-size: 1.25rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		margin: 1.1rem 0 0.6rem;
	}
	.meeting-list {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.process-grid {
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: 1rem;
		align-items: start;
	}
	.process-sidebar {
		position: sticky;
		top: 0.8rem;
	}
	.process-date-list {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin-top: 0.45rem;
	}
	.process-date-btn {
		text-align: left;
		width: 100%;
		justify-content: flex-start;
	}
	.process-date-btn--active {
		background: #1a1a1a;
		color: #d0d0c4;
		border-color: #1a1a1a;
	}
	.process-main {
		min-width: 0;
	}
	.meeting-card {
		border: 1px solid rgba(26, 26, 26, 0.12);
		border-left: 4px solid;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.58);
		overflow: hidden;
	}
	.meeting-card-header {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.65rem 0.85rem;
		background: rgba(214, 40, 40, 0.06);
		border-bottom: 1px solid rgba(26, 26, 26, 0.08);
	}
	.meeting-badge {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		font-weight: 700;
		color: #d62828;
		border: 1px solid rgba(214, 40, 40, 0.22);
		background: rgba(214, 40, 40, 0.08);
		padding: 0.18rem 0.38rem;
		border-radius: 999px;
	}
	.meeting-title {
		font-size: 0.95rem;
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 700;
		margin: 0;
	}
	.meeting-card-body {
		padding: 0.7rem 0.85rem 0.35rem;
	}
	.attempt-list {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.attempt-card {
		border: 1px solid rgba(26, 26, 26, 0.12);
		background: rgba(255, 255, 255, 0.58);
	}
	.attempt-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 0.8rem;
		background: rgba(214, 40, 40, 0.08);
		border-bottom: 1px solid rgba(26, 26, 26, 0.1);
	}
	.attempt-pill {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.22rem 0.5rem;
		border: 1px solid rgba(26, 26, 26, 0.2);
		background: rgba(255, 255, 255, 0.65);
	}
	.attempt-card-body {
		padding: 0.75rem 0.85rem 0.35rem;
	}
	.data-grid {
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: 1rem;
		align-items: start;
	}
	.data-sidebar {
		position: sticky;
		top: 0.8rem;
	}
	.data-nav-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.45rem;
	}
	.data-nav-btn {
		width: 100%;
		justify-content: flex-start;
		text-align: left;
	}
	.data-nav-btn--active {
		background: #1a1a1a;
		color: #d0d0c4;
		border-color: #1a1a1a;
	}
	.data-main {
		min-width: 0;
	}
	.logs-empty {
		margin: 0.25rem 0 0.75rem;
		color: rgba(26, 26, 26, 0.8);
	}
	.logs-links {
		font-size: 0.86rem;
		margin-top: 1.5rem;
	}
	.footer-sources {
		font-size: 0.84rem;
		color: rgba(26, 26, 26, 0.7);
		border-top: 1px solid rgba(26, 26, 26, 0.15);
		padding-top: 1rem;
		margin-top: 2rem;
	}
	.footer-sources a {
		color: #d62828;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.35);
		text-underline-offset: 2px;
	}
	.footer-sources a:hover {
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
		.process-grid {
			grid-template-columns: 1fr;
		}
		.data-grid {
			grid-template-columns: 1fr;
		}
		.logs-stack {
			margin-top: 1.5rem;
		}

		.hero {
			flex-direction: column;
		}
		.hero-actions {
			width: 100%;
			flex-direction: column;
			gap: 0.55rem;
		}
		.hero-actions .action-btn {
			width: 100%;
			justify-content: flex-start;
		}

		.countdown-box {
			width: 100%;
		}

		.hero h1 {
			font-size: clamp(1.8rem, 6vw, 2.5rem);
		}
		.subtitle {
			max-width: none;
		}
		.tab-info {
			padding: 0.7rem 0.8rem;
		}
		.tab-info-text {
			font-size: 0.85rem;
			line-height: 1.5;
		}
		.log-group-heading {
			font-size: 1.1rem;
		}
		.process-sidebar,
		.data-sidebar {
			position: static;
			top: auto;
		}
		.process-date-btn,
		.data-nav-btn {
			width: 100%;
		}
		.meeting-card-header {
			flex-wrap: wrap;
		}
		.all-rankings-item {
			flex-wrap: wrap;
			row-gap: 0.2rem;
		}
		.all-rankings-score {
			margin-left: auto;
		}
		.footer-sources {
			font-size: 0.8rem;
			line-height: 1.5;
		}
		:global(.awards-page table) {
			display: block;
			max-width: 100%;
			overflow-x: auto;
		}
		:global(.awards-page th),
		:global(.awards-page td) {
			white-space: nowrap;
		}
		:global(.awards-page pre) {
			max-width: 100%;
			overflow-x: auto;
		}

		.avatar-row {
			gap: 1.25rem;
		}
	}

	/* Assessment Log */
	.alog-timeline-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 1rem;
	}
	.alog-tab {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.4rem 0.75rem;
		border: 2px solid rgba(26, 26, 26, 0.18);
		border-left: 3px solid var(--tab-color);
		background: rgba(255, 255, 255, 0.3);
		cursor: pointer;
		color: rgba(26, 26, 26, 0.65);
		transition: all 0.12s ease;
	}
	.alog-tab:hover {
		background: rgba(255, 255, 255, 0.6);
		color: #1a1a1a;
	}
	.alog-tab--active {
		background: rgba(255, 255, 255, 0.7);
		color: #1a1a1a;
		border-color: rgba(26, 26, 26, 0.35);
		border-left-color: var(--tab-color);
	}
	.alog-tab-ver {
		line-height: 1;
	}
	.alog-tab-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.alog-tab-dot--real {
		background: #1a6b1a;
	}
	.alog-tab-dot--synthetic {
		background: rgba(26, 26, 26, 0.25);
	}
	.alog-panel {
		border: 1px solid rgba(26, 26, 26, 0.12);
		border-left: 4px solid;
		background: rgba(255, 255, 255, 0.3);
	}
	.alog-panel-header {
		display: flex;
		align-items: baseline;
		gap: 0.65rem;
		padding: 0.65rem 0.85rem;
		border-bottom: 1px solid rgba(26, 26, 26, 0.08);
		background: rgba(255, 255, 255, 0.4);
		flex-wrap: wrap;
	}
	.alog-panel-ver {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.82rem;
		font-weight: 700;
	}
	.alog-panel-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: #1a1a1a;
		flex: 1;
	}
	.alog-panel-meta {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		color: rgba(26, 26, 26, 0.5);
	}
	.alog-project-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	.alog-project {
		padding: 0.7rem 0.85rem;
		border-left: 3px solid transparent;
		border-bottom: 1px solid rgba(26, 26, 26, 0.06);
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.alog-project:last-child {
		border-bottom: none;
	}
	.alog-project-meta {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.alog-project-rank {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		font-weight: 700;
		color: rgba(26, 26, 26, 0.4);
		min-width: 1.75rem;
	}
	.alog-project-name {
		font-size: 0.88rem;
		font-weight: 700;
		color: #1a1a1a;
		text-decoration: none;
		flex: 1;
	}
	.alog-project-name:hover {
		color: #d62828;
		text-decoration: underline;
	}
	.alog-project-score {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		color: rgba(26, 26, 26, 0.4);
	}
	.alog-project-summary {
		font-size: 0.8rem;
		line-height: 1.5;
		color: rgba(26, 26, 26, 0.55);
		margin: 0;
	}
	.alog-project-assessment {
		font-size: 0.85rem;
		line-height: 1.6;
		color: rgba(26, 26, 26, 0.82);
		margin: 0;
	}
	.alog-loading {
		color: rgba(26, 26, 26, 0.4);
		font-style: italic;
	}
	.alog-pagination {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.85rem;
		border-top: 1px solid rgba(26, 26, 26, 0.08);
		background: rgba(255, 255, 255, 0.35);
	}
	.alog-page-btn {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.3rem 0.65rem;
		border: 1px solid rgba(26, 26, 26, 0.2);
		background: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		color: #1a1a1a;
		transition: background 0.12s ease;
	}
	.alog-page-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.85);
	}
	.alog-page-btn:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.alog-page-info {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.78rem;
		color: rgba(26, 26, 26, 0.65);
		flex: 1;
		text-align: center;
	}
	.alog-page-count {
		color: rgba(26, 26, 26, 0.4);
	}
	.alog-synthetic-note {
		font-size: 0.75rem;
		color: rgba(26, 26, 26, 0.45);
		font-style: italic;
		margin: 0;
		padding: 0.5rem 0.85rem;
		border-top: 1px solid rgba(26, 26, 26, 0.08);
	}
</style>



