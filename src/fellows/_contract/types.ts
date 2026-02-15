/**
 * Shared contract for fellow content parsers.
 * Each fellow's parser must return data matching these types.
 * Components consume this shape; fellows control how their raw data maps to it.
 */

export interface FieldNote {
	id: string;
	date: string;
	title: string;
	content?: string;
	contentType: 'field-note' | 'blog-post' | 'journal';
	emoji?: string;
	summary?: string;
	links?: string[];
	/** Auto-extracted keywords and hashtags from the source message */
	keywords?: string[];
	/** Raw body for detail view (e.g. original Matrix message) */
	rawBody?: string;
	/** HTML/formatted body if available */
	formattedBody?: string;
}

export interface CurrentActivity {
	type: 'link' | 'reading' | 'project' | 'question';
	emoji?: string;
	title?: string;
	url?: string;
	description?: string;
	date?: string;
}

export interface ThreadReply {
	body: string;
	formattedBody?: string;
	ts?: number;
}

export interface ExplorationItem {
	id: string;
	date: string;
	title: string;
	content?: string;
	emoji?: string;
	kind: 'question' | 'idea';
	rawBody?: string;
	formattedBody?: string;
	threadReplies?: ThreadReply[];
}

/**
 * What a fellow's parser must return.
 */
export interface ParsedFellowContent {
	fieldNotes: FieldNote[];
	currentlyExploring: CurrentActivity[];
	explorationItems: ExplorationItem[];
}

/**
 * Parser function signature.
 * Receives raw data (format is up to you) and returns the shared contract.
 */
export type FellowParser = (raw: unknown) => ParsedFellowContent;
