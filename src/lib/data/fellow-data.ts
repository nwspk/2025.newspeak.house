/**
 * Loads fellow profile data.
 * Uses the fellows registry: each fellow with a parser gets their data loaded
 * and merged with cohort metadata. Fellows without a parser get cohort metadata only.
 *
 * Data is fetched from remote GitHub URLs at build time.
 */
import { getCohortMemberByProfileSlug } from './cohort.js';
import { getFellowEntry } from '../../fellows/registry.js';
import type { FellowProfile } from './fellow-types.js';
import type { ParsedFellowContent } from '../../fellows/_contract/types.js';

const emptyContent: ParsedFellowContent = {
	fieldNotes: [],
	currentlyExploring: [],
	explorationItems: []
};

async function loadParsedContent(
	parse: (raw: unknown) => ParsedFellowContent,
	contentUrl: string
): Promise<ParsedFellowContent> {
	try {
		const res = await fetch(contentUrl);
		if (!res.ok) {
			console.warn(`[field-notes] Failed to fetch ${contentUrl}: ${res.status} ${res.statusText}`);
			return emptyContent;
		}
		const raw = await res.json();
		return parse(raw);
	} catch (e) {
		console.warn(`[field-notes] Error loading content from ${contentUrl}:`, e);
		return emptyContent;
	}
}

export async function getFellowBySlug(slug: string): Promise<FellowProfile | null> {
	const cohortMember = getCohortMemberByProfileSlug(slug);
	const entry = getFellowEntry(slug);

	if (!cohortMember && !entry) return null;

	const parsed = entry
		? await loadParsedContent(entry.parse, entry.contentUrl)
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
