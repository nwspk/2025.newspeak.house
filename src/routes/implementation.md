```md
# Political Technology Awards — Website Implementation Plan
Path: `/awards` on https://2025.newspeak.house

**Note:** This spec lives in `docs/` (not `src/routes/`) to avoid routing conflicts with SvelteKit.

This page must condense the entire Awards project into a single, text-forward page consistent with the rest of 2025.newspeak.house (minimal, markdown-style, bracket navigation, no heavy UI).

**Route takeover:** The new `src/routes/awards/+page.svelte` will replace the existing `/awards` route currently served via `[slug]` from `src/lib/static-pages/awards.md`. The old `awards.md` can be retired or repurposed.

It should:
- Announce the showcase (March 31, 2026)
- Link to the public evaluation repository
- Make the algorithm versions inspectable
- Display results for the current version
- Allow visitors to browse previous versions
- Keep the politics of iteration legible

This is not a full project brief. It is a public-facing, inspectable artifact.

---

## 1. Design Principles

1. Single page only: `/awards`
2. Text-first, consistent with existing site
3. Minimal UI, no dashboards
4. Version-driven (the algorithm evolves; the page must reflect that)
5. Public inspectability > visual polish

---

## 2. Page Structure

Top-to-bottom layout:

```

# The Political Technology Awards

STATUS LINE
Showcase section
What we publish
Versions (algorithm timeline)
Results
Contribute / Contest
Committee

```

---

## 3. Hero / Status Block

```

# The Political Technology Awards

Awards show + open evaluation repo by the 2025–26 fellowship cohort.

STATUS: ACTIVE | LONG LIST: 321 | CURRENT VERSION: v4 | SHOWCASE: 31 MAR 2026

【→ RSVP (Showcase)】
【→ Evaluation Repo】
【→ Jump to Results】
【→ Jump to Versions】

```

Links:
- Luma showcase event (add URL/placeholder when available)
- GitHub repository (`nwspk/politech-awards-2026`)

**Bracket styling:** `【】` denote link/button affordances consistent with site; implement as styled anchors or buttons.

---

## 4. Showcase Section

Short and clear.

Include:
- Date + location (Newspeak Hall)
- 3 bullet summary:
  - Winning projects
  - One-hour walkthrough of algorithm
  - Public Q&A on tradeoffs and legitimacy

No duplication of internal exercise instructions.

---

## 5. What We Publish

Concise 3-item section:

- Public repository with algorithm
- Score (0–100%) + written assessment for each project
- Public explanation of process and iteration history

Keep to 5–8 lines maximum.

---

## 6. Versions (Algorithm Timeline)

This is the core of the page.

### Purpose
Allow users to:
- See how the algorithm changed
- See why it changed
- Inspect the PR that introduced change
- Compare versions

### UX Model

Minimal version selector:

```

## /// VERSIONS

【 v1 】 【 v2 】 【 v3 】 【 v4 】  【 ← Prev 】 【 Next → 】

Selected: v4 (proposed 14 Feb 2026)

```

Below the selector, render ONE selected version panel.

**Shareable links:** Support `?version=v3` (or `#v3`) so `/awards?version=v3` opens that version directly. Read on load and sync selected version when user changes it.

### Version Panel Contents

```

### v4 • 14 Feb 2026 • 【PR #18】

Heuristic:
Short summary of what this version optimises for.

Rationale:
2–5 paragraph explanation.

Data Sources:

* Open web scrape
* Repo metadata
* Postmortems
* Committee vote signals

Top Result:
Project Name — Score

Changed since v3:

* Added governance weighting
* Adjusted impact weight
* Introduced data completeness metric

```

No scrolling timeline graphic.
No horizontal timeline.
Text-based, consistent with site tone.

---

## 7. Results Section

Anchored section:

```

## /// RESULTS

Showing results for v4

```

### Default View
- Top 25 projects only
- Compact single-line rows

Format:

```

92  |  Project Name  |  One-line assessment…  【Expand】
88  |  Project Name  |  One-line assessment…  【Expand】

```

### Expand Behavior
When expanded:
- Full written assessment appears inline
- Link to project URL

### Full List
Below top 25:

```

【 Show all 321 projects 】

```

Reveals full table.

---

## 8. Data Architecture

Do NOT parse README.
Do NOT scrape GitHub dynamically in-browser.

Instead, extend the awards repo with structured data. Use consistent paths under `/data`:

