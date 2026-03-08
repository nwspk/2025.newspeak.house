export interface Version {
	version: string;
	title: string;
	author: string | null;
	current: boolean;
	date: string;
	prUrl: string;
	heuristicSummary: string;
	rationale: string;
	dataSources: string[];
	topProject: { name: string; score: number };
	diff: string[];
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
}
