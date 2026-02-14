# Implementation backlog

Future enhancements for the cohort landing page. Work on these when ready.

**→ Fellow pages & per-fellow parsers:** See [fellows.md](./fellows.md) for how to add your own parser and data source.

---

## Upcoming events

### Option A: Manual list (current)
Keep `upcomingEvents` in `src/lib/cohort-landing-pages/config.ts`. Update when events change.

### Option B: Luma API (requires Luma Plus)
- **Cost:** Luma Plus ($59/mo)
- **Endpoint:** `GET /v1/calendar/list-events`
- Returns events you’re **hosting** (not attending)
- Create server route, e.g. `src/routes/data/events/[calendarId]/+server.ts`
- Use env var `LUMA_API_KEY`
- Fetch on page load or at build time; cache if needed

### Option C: Other event sources
- **iCal/ICS:** If Luma or another tool exposes a public `.ics` URL, fetch and parse it
- **Google Calendar:** Has a free API; needs OAuth or service account
- **Eventbrite / Meetup:** Check their API pricing and limits

---

## Social feed (Recent posts)

Section is a placeholder at the bottom of the cohort landing page.

### Options to explore
| Source     | API/RSS                                      | Auth / cost           |
|-----------|-----------------------------------------------|-----------------------|
| Bluesky   | AT Protocol (public)                         | Free                  |
| Mastodon  | REST API or RSS feed                         | Free                  |
| Twitter/X | API                                          | Paid                 |
| LinkedIn  | API                                          | Restricted            |
| RSS       | Any blog or site with RSS                    | Free                  |

### Implementation sketch
1. Create `src/routes/data/social/[name]/+server.ts` or a build-time fetch
2. Add config for each cohort member: `socialSources?: { type: 'bluesky' | 'mastodon' | 'rss'; handleOrUrl: string }[]`
3. Aggregate posts, sort by date, limit (e.g. last 10)
4. Render in “Recent posts” section

### Bluesky note
Bluesky’s AT Protocol is public. `app.bsky.feed.getAuthorFeed` returns a user’s posts; no auth for public feeds.

---

## Other ideas
- [ ] Pagination for “Currently exploring” if the list grows large
- [ ] Filter or search within field notes
- [ ] Dark mode or theme toggle
- [ ] Export / share links for individual field notes

---

*Last updated: Feb 2026*
