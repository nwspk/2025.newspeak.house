import type { PageLoad } from './$types';

const REPO_BASE = 'https://raw.githubusercontent.com/nwspk/politech-awards-2026/main';

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

interface RepoIteration {
	version: string;
	date: string | null;
	author: string | null;
	pr_number: number;
	pr_url: string;
	pr_status: string;
	top_project: { name: string; url: string; score: number | null };
	heuristic: string;
	rationale: string | null;
	data_sources: string[];
	keywords?: string[] | null;
	limitations?: string | null;
}

interface RepoResult {
	url: string;
	score: number;
}

function urlToName(urlStr: string): string {
	try {
		const u = new URL(urlStr);
		// Prefer hostname, strip www.
		let name = u.hostname.replace(/^www\./, '');
		// If path is meaningful (not just /), append first segment
		const path = u.pathname.replace(/^\/|\/$/g, '');
		if (path && path !== '' && !path.startsWith('?')) {
			const first = path.split('/')[0];
			if (first && first.length < 40) name = first + '.' + name;
		}
		return name || urlStr;
	} catch {
		return urlStr;
	}
}

function stripMarkdown(text: string): string {
	return text
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/\n+/g, ' ')
		.trim();
}

function toRepoResults(raw: unknown): RepoResult[] {
	if (Array.isArray(raw)) {
		return raw.map((x) => ({
			url: (x as { url?: string }).url ?? (x as { link?: string }).link ?? '',
			score: (x as { score?: number }).score ?? 0
		}));
	}
	if (raw && typeof raw === 'object' && 'projects' in raw) {
		return toRepoResults((raw as { projects: unknown }).projects);
	}
	return [];
}

function toProjects(repoResults: RepoResult[]): Project[] {
	const sorted = [...repoResults].sort((a, b) => {
		const scoreA = a.score ?? 0;
		const scoreB = b.score ?? 0;
		if (scoreB !== scoreA) return scoreB - scoreA;
		return (a.url ?? '').localeCompare(b.url ?? '');
	});
	return sorted.map((r, i) => ({
		rank: i + 1,
		score: r.score,
		name: urlToName(r.url),
		url: r.url,
		summary: '',
		assessment: ''
	}));
}

export const load: PageLoad = async ({ fetch }) => {
	const iterationsRes = await fetch(`${REPO_BASE}/iterations.json`);
	if (!iterationsRes.ok) throw new Error('Failed to fetch iterations');
	const repoIterations: RepoIteration[] = await iterationsRes.json();

	// Try per-version results first (results/v1.json, results/v2.json, etc.)
	// Repo may not export these yet — fall back to main results.json
	const resultsMap: Record<string, { projects: Project[]; isFallback: boolean }> = {};
	const versionIds = repoIterations.map((it) => it.version);

	for (const ver of versionIds) {
		const versionRes = await fetch(`${REPO_BASE}/results/${ver}.json`);
		if (versionRes.ok) {
			const data = await versionRes.json();
			const repoResults = toRepoResults(data);
			const projects = toProjects(repoResults);
			resultsMap[ver] = { projects, isFallback: false };
		} else {
			resultsMap[ver] = { projects: [], isFallback: true };
		}
	}

	// Fallback: use main results.json for any version that didn't have its own file
	const mainRes = await fetch(`${REPO_BASE}/results.json`);
	const mainData = mainRes.ok ? await mainRes.json() : [];
	const mainResults = toRepoResults(mainData);
	const fallbackProjects = toProjects(mainResults);

	for (const ver of versionIds) {
		if (resultsMap[ver].isFallback || resultsMap[ver].projects.length === 0) {
			resultsMap[ver] = { projects: fallbackProjects, isFallback: true };
		} else {
			resultsMap[ver] = { ...resultsMap[ver], isFallback: false };
		}
	}

	// Transform iterations to our Version schema (newest first for display)
	const versions: Version[] = repoIterations.map((it, idx) => ({
		version: it.version,
		current: idx === repoIterations.length - 1,
		date: it.date ?? '',
		prUrl: it.pr_url,
		heuristicSummary: it.heuristic,
		rationale: it.rationale ? stripMarkdown(it.rationale) : '',
		dataSources: it.data_sources ?? [],
		topProject: {
			name: it.top_project?.name ?? urlToName(it.top_project?.url ?? ''),
			score: it.top_project?.score ?? 0
		},
		diff: it.limitations ? [it.limitations] : []
	})).reverse();

	const currentVersion = versions.find((v) => v.current)?.version ?? versions[0]?.version ?? 'v4';

	// Flatten for page (page expects Record<string, Project[]>)
	const resultsMapFlat: Record<string, Project[]> = {};
	const resultsMeta: Record<string, boolean> = {};
	for (const v of versionIds) {
		resultsMapFlat[v] = resultsMap[v].projects;
		resultsMeta[v] = resultsMap[v].isFallback;
	}

	return {
		versions,
		resultsMap: resultsMapFlat,
		resultsMeta,
		currentVersion,
		totalCount: fallbackProjects.length
	};
};
