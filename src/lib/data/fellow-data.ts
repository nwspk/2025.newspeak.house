/**
 * Loads fellow profile data.
 * Uses the fellows registry: each fellow with a parser gets their data loaded
 * and merged with cohort metadata. Fellows without a parser get cohort metadata only.
 *
 * Data is fetched from remote GitHub URLs at build time. Falls back to local
 * files when a contentUrl is not configured.
 */
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getCohortMemberByProfileSlug } from './cohort.js';
import { getFellowEntry } from '../../fellows/registry.js';
import type { FellowProfile } from './fellow-types.js';
import type { ParsedFellowContent } from '../../fellows/_contract/types.js';

const emptyContent: ParsedFellowContent = {
	fieldNotes: [],
	currentlyExploring: [],
	explorationItems: []
};

/**
 * Fetch content.json from a remote URL (raw GitHub).
 * Returns parsed JSON or null on failure.
 */
async function fetchRemoteContent(url: string): Promise<unknown | null> {
	try {
		const res = await fetch(url);
		if (!res.ok) {
			console.warn(`[field-notes] Failed to fetch ${url}: ${res.status} ${res.statusText}`);
			return null;
		}
		return await res.json();
	} catch (e) {
		console.warn(`[field-notes] Network error fetching ${url}:`, e);
		return null;
	}
}

/**
 * Read content.json from a local file (fallback for development or
 * fellows without a remote URL yet).
 */
async function readLocalContent(dataFile: string): Promise<unknown | null> {
	try {
		const path = join(process.cwd(), dataFile);
		return JSON.parse(await readFile(path, 'utf-8'));
	} catch (e) {
		console.warn(`[field-notes] Failed to read local file ${dataFile}:`, e);
		return null;
	}
}

async function loadParsedContent(
	parse: (raw: unknown) => ParsedFellowContent,
	contentUrl?: string,
	dataFile?: string
): Promise<ParsedFellowContent> {
	// Prefer remote URL; fall back to local file
	const raw = contentUrl
		? await fetchRemoteContent(contentUrl)
		: dataFile
			? await readLocalContent(dataFile)
			: null;

	if (!raw) return emptyContent;

	try {
		return parse(raw);
	} catch (e) {
		console.error(`[field-notes] Parser error:`, e);
		return emptyContent;
	}
}

export async function getFellowBySlug(slug: string): Promise<FellowProfile | null> {
	const cohortMember = getCohortMemberByProfileSlug(slug);
	const entry = getFellowEntry(slug);

	if (!cohortMember && !entry) return null;

	const parsed = entry
		? await loadParsedContent(entry.parse, entry.contentUrl, entry.dataFile)
		: emptyContent;

	const overrides = (entry?.profileOverrides ?? {}) as Partial<FellowProfile>;

	return {
		slug,
		name: overrides.name ?? cohortMember?.name ?? slug,
		avatar: overrides.avatar ?? cohortMember?.photo ?? '',
		bio: overrides.bio ?? cohortMember?.description ?? '',
		socialLinks: overrides.socialLinks ?? {},
		summary: overrides.summary ?? { interests: [], working_on: [] },
		upcomingEvents: overrides.upcomingEvents,
		socialPosts: overrides.socialPosts,
		...parsed
	};
}
