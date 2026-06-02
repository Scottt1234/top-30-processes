# Top 30 Processes — Salesforce Process Intelligence

Interactive reference site: a ranked list of the 30 best candidate processes for
Process Intelligence pilots — for each one, how it flows, where the data lives,
what PI reveals, the metrics, the engagement profile, and who buys / how it ties
back to Salesforce licensing.

Styled with the **Salesforce 2026 design system** (Salesforce Sans + Avant Garde
fonts in `assets/fonts/`, Electric/Cloud Blue palette, evening-gradient hero) to
match the `deck-apromore` narrative decks.

**Live:** https://scottt1234.github.io/top-30-processes/

---

## How this repo is structured (no build step)

The site is plain static files. GitHub Pages serves `index.html` directly.
There is **no bundler and no build command** — `index.html` is a small shell that
loads React + Babel from a CDN and transpiles the JSX in `src/` in the browser at
load time. Edit a source file, commit, and the change is live in ~30 seconds.

```
top-30-processes/
├── index.html            ← Shell: CSS, page markup, fonts, CDN React/Babel, loader.
│                            Hand-maintained. You rarely need to touch this.
├── src/
│   ├── data.js           ← THE 30 PROCESSES. Edit here for any content change.
│   │                        (window.processes = [ ... ] — one object per process)
│   ├── app.jsx           ← App shell, search + Family/Owner/Complexity filter bar, list rows
│   ├── shared.jsx        ← Chips, the 6-section catalog, and each section's render block
│   ├── expanded.jsx      ← The four expanded-row layouts (Sections / Spread / Story / Tabs)
│   └── tweaks-panel.jsx  ← The floating "Tweaks" control panel (layout + density)
├── archive/              ← Snapshots of previously published versions (safety net)
│   ├── 2026-05-19-v1.html
│   └── 2026-06-03-bundle-v2-gowide.html   ← last self-contained bundle, pre-rebuild
└── README.md
```

---

## Making changes

### Change content (the common case)
Edit **`src/data.js`** — reword a process, change metrics, swap buyer language,
add or remove an entry. Each process is one object in the `window.processes` array.
Commit. Done — no build, live in ~30s.

### Change layout or behaviour
Edit the relevant file in `src/` (`app.jsx` for the filter bar / row layout,
`expanded.jsx` for the expanded views, `shared.jsx` for chips/sections). Commit.
Live in ~30s. The browser transpiles the JSX automatically.

### Edit in the browser
You don't need a local checkout. On github.com open any file in `src/`, click the
pencil icon, edit, and commit. Pages redeploys on its own.

---

## How it renders

`index.html` loads, in order:

1. **React 18** + **ReactDOM 18** + **Babel standalone** — pinned CDN scripts.
2. **`src/data.js`** — sets `window.processes`.
3. **`src/tweaks-panel.jsx` → `src/shared.jsx` → `src/expanded.jsx` → `src/app.jsx`** —
   fetched, JSX-transpiled in-browser, and executed in that order. `app.jsx` mounts
   the React app into `#root` and the filter bar into `#filter-root`.

Load order matters: each module publishes helpers onto `window`, and later modules
use them. Keep the order above if you add modules.

---

## Process data shape (`src/data.js`)

Each entry in `window.processes`:

```js
{
  id: 1,
  name: "Customer Service Case Management",
  domain: "Service Cloud",            // drives the colour chip + Family filter
  industries: [...],
  primarySystems: [...],              // used by search
  headlineMetrics: [...],             // used by search
  buyerPersonas: [...],               // used by search
  sfCloud: "Service Cloud",
  pilotICP: "UNBLOCK / HUNT",

  process:   { description, happyPath, failureVariants: [{ name, desc }] },
  systems:   [{ name, type: "primary" | "enrichment", note? }],
  metrics:   { headline: [{ name, desc, type: "improvement" | "baseline" }],
               supporting: [{ name, desc }] },
  piReveals: { insight, quickWins: [string] },
  engagement:{ complexity, timeToInsight, miningType, complexityDriver, miningDetail },
  buyers:    { problemOwner, budgetOwner,
               language: { operational, financial },
               sfLicenseLink },
}
```

`domain` and `engagement.complexity` strings are matched against colour/label maps
in `src/shared.jsx` — reuse existing values where you can so chips stay coloured.

---

## Releasing a milestone

Before a big change you want to be able to roll back to, copy the current published
file into `archive/`:

```
cp index.html archive/$(date +%F)-vN.html
```

Then make your edits and commit. Pages always serves whatever `index.html` is at the
repo root.
