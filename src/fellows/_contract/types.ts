/**
 * Shared contract for fellow content parsers.
 * Each fellow's parser must return data that matches these types.
 * Components consume this shape; fellows control how their raw data maps to it.
 */

export type FieldNoteContentType = 'field-note' | 'blog-post' | 'journal';
export type PostType = 'reading' | 'link' | 'question' | 'project' | 'idea' | 'field_note' | 'blog_post';

export interface FieldNote {
	id: string;
	date: string;
	title: string;
	content?: string;
	contentType: FieldNoteContentType;
	postType?: PostType;
	emoji?: string;
	summary?: string;
	links?: string[];
	metadata?: string[];
	/** Raw body for detail view (e.g. original Matrix message) */
	rawBody?: string;
	/** HTML/formatted body if available */
	formattedBody?: string;
}

export interface CurrentActivity {
	type: 'link' | 'reading' | 'project' | 'question';
	icon?: string;
	emoji?: string;
	title?: string;
	url?: string;
	description?: string;
	date?: string;
	postType?: string;
}

export interface ThreadReply {
	body: string;
	formattedBody?: string;
	/** Timestamp for ordering (optional) */
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

/** @deprecated Use ExplorationItem */
export type OpenQuestion = ExplorationItem;

/**
 * What a fellow's parser must return.
 * Your parser takes your raw data (JSON, etc.) and returns this shape.
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
