import csv from 'csvtojson';
import books from '$lib/data/books.csv?raw';

export const load = async () => {
	const booksJSON = await csv().fromString(books);
	return {
		books: booksJSON.map((item) => ({
			title: item.Title,
			description: item.Description,
			authors: item.Authors,
			genre: item.Genre
		}))
	};
};
