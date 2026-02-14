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
    config.ts             # Data source path, profile overrides
  registry.ts             # Maps slug → parser + config
```

- **Contract** (`_contract/types.ts`): `FieldNote`, `CurrentActivity`, `ParsedFellowContent`. Your parser must return this shape.
- **Parser**: Takes your raw data (JSON, whatever) and returns `{ fieldNotes, currentlyExploring }`.
- **Config**: Where your data lives (e.g. `matrix-export/export.json`) and profile overrides (bio, links, etc.).
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

/** Matrix export filename (no .json) – file in matrix-export/ folder */
export const matrixExportFile = 'export';

/** Profile overrides */
export const profileOverrides: Partial<Omit<FellowProfile, 'slug' | 'fieldNotes' | 'currentlyExploring'>> = {
  bio: '...',
  socialLinks: { twitter: '...', ... },
  summary: { interests: [...], working_on: [...] },
  // etc.
};
```

If your data lives elsewhere (e.g. API, different file), you can extend the config. The registry and loader may need minor changes to support alternate sources.

### 4. Register yourself

```typescript
// src/fellows/registry.ts
import { parse as parseYou } from './your-slug/parser.js';
import * as configYou from './your-slug/config.js';

const registry: Record<string, FellowEntry> = {
  // ...
  'your-slug': {
    parse: parseYou,
    matrixExportFile: configYou.matrixExportFile,
    profileOverrides: configYou.profileOverrides
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
3. If found: loads your data file (from config), runs your `parse()`, merges with cohort + overrides.
4. If not found: uses cohort metadata only (no field notes / reading list).
5. Shared components render the result.

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

**Current**: Matrix export JSON in `matrix-export/[filename].json`.

**Future options** (not yet supported):

- Luma API for events
- Bluesky / Mastodon / RSS for social feed
- Custom API or scraper

You can add support for new sources in your parser or config. The contract stays the same.

---

*Last updated: Feb 2026*
