/**
 * Parser for Fatima's matrix_export.json.
 *
 * Message types: field_note, journal, link, idea, question, project, reply
 * Each message has: id, ts, type, body, parent_id, formatted_body?
 * Replies have a non-null parent_id pointing to the root message.
 */
import type { FieldNote, CurrentActivity, ExplorationItem, ParsedFellowContent, ThreadReply } from '../_contract/types.js';

interface Message {
	id: string;
	ts: number;
	type: string;
	body: string;
	parent_id: string | null;
	formatted_body?: string;
}

const URL_REGEX = /https?:\/\/[^\s\]"<>)+]+/g;

/** Which message types map to which output bucket */
const NOTE_TYPES = new Set(['field_note', 'journal']);
const ACTIVITY_TYPES = new Set(['link', 'project']);
const EXPLORATION_TYPES = new Set(['question', 'idea']);

const CONTENT_TYPE_MAP: Record<string, FieldNote['contentType']> = {
	field_note: 'field-note',
	journal: 'journal'
};

const EMOJI_MAP: Record<string, string> = {
	field_note: '📔', journal: '📥', link: '🔗',
	project: '💾', question: '❓', idea: '💡'
};

function formatDate(ts: number): string {
	return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function extractLinks(body: string): string[] {
	return [...new Set(body.match(URL_REGEX) ?? [])];
}

function extractTitle(body: string): string {
	const first = body.split('\n').find((l) => l.trim());
	if (!first) return 'Untitled';
	// Strip leading emoji, markdown headers, bold markers
	return first.replace(/^[\p{Emoji}\uFE0F]+\s*/u, '').replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim() || 'Untitled';
}

function extractContent(body: string): string | undefined {
	const lines = body.split('\n').filter((l) => l.trim());
	return lines.length > 1 ? lines.slice(1).join('\n').trim() : undefined;
}

function truncate(text: string, max: number): string {
	return text.length > max ? text.slice(0, max) + '…' : text;
}

export function parse(raw: unknown): ParsedFellowContent {
	const messages = (raw as { messages?: Message[] })?.messages ?? [];

	// Collect thread replies by parent_id
	const threadReplies = new Map<string, ThreadReply[]>();
	for (const msg of messages) {
		if (msg.type !== 'reply' || !msg.parent_id) continue;
		const replies = threadReplies.get(msg.parent_id) ?? [];
		replies.push({ body: msg.body, formattedBody: msg.formatted_body, ts: msg.ts });
		threadReplies.set(msg.parent_id, replies);
	}
	threadReplies.forEach((replies) => replies.sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0)));

	// Process root messages
	const fieldNotes: FieldNote[] = [];
	const activities = new Map<string, CurrentActivity>();
	const explorationItems: ExplorationItem[] = [];

	for (const msg of messages) {
		if (msg.parent_id !== null) continue; // skip replies

		const { id, ts, type, body, formatted_body } = msg;
		const title = extractTitle(body);
		const content = extractContent(body);
		const date = formatDate(ts);
		const emoji = EMOJI_MAP[type];

		if (NOTE_TYPES.has(type)) {
			const links = extractLinks(body);
			fieldNotes.push({
				id, date, title, content,
				contentType: CONTENT_TYPE_MAP[type] ?? 'field-note',
				emoji,
				summary: content ? truncate(content, 120) : title,
				links: links.length > 0 ? links : undefined,
				rawBody: body,
				formattedBody: formatted_body
			});
		} else if (ACTIVITY_TYPES.has(type)) {
			const links = extractLinks(body);
			const key = links[0] ?? title ?? id;
			if (!activities.has(key)) {
				activities.set(key, {
					type: type as CurrentActivity['type'],
					emoji,
					title: title !== 'Untitled' ? title : undefined,
					url: links[0],
					description: content ? truncate(content, 100) : undefined,
					date
				});
			}
		} else if (EXPLORATION_TYPES.has(type)) {
			explorationItems.push({
				id, date, title, content, emoji,
				kind: type as 'question' | 'idea',
				rawBody: body,
				formattedBody: formatted_body,
				threadReplies: threadReplies.get(id)
			});
		}
	}

	fieldNotes.reverse();
	explorationItems.reverse();

	return {
		fieldNotes,
		currentlyExploring: [...activities.values()].reverse().slice(0, 20),
		explorationItems
	};
}
