# Newspeak House 25/26

Website for the 2025/26 cohort of the Newspeak House fellowship programme.

## Developing Locally

1. Clone this repository
2. `npm install`
3. `npm run dev`
4. Go to http://localhost:5173/

## Deployment

Deployment is handled through Github Actions and it is hosted using Github pages. All you should need to do to deploy changes is push to `main`.

## Adding a profile page

To add a profile page about yourself, create a new file `src/lib/static-pages/cohort-profiles/[your-name].md` and do whatever you want with it.

Then add a a page slug to `src/routes/+page.svelte`

Then visit /cohort/[your-name]

See https://github.com/nwspk/2025.newspeak.house/pull/10 for an example.
