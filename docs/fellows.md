# Fellow pages

Each fellow can have a page at `/fellow/[slug]` powered by their own `content.json`. The [Matrix Publisher Bot](https://github.com/nwspk/matrix-publisher-bot) exports emoji-tagged posts from your Matrix channel and commits the JSON to your repo. The site fetches it at build time.

## Quick start

1. Click **"Use this template"** on [nwspk/matrix-publisher-bot](https://github.com/nwspk/matrix-publisher-bot)
2. Add your Matrix credentials as repo secrets (see the template README)
3. Run the export -- your `content.json` lands at:
   `https://raw.githubusercontent.com/nwspk/yourname-field-notes/main/content.json`
4. Add your parser, config, and registry entry to the site (see below)

Set `SITE_REPO` and `SITE_DEPLOY_TOKEN` in your bot repo to auto-rebuild the site after each export.

## Adding your page to the site

Create `src/fellows/your-slug/parser.ts`:

```typescript
import type { ParsedFellowContent } from '../_contract/types.js';

export function parse(raw: unknown): ParsedFellowContent {
  const fieldNotes = [/* ... */];
  const currentlyExploring = [/* ... */];
  const explorationItems = [/* ... */];
  return { fieldNotes, currentlyExploring, explorationItems };
}
```

Create `src/fellows/your-slug/config.ts`:

```typescript
import type { FellowProfile } from '$lib/data/fellow-types.js';

export const contentUrl =
  'https://raw.githubusercontent.com/nwspk/your-slug-field-notes/main/content.json';

export const profileOverrides: Partial<Omit<FellowProfile, 'slug' | 'fieldNotes' | 'currentlyExploring'>> = {
  bio: '...',
  socialLinks: { twitter: '...' },
  summary: { interests: ['...'], working_on: ['...'] },
};
```

Register in `src/fellows/registry.ts`:

```typescript
import { parse as parseYou } from './your-slug/parser.js';
import { contentUrl as yourUrl, profileOverrides as yourOverrides } from './your-slug/config.js';

// add to the registry object:
'your-slug': { parse: parseYou, contentUrl: yourUrl, profileOverrides: yourOverrides }
```

Add your slug to `svelte.config.js` for prerendering.

## Reference

See `src/fellows/_contract/types.ts` for the shapes your parser must return. See `src/fellows/fatima/parser.ts` for a working example.
