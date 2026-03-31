import type { PageLoad } from './$types';
import type { Version } from '$lib/types/awards';
import { AWARDS_REPO_RAW, parseRawResults, toProjects, urlToName } from '$lib/utils/awards-results';

/** Do not bake /awards at build time — always reflect current iterations.json from the evaluation repo. */
export const prerender = false;

const LOGS_BASE = `${AWARDS_REPO_RAW}/docs/logs`;

/** Avoid stale cached JSON from raw.githubusercontent.com or intermediaries. */
const FETCH_OPTS: RequestInit = { cache: 'no-store' };

interface RepoIteration {
	version: string;
	title?: string | null;
	date: string | null;
	author: string | null;
	authors?: string[] | null;
	pr_number: number;
	pr_url: string;
	pr_status: string;
	top_project: { name: string; url: string; score: number | null };
	heuristic: string;
	rationale: string | null;
	data_sources: string[];
	keywords?: string[] | null;
	limitations?: string | null;
	assessment?: string | null;
	vote_result?: string | null;
}

export const load: PageLoad = async ({ fetch }) => {
	const iterationsRes = await fetch(`${AWARDS_REPO_RAW}/iterations.json`, FETCH_OPTS);
	if (!iterationsRes.ok) throw new Error('Failed to fetch iterations');
	const repoIterations: RepoIteration[] = await iterationsRes.json();
	const versionIds = repoIterations.map((it) => it.version);

	// Transform iterations metadata (cheaply — no results.json needed here)
	const versions: Version[] = repoIterations
		.map((it, idx) => ({
			version: it.version,
			title: it.title ?? it.version,
			author: it.author ?? null,
			authors: it.authors ?? null,
			current: idx === repoIterations.length - 1,
			date: it.date ?? '',
			prNumber: it.pr_number,
			prUrl: it.pr_url,
			prStatus: it.pr_status,
			heuristicSummary: it.heuristic,
			rationale: it.rationale ?? '',
			dataSources: it.data_sources ?? [],
			topProject: {
				name: it.top_project?.name ?? urlToName(it.top_project?.url ?? ''),
				score: it.top_project?.score ?? 0
			},
			diff: it.limitations ? [it.limitations] : [],
			assessment: it.assessment ?? undefined,
			voteResult: it.vote_result ?? undefined
		}))
		.reverse();

	const currentVersion =
		versions.find((v) => v.current)?.version ?? versions[0]?.version ?? versionIds[0];

	// Only fetch the current (latest) version's results server-side.
	// All other versions are lazy-loaded client-side on first access.
	const currentRes = await fetch(
		`${AWARDS_REPO_RAW}/iterations/${currentVersion}/results.json`,
		FETCH_OPTS
	);

	const resultsMap: Record<string, import('$lib/types/awards').Project[]> = {};
	// Pre-fill all versions as empty so the client knows which ones need loading
	for (const v of versionIds) {
		resultsMap[v] = [];
	}

	// Derive hasAssessments from iteration metadata:
	// Any version whose assessment text in iterations.json is substantial has per-project assessments.
	const hasAssessments: Record<string, boolean> = {};
	for (const it of repoIterations) {
		hasAssessments[it.version] = (it.assessment?.length ?? 0) > 500;
	}

	if (currentRes.ok) {
		const raw = await currentRes.json();
		const rr = parseRawResults(raw);
		// Override hasAssessments for current version based on actual data
		hasAssessments[currentVersion] = rr.some((r) => r.assessment && !r.assessment_synthetic);
		resultsMap[currentVersion] = toProjects(rr);
	}

	const [processLogRes, dataLogRes] = await Promise.all([
		fetch(`${LOGS_BASE}/process-log.md`, FETCH_OPTS),
		fetch(`${LOGS_BASE}/data-log.md`, FETCH_OPTS)
	]);

	const [processLogMarkdown, dataLogMarkdown] = await Promise.all([
		processLogRes.ok ? processLogRes.text() : Promise.resolve(''),
		dataLogRes.ok ? dataLogRes.text() : Promise.resolve('')
	]);

	return {
		versions,
		resultsMap,
		hasAssessments,
		currentVersion,
		processLogMarkdown,
		dataLogMarkdown
	};
};
