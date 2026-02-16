export interface Version {
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

export interface Project {
	rank: number;
	score: number;
	name: string;
	url: string;
	summary: string;
	assessment: string;
}
