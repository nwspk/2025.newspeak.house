import csv from 'csvtojson';
import books from '$lib/data/books.csv?raw';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const booksJSON = await csv().fromString(books);
	return json(
		booksJSON.map((item) => ({
			title: item.Title,
			description: item.Description,
			authors: item.Authors,
			genre: item.Genre,
			publicationDate: item.GB_PUBLISHED_DATE
		}))
	);
};
