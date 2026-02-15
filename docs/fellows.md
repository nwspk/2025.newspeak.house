# Fellow pages: per-fellow parsers

Cohort members can have individual landing pages at `/fellow/[slug]`. The content (field notes, reading list, etc.) comes from each fellow's own data source. **Parsing is per-fellow**: you write a parser that transforms your raw data into the shared format. Components are shared; you control the mapping.

---

## Architecture

```
src/fellows/
  _contract/
    types.ts              # Shared: FieldNote, CurrentActivity – what parsers must return
  [your-slug]/
    parser.ts             # Your parser: raw data → ParsedFellowContent
    config.ts             # Remote content URL, profile overrides
  registry.ts             # Maps slug → parser + config
```

- **Contract** (`_contract/types.ts`): `FieldNote`, `CurrentActivity`, `ParsedFellowContent`. Your parser must return this shape.
- **Parser**: Takes your raw data (JSON, whatever) and returns `{ fieldNotes, currentlyExploring, explorationItems }`.
- **Config (per-fellow)**: Remote `contentUrl` for your `content.json` and profile overrides (bio, links, etc.).
- **Registry**: Add your entry so the loader knows to use your parser.

---

## Adding your fellow page

### 1. Create your fellow folder

```
src/fellows/your-slug/
  parser.ts
  config.ts
```

### 2. Implement your parser

```typescript
// src/fellows/your-slug/parser.ts
import type { ParsedFellowContent } from '../_contract/types.js';

export function parse(raw: unknown): ParsedFellowContent {
  // Your logic: transform raw (JSON, API response, etc.) into:
  const fieldNotes = [/* ... */];
  const currentlyExploring = [/* ... */];
  return { fieldNotes, currentlyExploring };
}
```

See `src/fellows/_contract/types.ts` for the exact shapes of `FieldNote` and `CurrentActivity`.

### 3. Add config

```typescript
// src/fellows/your-slug/config.ts
import type { FellowProfile } from '$lib/data/fellow-types.js';

/** Remote URL to fetch content.json at build time */
export const contentUrl =
  'https://raw.githubusercontent.com/nwspk/your-slug-field-notes/main/content.json';

/** Profile overrides */
export const profileOverrides: Partial<Omit<FellowProfile, 'slug' | 'fieldNotes' | 'currentlyExploring'>> = {
  bio: '...',
  socialLinks: { twitter: '...', ... },
  summary: { interests: [...], working_on: [...] },
  // etc.
};
```

Your `content.json` is published by the Matrix Publisher Bot in your own GitHub repo. The site fetches it at build time from the raw GitHub URL above.

### 4. Register yourself

```typescript
// src/fellows/registry.ts
import { parse as parseYou } from './your-slug/parser.js';
import { contentUrl as yourContentUrl, profileOverrides as yourOverrides } from './your-slug/config.js';

const registry: Record<string, FellowEntry> = {
  // ...
  'your-slug': {
    parse: parseYou,
    contentUrl: yourContentUrl,
    profileOverrides: yourOverrides
  }
};
```

### 5. Add your slug to prerender

```javascript
// svelte.config.js
const fellowSlugs = [
  // ...
  'your-slug'
];
```

---

## Data flow

1. User visits `/fellow/your-slug`.
2. `getFellowBySlug` checks the registry for `your-slug`.
3. If found: fetches your `content.json` from the remote URL (falls back to local file if no URL), runs your `parse()`, merges with cohort + overrides.
4. If the fetch fails: the fellow page renders with empty content (no field notes / reading list) rather than breaking the build.
5. If not found in registry: uses cohort metadata only.
6. Shared components render the result.

---

## Contract: what your parser must return

```typescript
interface ParsedFellowContent {
  fieldNotes: FieldNote[];
  currentlyExploring: CurrentActivity[];
  explorationItems: ExplorationItem[];
}

interface ExplorationItem {
  id: string;
  date: string;
  title: string;
  content?: string;
  emoji?: string;
  kind: 'question' | 'idea';
  rawBody?: string;
  formattedBody?: string;
  threadReplies?: { body: string; formattedBody?: string }[];
}

interface FieldNote {
  id: string;
  date: string;
  title: string;
  content?: string;
  contentType: 'field-note' | 'blog-post' | 'journal';
  postType?: 'reading' | 'link' | 'question' | 'project' | 'field_note' | 'blog_post';
  emoji?: string;
  summary?: string;
  links?: string[];
  metadata?: string[];
  rawBody?: string;      // For detail panel
  formattedBody?: string;
}

interface CurrentActivity {
  type: 'link' | 'reading' | 'project' | 'question';
  emoji?: string;
  title?: string;
  url?: string;
  description?: string;
  date?: string;
}
```

---

## Example: Fatima's Matrix parser

Fatima uses a Matrix room export with emoji-prefixed messages. Her parser categorizes content as follows:

| Emoji | Section |
|-------|---------|
| 📥 reading, 📔 field notes, 📄 blog post | **Publications** |
| 🔗 interesting link, 💾 project | **Reading list** |
| ❓ question, 💡 idea | **Exploration** (with thread transcripts) |

Her parser lives at `src/fellows/fatima-sarah-khalid/parser.ts` and expects `matrix-export/export.json`. Use it as a reference if your format is similar; otherwise write your own mapping.

---

## Data sources

**Current**: Each fellow's `content.json` is exported by the Matrix Publisher Bot to a GitHub repo (e.g. `nwspk/sugaroverflow-field-notes`) and fetched at build time from the raw GitHub URL.

**Rebuild trigger**: When a fellow configures `SITE_REPO` and `SITE_DEPLOY_TOKEN` in their bot repo, a `repository_dispatch` event (`field-notes-updated`) is sent to the site repo after each export. The `.github/workflows/rebuild-on-field-notes.yml` workflow listens for this and triggers a rebuild.

**Future options** (not yet supported):

- Luma API for events
- Bluesky / Mastodon / RSS for social feed
- Custom API or scraper

You can add support for new sources in your parser or config. The contract stays the same.

---

*Last updated: Feb 2026*
