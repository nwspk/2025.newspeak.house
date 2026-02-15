# Newspeak House 25/26

Website for the 2025/26 cohort of the Newspeak House fellowship programme.

## Developing Locally

1. Clone this repository
2. `npm install`
3. `npm run dev`
4. Go to http://localhost:5173/

## Deployment

Deployment is handled through Github Actions and it is hosted using Github pages. All you should need to do to deploy changes is push to `main`.

# Adding content

Where possible the site is configured so that content - be they static pages, cohort profiles, or weblog entries - can be added with Markdown files. This [Markdown Guide cheat sheet](https://www.markdownguide.org/cheat-sheet/) is a great introduction for anyone unfamiliar.

## Adding a fellow landing page (with your own data)

Cohort members can have full landing pages at `/fellow/[slug]` with field notes, reading lists, etc. If you'd like to automatically publish posts from your Matrix channel to your page, see the [Matrix Publisher Bot](https://github.com/nwspk/matrix-publisher-bot) and the [setup guide](docs/fellows.md).

## Adding a profile page (markdown)

To add a profile page about yourself, create a new file `src/lib/cohort-profiles/[your-name].md` and do whatever you want with it.

Then add a a page slug to `src/routes/+page.svelte`

Then visit /cohort/[your-name]

See https://github.com/nwspk/2025.newspeak.house/pull/10 for an example.

## Adding a weblog entry

To add a weblog entry, create a new markdown file in `src/lib/static-pages/weblog-entries/[your-weblog-slug].md`, including the same metadata as in other posts.

Commit the post to the main branch and it should appear within a couple of minutes.