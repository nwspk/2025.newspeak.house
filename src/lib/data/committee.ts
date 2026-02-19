/**
 * Awards committee: maps GitHub usernames (from CODEOWNERS) to display info.
 * Photos and profile slugs match the cohort on the home page.
 */
import AsilSidahmedPhoto from '$lib/assets/asil-sidahmed.jpg';
import FatimaSarahKhalidPhoto from '$lib/assets/fatima-sarah-khalid.png';
import FrancescaGalliPhoto from '$lib/assets/francesca-galli.jpg';
import GamithraMargaPhoto from '$lib/assets/gamithra.jpg';

export interface CommitteeMember {
	github: string;
	name: string;
	photo?: string;
	profileSlug?: string;
}

export const committee: CommitteeMember[] = [
	{ github: 'frederickobrien', name: "Fred O'Brien", profileSlug: 'frederick-obrien' },
	{ github: 'asilsidahmed-Newspeak', name: 'Asil Sidahmed', photo: AsilSidahmedPhoto, profileSlug: 'asil-sidahmed' },
	{ github: 'sugaroverflow', name: 'Fatima Sarah Khalid', photo: FatimaSarahKhalidPhoto, profileSlug: 'fatima-sarah-khalid' },
	{ github: 'Gamithra', name: 'Gamithra Marga', photo: GamithraMargaPhoto, profileSlug: 'gamithra-marga' },
	{ github: 'jcoombes', name: 'Jamie Coombes' },
	{ github: 'FrencHorses', name: 'Francesca Galli', photo: FrancescaGalliPhoto, profileSlug: 'francesca-galli' }
];
