/**
 * Parser for Fatima's Matrix room export.
 * Expects messages with emoji prefixes from the room topic:
 * 📥 reading, 🔗 interesting link, ❓ question, 💾 project, 💡 idea, 📔 field notes, 📄 blog post
 * Ignores any message that doesn't start with one of these.
 */
import type { FieldNote, CurrentActivity, ExplorationItem, ParsedFellowContent, ThreadReply } from '../_contract/types.js';

const EMOJI_TO_POST_TYPE: Record<string, { postType: string; contentType: FieldNote['contentType'] }> = {
	'📥': { postType: 'reading', contentType: 'field-note' },
	'📥️': { postType: 'reading', contentType: 'field-note' },
	'🔗': { postType: 'link', contentType: 'field-note' },
	'❓': { postType: 'question', contentType: 'journal' },
	'💾': { postType: 'project', contentType: 'field-note' },
	'💡': { postType: 'idea', contentType: 'field-note' },
	'📔': { postType: 'field_note', contentType: 'field-note' },
	'📄': { postType: 'blog_post', contentType: 'blog-post' }
};

const URL_REGEX = /https?:\/\/[^\s\]"<>]+/g;

interface MatrixMessage {
	type: string;
	content?: {
		body?: string;
		msgtype?: string;
		format?: string;
		'formatted_body'?: string;
		'm.relates_to'?: { rel_type?: string; event_id?: string; 'm.in_reply_to'?: { event_id?: string } };
	};
	event_id?: string;
	origin_server_ts?: number;
}

interface MatrixExport {
	room_name?: string;
	messages?: MatrixMessage[];
}

function isRootMessage(msg: MatrixMessage): boolean {
	const relatesTo = msg.content?.['m.relates_to'];
	if (!relatesTo) return true;
	if (relatesTo.rel_type === 'm.thread' || relatesTo['m.in_reply_to']) return false;
	if (relatesTo.rel_type === 'm.replace') return false;
	return true;
}

function isThreadReply(msg: MatrixMessage): { parentEventId: string } | null {
	const relatesTo = msg.content?.['m.relates_to'];
	if (!relatesTo || relatesTo.rel_type !== 'm.thread') return null;
	const parentId = relatesTo['m.in_reply_to']?.event_id ?? relatesTo.event_id;
	return parentId ? { parentEventId: parentId } : null;
}

function inferPostTypeFromBody(
	body: string
): { emoji: string; postType: string; contentType: FieldNote['contentType'] } | null {
	const trimmed = body.trimStart();
	for (const [emoji, mapping] of Object.entries(EMOJI_TO_POST_TYPE)) {
		if (trimmed.startsWith(emoji)) return { emoji, ...mapping };
	}
	return null;
}

function extractLinks(body: string): string[] {
	const matches = body.match(URL_REGEX) ?? [];
	return [...new Set(matches)];
}

function extractTitleAndContent(body: string, emoji: string): { title: string; content?: string } {
	const trimmed = body.trim();
	const withoutEmoji = trimmed.replace(new RegExp(`^${emoji}\\s*`), '').trim();
	const lines = withoutEmoji.split('\n').filter((l) => l.trim());
	if (lines.length === 0) return { title: 'Untitled', content: undefined };
	const firstLine = lines[0];
	const title = firstLine.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
	const rest = lines.slice(1).join('\n').trim();
	return { title: title || 'Untitled', content: rest || undefined };
}

function formatDate(ts: number): string {
	const d = new Date(ts);
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function parse(raw: unknown): ParsedFellowContent {
	const json = raw as MatrixExport;
	const messages = json?.messages ?? [];
	const fieldNotes: FieldNote[] = [];
	const currentActivities = new Map<string, CurrentActivity>();
	const explorationItems: ExplorationItem[] = [];

	// First pass: collect thread replies (messages that reply to another)
	const threadRepliesByParent = new Map<string, ThreadReply[]>();
	for (const msg of messages) {
		if (msg.type !== 'm.room.message') continue;
		const replyInfo = isThreadReply(msg);
		if (!replyInfo) continue;

		const body = msg.content?.body?.trim();
		if (!body) continue;

		const reply: ThreadReply = {
			body,
			formattedBody: msg.content?.['formatted_body'],
			ts: msg.origin_server_ts
		};
		const existing = threadRepliesByParent.get(replyInfo.parentEventId) ?? [];
		existing.push(reply);
		threadRepliesByParent.set(replyInfo.parentEventId, existing);
	}
	// Sort replies by timestamp within each thread
	threadRepliesByParent.forEach((replies) => {
		replies.sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
	});

	for (const msg of messages) {
		if (msg.type !== 'm.room.message') continue;
		if (!isRootMessage(msg)) continue;

		const body = msg.content?.body?.trim();
		if (!body) continue;

		const inferred = inferPostTypeFromBody(body);
		if (!inferred) continue;

		const { emoji, postType, contentType } = inferred;
		const { title, content } = extractTitleAndContent(body, emoji);
		const links = extractLinks(body);
		const date = msg.origin_server_ts ? formatDate(msg.origin_server_ts) : 'Unknown';
		const id = msg.event_id ?? `msg-${fieldNotes.length + explorationItems.length}`;

		// Publications: 📥 reading, 📔 field notes, 📄 blog post (idea goes to Exploration)
		if (['reading', 'field_note', 'blog_post'].includes(postType)) {
			const note: FieldNote = {
				id,
				date,
				title,
				content,
				contentType,
				postType: postType as FieldNote['postType'],
				emoji,
				summary: content ? (content.length > 120 ? content.slice(0, 120) + '…' : content) : title,
				links: links.length > 0 ? links : undefined,
				metadata: [contentType.replace('-', ' ')],
				rawBody: body,
				formattedBody: msg.content?.['formatted_body']
			};
			fieldNotes.push(note);
		}

		// Reading list: 🔗 link, 💾 project
		if (['link', 'project'].includes(postType)) {
			const activity: CurrentActivity = {
				type: postType as CurrentActivity['type'],
				emoji,
				postType,
				title: title !== 'Untitled' ? title : undefined,
				url: links[0],
				description: content ? (content.length > 100 ? content.slice(0, 100) + '…' : content) : undefined,
				date
			};
			const key = activity.url ?? activity.title ?? id;
			if (!currentActivities.has(key)) {
				currentActivities.set(key, activity);
			}
		}

		// Exploration: ❓ question, 💡 idea (with thread transcripts)
		if (postType === 'question' || postType === 'idea') {
			const threadReplies = threadRepliesByParent.get(id) ?? [];
			explorationItems.push({
				id,
				date,
				title,
				content,
				emoji,
				kind: postType as 'question' | 'idea',
				rawBody: body,
				formattedBody: msg.content?.['formatted_body'],
				threadReplies: threadReplies.length > 0 ? threadReplies : undefined
			});
		}
	}

	fieldNotes.reverse();
	explorationItems.reverse();

	const currentlyExploring = Array.from(currentActivities.values())
		.reverse()
		.slice(0, 20);

	return { fieldNotes, currentlyExploring, explorationItems };
}
