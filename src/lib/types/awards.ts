export interface Version {
	version: string;
	title: string;
	author: string | null;
	current: boolean;
	date: string;
	prNumber: number;
	prUrl: string;
	prStatus: string;
	heuristicSummary: string;
	rationale: string;
	dataSources: string[];
	topProject: { name: string; score: number };
	diff: string[];
	/** Post-results assessment from the iteration PR (markdown). */
	assessment?: string;
	/** Committee vote result when present (e.g. "merged", "rejected"). */
	voteResult?: string;
	/** Full markdown body from iterations/{version}/README.md when available */
	markdownBody?: string;
}

export interface Project {
	rank: number;
	score: number;
	name: string;
	url: string;
	summary: string;
	assessment: string;
	/** True when assessment was synthetically generated (not from real jury/agent data) */
	assessment_synthetic?: boolean;
}
