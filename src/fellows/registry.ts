/**
 * Registry of fellow parsers.
 * Add your slug here when you add a parser under fellows/[your-slug]/.
 */
import { parse as parseFatima } from './fatima/parser.js';
import { contentUrl as fatimaContentUrl, profileOverrides as fatimaOverrides } from './fatima/config.js';
import type { FellowParser } from './_contract/types.js';

export interface FellowEntry {
	parse: FellowParser;
	/** Remote URL to fetch content.json from */
	contentUrl: string;
	/** Profile overrides (bio, social links, etc.) */
	profileOverrides?: Record<string, unknown>;
}

const registry: Record<string, FellowEntry> = {
	fatima: {
		parse: parseFatima,
		contentUrl: fatimaContentUrl,
		profileOverrides: fatimaOverrides
	}
	// Add more fellows here when they add their parsers.
};

export function getFellowEntry(slug: string): FellowEntry | null {
	return registry[slug] ?? null;
}
