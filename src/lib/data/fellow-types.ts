/**
 * Types for fellow profile pages.
 * Parser output contract lives in fellows/_contract/types.ts.
 */
import type { FieldNote, CurrentActivity, ExplorationItem } from '../../fellows/_contract/types.js';

export type {
	FieldNote,
	CurrentActivity,
	ExplorationItem,
	OpenQuestion,
	ThreadReply,
	FieldNoteContentType,
	PostType
} from '../../fellows/_contract/types.js';

export interface SocialPost {
	id: string;
	date: string;
	content: string;
	platform?: 'twitter' | 'bluesky' | 'mastodon' | 'linkedin';
	url?: string;
}

export interface UpcomingEvent {
	title: string;
	status: string;
	url?: string;
}

export interface FellowProfile {
	slug: string;
	name: string;
	avatar: string;
	bio: string;
	socialLinks: {
		linkedin?: string;
		twitter?: string;
		bluesky?: string;
		github?: string;
		mastodon?: string;
		website?: string;
	};
	summary: {
		interests: string[];
		working_on: string[];
	};
	upcomingEvents?: UpcomingEvent[];
	fieldNotes: FieldNote[];
	currentlyExploring: CurrentActivity[];
	explorationItems: ExplorationItem[];
	socialPosts?: SocialPost[];
}