```
/data
  versions.json
  results/
    v1.json
    v2.json
    v3.json
    v4.json
```

**versions.json order:** Array is reverse chronological (newest first). Include `"current": true` on the active version.

### versions.json

```json
[
  {
    "version": "v4",
    "current": true,
    "date": "2026-02-14",
    "prUrl": "https://github.com/nwspk/politech-awards-2026/pull/18",
    "heuristicSummary": "...",
    "rationale": "...",
    "dataSources": ["repo metadata", "web scrape", "committee vote"],
    "topProject": {
      "name": "Example Project",
      "score": 92
    },
    "diff": [
      "Added governance weighting",
      "Adjusted impact weight"
    ]
  }
]
```

### results/v4.json

Include top-level `version` so the client can confirm which results it is displaying:

```json
{
  "version": "v4",
  "projects": [
  {
    "rank": 1,
    "score": 92,
    "name": "Project Name",
    "url": "https://example.com",
    "summary": "One-line summary.",
    "assessment": "Full written assessment text.",
    "confidence": 0.73,
    "dataCompleteness": 0.81
  }
  ]
}
```

---

## 9. Implementation Approach (SvelteKit)

Create:

```
src/routes/awards/+page.svelte
```

**Data location in this repo:** Store snapshot JSON at `src/lib/data/awards/`:

```
src/lib/data/awards/
  versions.json
  results/
    v1.json
    v2.json
    ...
```

Options for populating data:

* Static fetch from raw GitHub JSON at build time
* Pre-deploy GitHub Action that writes snapshot JSON into this site repo (recommended for deterministic builds)

**GitHub Action sketch:** A workflow in the evaluation repo (`nwspk/politech-awards-2026`) or this repo can:
1. On merge to main (or scheduled run), export `versions.json` and `results/*.json`
2. Commit/push to this repo's `src/lib/data/awards/`, or trigger a deploy that fetches from raw GitHub URLs at build time

Document which mechanism is used so future maintainers know how to update the page.

---

## 10. State Management (Minimal)

Use Svelte 5 runes (this project uses Svelte 5):

```ts
let versions = $state([]);
let selectedVersion = $state('v4');
let results = $state([]);
let showAll = $state(false);
let compareMode = $state(false);  // for Phase 3 diff view toggle
```

Switching version:

* Updates selectedVersion
* Loads corresponding results file
* Updates version panel
* Syncs `?version=` URL param for shareable links

No global store required.

---

## 11. Contribute / Contest Section

Short, at bottom:

```
## /// CONTEST THE RANKING

If you disagree with the evaluation:
- Propose a new heuristic
- Change a weight
- Improve data collection
- Open a pull request

The algorithm evolves through merge decisions.
```

Link to repo.

---

## 12. Committee Section

One short paragraph:

Judged by the 2025–26 fellowship cohort.

Optional:

* Link to cohort page
* Link to individual reflections (after April 5)

Do NOT embed full biographies.

---

## 13. What Not To Do

* No separate pages
* No interactive charts
* No heavy visual timeline
* No full project guidelines
* No duplicated README content
* No long essay blocks above the fold

**Accessibility:** Use semantic HTML (`<nav>`, `<section>`, headings), keyboard navigation for version selector, `aria-expanded` on expand/collapse rows, and manage focus when expanding.

**Mobile:** Version selector `【 v1 】 【 v2 】 【 v3 】 【 v4 】 【 ← Prev 】 【 Next → 】` may overflow; use horizontal scroll or a compact dropdown on small screens.

Keep page scannable.

---

## 14. Milestones

Phase 1

* Static content
* Version selector (hardcoded)
* URL param support (`?version=v3`)

Phase 2

* JSON-driven versions
* JSON-driven results
* Expand/collapse logic
* Error states (failed fetch, missing version)
* Loading states (when dynamically loading results)

Phase 3

* Diff view toggle (`compareMode`)
* Data completeness display
* "Show all" performance: consider virtualization or pagination if full list is large

---

## 15. Definition of Done

The `/awards` page:

* Links to showcase event (Luma; include URL/placeholder for implementation)
* Links to evaluation repo (`nwspk/politech-awards-2026`)
* Displays current version
* Allows browsing past versions (shareable via `?version=`)
* Shows scores + assessments
* Makes iteration legible
* Matches the minimal aesthetic of 2025.newspeak.house
* SEO: `<title>` and meta description for `/awards`; optional Open Graph for social sharing

```
```
