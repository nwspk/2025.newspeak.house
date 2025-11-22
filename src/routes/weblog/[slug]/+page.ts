import type { Component } from 'svelte';

export const load = async ({ params }) => {
	const post = await import(`../../../lib/static-pages/weblog-entries/${params.slug}.md`);

	if (!post) {
		return {
			status: 404,
			error: new Error('Not Found')
		};
	}

	const postTitle: string = post.metadata.title;
	const postStandfirst: string = post.metadata.standfirst;
	const postAuthorName: string = post.metadata.authorName;
	const postAuthorSlug: string = post.metadata.authorSlug;
	const postContent: Component = post.default;
	const postPublicationDate: string = post.metadata.publicationDate;

	return {
		postTitle,
		postStandfirst,
		postAuthorName,
		postAuthorSlug,
		postPublicationDate,
		postContent
	};
};
