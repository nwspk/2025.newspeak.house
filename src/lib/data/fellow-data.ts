/**
 * Loads fellow profile data.
 * Uses the fellows registry: each fellow with a parser gets their data loaded
 * and merged with cohort metadata. Fellows without a parser get cohort metadata only.
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

async function loadParsedContent(dataFile: string, parse: (raw: unknown) => ParsedFellowContent): Promise<ParsedFellowContent> {
	try {
		const path = join(process.cwd(), dataFile);
		const raw = JSON.parse(await readFile(path, 'utf-8'));
		return parse(raw);
	} catch (e) {
		console.error(`Failed to load fellow data from ${dataFile}:`, e);
		return emptyContent;
	}
}

export async function getFellowBySlug(slug: string): Promise<FellowProfile | null> {
	const cohortMember = getCohortMemberByProfileSlug(slug);
	const entry = getFellowEntry(slug);

	if (!cohortMember && !entry) return null;

	const parsed = entry?.dataFile
		? await loadParsedContent(entry.dataFile, entry.parse)
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
