export interface WeblogEntryMetadata {
	slug: string;
	title: string;
	standfirst: string;
	authorName: string;
	authorSlug: string;
	publicationDate: string;
}

const weblogs: Record<string, any> = Object.values(
	import.meta.glob('../static-pages/weblog-entries/*.md', {
		eager: true
	})
);

export const weblogsMetadata: WeblogEntryMetadata[] = weblogs
	.map((section: { metadata: WeblogEntryMetadata }) => section.metadata)
	.sort(
		(a: { publicationDate: string }, b: { publicationDate: string }) =>
			new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
	);
