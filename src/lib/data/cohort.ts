/**
 * Shared cohort member data for homepage and landing pages.
 * Profile photo and description are looked up by profileSlug.
 */
import DavidPowellPhoto from '$lib/assets/david-powell.png';
import GamithraMargaPhoto from '$lib/assets/gamithra.jpg';
import GamithraMargaBg from '$lib/assets/gamithra-bg.png';
import FatimaSarahKhalidPhoto from '$lib/assets/fatima-sarah-khalid.png';
import AlessandroPedoriPhoto from '$lib/assets/alessandro-pedori.jpg';
import AlexandraCiocanelPhoto from '$lib/assets/alexandra-ciocanel.jpg';
import ConnorDunlopPhoto from '$lib/assets/connor-dunlop.jpg';
import EmilyMayhewPhoto from '$lib/assets/emily-mayhew.jpg';
import FrancescaGalliPhoto from '$lib/assets/francesca-galli.jpg';
import AsilSidahmedPhoto from '$lib/assets/asil-sidahmed.jpg';
import ChrisOwenPhoto from '$lib/assets/chris-owen.jpg';
import ChrisOwenPhotoSide from '$lib/assets/chris-owen-side.jpg';

export type CohortMember = {
	name: string;
	profileSlug?: string;
	photo?: string;
	description?: string;
	mediaType?: 'video' | 'image';
	mediaUrl?: string;
	mediaAltText?: string;
};

export const cohort: CohortMember[] = [
	{ name: 'Aadi Kulkarni' },
	{
		name: 'Alex Pedori',
		photo: AlessandroPedoriPhoto,
		description:
			'Engineer-life-coach integrating AI, coaching and facilitation to empower human flourishing',
		profileSlug: 'alex-pedori'
	},
	{
		name: 'Alexandra Ciocanel',
		description: 'Researcher',
		profileSlug: 'alexandra-ciocanel',
		photo: AlexandraCiocanelPhoto
	},
	{ name: 'Asil Sidahmed', description: 'Governance strategist', profileSlug: 'asil-sidahmed', photo: AsilSidahmedPhoto },
	{
		name: 'Chris Owen',
		profileSlug: 'chris-owen',
		description: 'Educator & Coder',
		photo: ChrisOwenPhoto,
		mediaType: 'image',
		mediaUrl: ChrisOwenPhotoSide,
		mediaAltText: 'chris wearing sunglasses'
	},
	{
		name: 'Connor Dunlop',
		description: 'Building technical governance solutions to increase verifiability in AI',
		profileSlug: 'connordunlop',
		photo: ConnorDunlopPhoto
	},
	{
		name: 'David Powell',
		description: 'Building technology for humans',
		profileSlug: 'david-powell',
		photo: DavidPowellPhoto
	},
	{ name: 'Davit Jintcharadze' },
	{
		name: 'Emily Mayhew',
		photo: EmilyMayhewPhoto,
		description: 'Making policy at the AI/Creative Industries intersection',
		profileSlug: 'emily-mayhew'
	},
	{
		name: 'Fatima Sarah Khalid',
		profileSlug: 'fatima-sarah-khalid',
		photo: FatimaSarahKhalidPhoto,
		description: '✧ ai engineer & civic hacker'
	},
	{
		name: 'Francesca Galli',
		photo: FrancescaGalliPhoto,
		description:
			'Analyst-writer-artist exploring how technology can further civic engagement',
		profileSlug: 'francesca-galli'
	},
	{ name: "Fred O'Brien", profileSlug: 'frederick-obrien' },
	{
		name: 'Gamithra Marga',
		photo: GamithraMargaPhoto,
		profileSlug: 'gamithra-marga',
		description: '☀︎ raves, machines, and dishwashers',
		mediaType: 'image',
		mediaUrl: GamithraMargaBg,
		mediaAltText: 'gamithra holding a little drink'
	},
	{ name: 'Huda Abdirahim' },
	{ name: 'Jamie Coombes' },
	{ name: 'Martina Orlea', profileSlug: 'martina-orlea' },
	{ name: 'Nick Botti' },
	{ name: 'Tuna Acisu', profileSlug: 'tuna-acisu' }
];

export function getCohortMemberByProfileSlug(profileSlug: string): CohortMember | undefined {
	return cohort.find((m) => m.profileSlug === profileSlug);
}
