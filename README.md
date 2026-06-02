# Top 30 Processes — ANZ Salesforce Pilot

Interactive HTML reference deck of 30 process candidates for the ANZ Apromore × Salesforce pilot.
Each card covers domain, primary systems, headline/supporting metrics, buyer personas, common
failure variants, and what process intelligence reveals once you mine the event log.

**Live:** https://scottt1234.github.io/top-30-processes-v2/

---

## Repo structure

```
top-30-processes-v2/
├── index.html              ← bundled output served by GitHub Pages
├── src/
│   ├── processes.json      ← the 30 process entries (edit this most often)
│   └── ProcessCards.jsx    ← React component: layout, filters, styling
├── archive/
│   └── 2026-05-19-v1.html  ← snapshots of past published versions
└── README.md
```

| File | What it is | How often you edit it |
| --- | --- | --- |
| `src/processes.json` | The 30-entry data array. One object per process. | Frequently — every wording fix, metric tweak, new variant. |
| `src/ProcessCards.jsx` | Rendering, filters, card layout, styling. ~570 lines. | Rarely — only when changing the visual structure. |
| `index.html` | Self-contained bundled deck that GitHub Pages serves. | Whenever you republish (regenerated, not hand-edited). |
| `archive/*.html` | Dated snapshots of previously published bundles. | Append-only. |

---

## Editing workflow

### Light content edits (most edits)

1. Open `src/processes.json` on github.com — click the pencil icon to edit in the browser.
2. Make your change (fix a description, add a metric, adjust a variant).
3. Commit on the web.
4. Republish (see below) to regenerate `index.html`.

You can also edit locally in any editor and push. The web editor works fine on iPad.

### Structural edits

Anything that changes layout, filters, colors, or card sections lives in `src/ProcessCards.jsx`.
Edit there, then republish.

### Republishing (regenerate `index.html`)

The bundled `index.html` is produced by Claude's artifact bundler — there is no local build step.
To rebuild after editing source:

1. Open a Claude conversation.
2. Share both `src/processes.json` and `src/ProcessCards.jsx`.
3. Ask Claude to bundle them into a single self-contained HTML file (it knows how).
4. Save the new bundle as `index.html` and commit it alongside the source change.
5. Optionally snapshot the previous bundle into `archive/YYYY-MM-DD-vN.html` first.

GitHub Pages picks up the new `index.html` automatically (~30s after push).

---

## Why this structure

A few small decisions worth preserving:

- **Data lives in JSON, not inside the JSX.** The 30 entries are the part that changes
  constantly; the component is the part that almost never changes. Splitting them keeps
  content edits as clean diffs (no component churn) and lets you edit on github.com from
  any device without a local toolchain.
- **JSON, not a JS module.** GitHub renders JSON nicely in the web UI, syntax errors are
  easier to spot, and the data is portable to other tools (e.g., dropping it into a sheet
  or a different deck) without a JS runtime. Trade-off: no comments and no trailing commas.
- **`index.html` lives in the repo.** Pages serves it directly with no build pipeline. The
  cost is that you must regenerate-and-commit the bundle when source changes — but at the
  current edit cadence this is cheaper than maintaining a Vite + GitHub Actions setup.
- **Archive is append-only.** `git log` already has the full history, but a folder of dated
  HTML snapshots makes it trivial to send a stakeholder "the version we shared in May" without
  digging through commits.

---

## Common edit recipes

**Change the wording of a process description**
`src/processes.json` → find the process by `id` or `name` → edit `process.description`.

**Add a new metric to a process**
`src/processes.json` → find the process → push into `metrics.headline` or `metrics.supporting`.

**Add a new failure variant**
`src/processes.json` → `process.failureVariants` → add `{ "name": "...", "desc": "..." }`.

**Tweak which fields show on the card**
`src/ProcessCards.jsx` → `Card` component → adjust the JSX for the section you want to change.

**Change a card section's order or styling**
`src/ProcessCards.jsx` → `sectionConfig` array near the top — controls section ordering.

**Add a new filter**
`src/ProcessCards.jsx` → look for `FilterGroup` calls in the main component, plus the
`all*` arrays at the top that compute filter options from the data.

---

## Future upgrades (not needed yet)

If editing pace picks up significantly, the manual Claude rebuild loop becomes a tax. The
upgrade path:

1. Convert to a real Vite project (`npm create vite@latest`).
2. Add `npm run build` that produces a single self-contained HTML.
3. Add a GitHub Action that runs the build on push to `main` and commits the resulting
   `index.html` (or publishes via the Pages action).

Roughly 30 minutes of setup. Worth doing only when the manual loop is genuinely slowing
you down — not before.

---

## Schema notes

Every entry in `processes.json` carries the same top-level keys. Shape:

```jsonc
{
  "id": 1,
  "name": "Process name",
  "domain": "Service Cloud",
  "industries": ["..."],
  "primarySystems": ["..."],
  "headlineMetrics": ["..."],   // short list shown on the card header
  "buyerPersonas": ["..."],
  "sfCloud": "Service Cloud",
  "pilotICP": "UNBLOCK / HUNT", // any combination of UNBLOCK / HUNT / PROTECT
  "process": {
    "description": "...",
    "happyPath": "...",
    "failureVariants": [{ "name": "...", "desc": "..." }]
  },
  "systems": [
    { "name": "...", "type": "primary" },
    { "name": "...", "type": "enrichment", "note": "optional context" }
  ],
  "metrics": {
    "headline":   [{ "name": "...", "desc": "...", "type": "operational" }],
    "supporting": [{ "name": "...", "desc": "...", "type": "improvement" }]
  },
  "piReveals": {
    "insight": "...",
    "quickWins": ["...", "...", "..."]
  },
  "engagement": {
    "miningType": "...",
    "miningDetail": "...",
    "complexity": "Simple | Simple to Moderate | Moderate | Moderate to Complex | Complex",
    "timeToInsight": "...",
    "complexityDriver": "..."
  },
  "buyers": {
    "problemOwner": "...",
    "budgetOwner": "...",
    "language": {
      "operational": "how the operator describes the pain",
      "financial":   "how the CFO sees it in dollars"
    },
    "sfLicenseLink": "Why this process strengthens the Salesforce license case."
  }
}
```

All 30 entries share this exact set of top-level keys. When adding a new entry, copy
an existing one and replace the values rather than rebuilding the structure from scratch
— easy to miss a nested field otherwise.
