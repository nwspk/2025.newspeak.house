/**
 * Loads fellow profile data.
 * Uses the fellows registry: each fellow with a parser gets their data loaded and merged with cohort metadata.
 * Fellows without a parser get cohort metadata only (no field notes / reading list).
 */
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getCohortMemberByProfileSlug } from './cohort.js';
import { getFellowEntry } from '../../fellows/registry.js';
import type { FellowProfile } from './fellow-types.js';

export async function getFellowBySlug(slug: string): Promise<FellowProfile | null> {
	const cohortMember = getCohortMemberByProfileSlug(slug);
	const entry = getFellowEntry(slug);

	// Need at least cohort membership or a fellow entry
	if (!cohortMember && !entry) return null;

	let fieldNotes: FellowProfile['fieldNotes'] = [];
	let currentlyExploring: FellowProfile['currentlyExploring'] = [];
	let explorationItems: FellowProfile['explorationItems'] = [];

	// Load and parse content if this fellow has a parser
	if (entry && entry.matrixExportFile && typeof process !== 'undefined' && process.cwd) {
		try {
			const path = join(process.cwd(), 'matrix-export', `${entry.matrixExportFile}.json`);
			const raw = await readFile(path, 'utf-8');
			const data = JSON.parse(raw);
			const parsed = entry.parse(data);
			fieldNotes = parsed.fieldNotes;
			currentlyExploring = parsed.currentlyExploring;
			explorationItems = parsed.explorationItems ?? [];
		} catch (e) {
			console.error(`Failed to load fellow content for ${slug}:`, e);
		}
	}

	const overrides = entry?.profileOverrides as Partial<Omit<FellowProfile, 'slug' | 'fieldNotes' | 'currentlyExploring'>> | undefined;
	const name = overrides?.name ?? cohortMember?.name ?? slug;
	const description = cohortMember?.description ?? '';

	return {
		slug,
		name,
		avatar: overrides?.avatar ?? cohortMember?.photo ?? '',
		bio: overrides?.bio ?? description,
		socialLinks: overrides?.socialLinks ?? {},
		summary: overrides?.summary ?? { interests: [], working_on: [] },
		upcomingEvents: overrides?.upcomingEvents,
		fieldNotes,
		currentlyExploring,
		explorationItems,
		socialPosts: overrides?.socialPosts
	};
}
