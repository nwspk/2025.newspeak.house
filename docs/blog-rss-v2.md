# Blog v2: Substack RSS feed with custom design

**Status:** Planned  
**Current:** RSS-powered feed on `/blog` (via rss2json)  
**Target:** Custom server-side RSS feed with full design control and SEO

---

## Background

The blog at `/blog` displays posts from the [Newspeak Fellowship 2025 Substack](https://newspeakfellowship2025.substack.com/) via the rss2json API. This works but has limitations:

- No design control (iframe content is Substack’s)
- Limited SEO (content not in our DOM)
- No filters (author, date, keyword)

## Goal

Replace the embed with a feed built from Substack’s RSS, rendered on our site with our own markup and styles.

## Technical approach

### 1. RSS source

- **URL:** `https://newspeakfellowship2025.substack.com/feed`
- **Format:** RSS 2.0 (XML)
- **Fields:** title, link, description (excerpt), author, pubDate, optional content

### 2. Server route

Create `src/routes/api/substack-feed/+server.ts` (or similar):

- Fetch Substack RSS
- Parse XML → JSON (e.g. `rss-parser` or `fast-xml-parser`)
- Apply caching (15–60 min) to avoid hammering Substack
- Return `{ items: [...] }` for the frontend

### 3. Dependencies

- Add RSS parser: `rss-parser` or `fast-xml-parser`
- No API keys required; RSS is public

### 4. Weblog page

- `/blog` loads from the API route (or via `load` in `+page.ts`)
- Render post cards with our own HTML/CSS
- Optional filters: author, date range, keyword search

### 5. Individual posts

- Links point to Substack (e.g. `https://newspeakfellowship2025.substack.com/p/slug`)
- No local `/blog/[slug]` route; content stays on Substack

### 6. Cleanup

- Replace client-side rss2json with server-side RSS parsing

## Considerations

- **Paywalled posts:** RSS only includes excerpt/description, not full content
- **CORS:** Fetch must run server-side or at build time; browser fetch will fail
- **Rate limits:** Cache aggressively
- **SEO:** Full control over meta tags, headings, schema.org, etc.

## Acceptance criteria

- [ ] Feed displays on `/blog` with our design
- [ ] Posts link to Substack for full content
- [ ] Caching reduces load on Substack
- [ ] Page has proper meta tags and semantic HTML
- [ ] Optional: filter by author (if RSS includes it)
- [ ] Optional: filter by date or keyword

## References

- Substack RSS: `https://[subdomain].substack.com/feed`
- [implementation.md](./implementation.md) – Social feed section mentions RSS
- Previous discussion: embed (v1) → RSS client (current) → RSS server (v2)

---

*Last updated: Feb 2026*
