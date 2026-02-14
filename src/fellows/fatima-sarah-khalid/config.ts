/**
 * Config for Fatima's fellow page.
 * Data source path and profile overrides.
 */
import type { FellowProfile } from '$lib/data/fellow-types.js';

/** Matrix export filename (without .json) - file lives in matrix-export/ folder */
export const matrixExportFile = 'export';

/** Profile overrides: bio, social links, interests, etc. */
export const profileOverrides: Partial<Omit<FellowProfile, 'slug' | 'fieldNotes' | 'currentlyExploring'>> = {
	name: 'Fatima Sarah Khalid',
	bio: 'Researcher and writer exploring AI governance, civic technology, and the political dimensions of emerging technology. Currently a fellow at Newspeak House, working on participatory approaches to AI policy and algorithmic accountability.',
	socialLinks: {
		linkedin: 'https://www.linkedin.com/in/sugaroverflow/',
		twitter: 'https://x.com/sugaroverflow',
		bluesky: 'https://bsky.app/profile/sugaroverflow.com',
		github: 'https://github.com/sugaroverflow',
		mastodon: 'https://hachyderm.io/@sugaroverflow'
	},
	summary: {
		interests: [
			'AI governance & policy',
			'Civic technology',
			'Participatory democracy',
			'Algorithmic accountability',
			'Open source AI'
		],
		working_on: [
			'Mapping AI governance stakeholders and power structures',
			'Building tools for participatory AI policy-making',
			'Research on algorithmic transparency in public services',
			'Community-led approaches to responsible AI'
		]
	},
	upcomingEvents: [
		{ title: 'Office hours on Refract →', status: 'Thursdays 2-4pm GMT', url: 'https://refract.chat' },
		{ title: 'AI Governance Workshop', status: 'Feb 15, 2025', url: 'https://lu.ma/ai-governance-workshop' }
	],
	socialPosts: [
		{
			id: 'post-1',
			date: '2 hours ago',
			content:
				'Just published a new field note on participatory AI governance. Thinking about how we can move beyond expert-driven policy-making to center affected communities.',
			platform: 'bluesky',
			url: 'https://bsky.app/profile/sugaroverflow.com'
		}
	]
};
