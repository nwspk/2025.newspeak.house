/**
 * Registry of fellow parsers.
 * Add your slug here when you add a parser under fellows/[your-slug]/.
 */
import { parse as parseFatima } from './fatima-sarah-khalid/parser.js';
import { dataFile as fatimaDataFile, profileOverrides as fatimaOverrides } from './fatima-sarah-khalid/config.js';
import type { FellowParser } from './_contract/types.js';

export interface FellowEntry {
	parse: FellowParser;
	/** Path to the data file relative to project root */
	dataFile?: string;
	/** Profile overrides (bio, social links, etc.) */
	profileOverrides?: Record<string, unknown>;
}

const registry: Record<string, FellowEntry> = {
	'fatima-sarah-khalid': {
		parse: parseFatima,
		dataFile: fatimaDataFile,
		profileOverrides: fatimaOverrides
	}
	// Add more fellows here when they add their parsers.
};

export function getFellowEntry(slug: string): FellowEntry | null {
	return registry[slug] ?? null;
}
