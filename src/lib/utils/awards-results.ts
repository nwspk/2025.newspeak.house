/**
 * Shared utilities for parsing politech-awards results.json files.
 * Used in both the server load (+page.ts) and client-side lazy loading (+page.svelte).
 */
import type { Project } from '$lib/types/awards';

export const AWARDS_REPO_RAW =
	'https://raw.githubusercontent.com/nwspk/politech-awards-2026/main';

export interface RawResult {
	url: string;
	score: number;
	name?: string;
	summary?: string;
	assessment?: string;
	assessment_synthetic?: boolean;
}

export function urlToName(urlStr: string): string {
	try {
		const u = new URL(urlStr);
		let name = u.hostname.replace(/^www\./, '');
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

export function parseRawResults(raw: unknown): RawResult[] {
	if (Array.isArray(raw)) {
		return raw.map((x) => ({
			url: (x as { url?: string }).url ?? (x as { link?: string }).link ?? '',
			score: (x as { score?: number }).score ?? 0,
			name: (x as { name?: string }).name,
			summary: (x as { summary?: string }).summary,
			assessment: (x as { assessment?: string }).assessment,
			assessment_synthetic: (x as { assessment_synthetic?: boolean }).assessment_synthetic
		}));
	}
	if (raw && typeof raw === 'object' && 'projects' in raw) {
		return parseRawResults((raw as { projects: unknown }).projects);
	}
	return [];
}

/** Sort and rank results, stripping assessment text (kept lean for the server payload). */
export function toProjects(results: RawResult[]): Project[] {
	const sorted = [...results].sort((a, b) => {
		const scoreA = a.score ?? 0;
		const scoreB = b.score ?? 0;
		if (scoreB !== scoreA) return scoreB - scoreA;
		return (a.url ?? '').localeCompare(b.url ?? '');
	});
	return sorted.map((r, i) => ({
		rank: i + 1,
		score: r.score,
		name: r.name ?? urlToName(r.url),
		url: r.url,
		summary: r.summary ?? '',
		assessment: '', // omitted — lazy-loaded client-side
		assessment_synthetic: false
	}));
}
