# Top 30 Processes — Salesforce Process Intelligence

Interactive reference site: a ranked list of the best candidate processes for
Process Intelligence pilots — for each one, how it flows, where the data lives,
what PI reveals, the metrics, the engagement profile, and who buys / how it ties
back to Salesforce licensing.

Styled with the **Salesforce 2026 design system** (Salesforce Sans + Avant Garde
fonts in `assets/fonts/`, Electric/Cloud Blue palette, evening-gradient hero) to
match the `deck-apromore` narrative decks.

**Live:** https://scottt1234.github.io/top-30-processes/

---

## ✏️ Editing the content (the common case — no coding needed)

**All content lives in one spreadsheet: [`data/processes.xlsx`](data/processes.xlsx).**
Download it, edit it in Excel / Google Sheets / LibreOffice, then upload it back
(on github.com: open the `data` folder → *Add file* → *Upload files* → drop the
file → *Commit*). The live site updates in ~30 seconds. The workbook's own
**ReadMe sheet** repeats these instructions for whoever is editing.

The workbook's sheets:

| Sheet | What it holds |
|---|---|
| **Processes** | One row per process — name, family, industries, complexity, description, happy path, buyers, etc. Add a row to add a process; delete a row to remove one. Every process needs a unique `ID` (the list is ordered by it). |
| **Systems** | Where the data lives — one row per system, linked by `Process ID`. `Type` is `primary` or `enrichment`. |
| **Metrics** | One row per metric, linked by `Process ID`. `Tier` is `headline` or `supporting`; `Type` is `operational` or `improvement`. |
| **Failure Variants** | The "where it breaks" items, linked by `Process ID`. |
| **Quick Wins** | The "typical quick wins" bullets, linked by `Process ID`. |
| **Fields** | ⚙️ Controls the website itself — see below. |

Rules of thumb:

- **Lists** inside one cell (Industries, Buyer Personas, Primary Systems, …) are
  separated with a pipe: `Manufacturing | Retail | Utilities`.
- `Process Name` columns on the child sheets are just human-readable helpers —
  the `Process ID` is what links rows to a process.

### The Fields sheet — configure search & filters from the spreadsheet

Each row of the **Fields** sheet describes one column of the Processes sheet and
how the site should treat it:

| Column | Meaning |
|---|---|
| `Field` | Exact column header on the Processes sheet. |
| `Label` | What the site displays for it. |
| `Type` | `text`, `list` (pipe-separated values), or `long text`. |
| `Searchable` | `yes` → offered in the search box's "in: …" field picker. |
| `Filter` | `default` → filter row shown on page load · `optional` → available under **+ Add filter** · `no`. |
| `Chip in list` | `yes` → shown as a chip on each collapsed row. |

### Growing the data model — no code required

- **New field** (e.g. *Region*): add a `Region` column to the Processes sheet,
  fill it in, and add a `Region` row to the Fields sheet. It immediately becomes
  searchable / filterable / chip-able, and renders in a "More details" section
  of the expanded view.
- **New detail section** (e.g. *Case Studies*): add a new sheet with a
  `Process ID` column, a title column, and a description column. Its rows render
  as an extra section in each process's expanded view, named after the sheet.

---

## How this repo is structured (no build step)

The site is plain static files. GitHub Pages serves `index.html` directly.
There is **no bundler and no build command** — `index.html` loads React, Babel
and SheetJS from a CDN, parses `data/processes.xlsx` in the browser, and
transpiles the JSX in `src/` at load time.

```
top-30-processes/
├── index.html            ← Shell: CSS, page markup, fonts, CDN scripts, loader.
├── data/
│   └── processes.xlsx    ← ★ THE CONTENT + field config. Edit this.
├── src/
│   ├── data-loader.js    ← Parses the workbook → window.processes + window.fieldConfig
│   ├── app.jsx           ← App shell, workbook-driven search + filter bar, list rows
│   ├── shared.jsx        ← Chips, the section catalog, generic blocks for new fields/sheets
│   ├── expanded.jsx      ← The four expanded-row layouts (Sections / Spread / Story / Tabs)
│   └── tweaks-panel.jsx  ← The floating "Tweaks" control panel (theme, accent, layout, density)
├── tools/
│   └── build-workbook.mjs← One-time migration: archive/data-v3.js → data/processes.xlsx
├── archive/              ← Snapshots of previously published versions (safety net)
│   ├── 2026-05-19-v1.html
│   ├── 2026-06-03-bundle-v2-gowide.html
│   ├── 2026-06-09-v3.html            ← pre-workbook index.html
│   └── data-v3.js                    ← frozen JS data the workbook was generated from
└── README.md
```

### How it renders

`index.html` loads, in order:

1. **React 18** + **ReactDOM 18** + **Babel standalone** + **SheetJS** — pinned CDN scripts.
2. **`src/data-loader.js`** — defines `loadWorkbookData()`.
3. The boot script awaits `loadWorkbookData("data/processes.xlsx")`, which sets
   `window.processes` and `window.fieldConfig`, then fetches
   `tweaks-panel.jsx → shared.jsx → expanded.jsx → app.jsx`, JSX-transpiles each
   in-browser, and executes them in that order. `app.jsx` mounts the React app
   into `#root` and the filter bar into `#filter-root`.

Load order matters: each module publishes helpers onto `window`, and later
modules use them. Keep the order above if you add modules.

### Changing layout or behaviour

Edit the relevant file in `src/` (`app.jsx` for the filter bar / row layout,
`expanded.jsx` for the expanded views, `shared.jsx` for chips/sections) and
commit. Live in ~30s — the browser transpiles the JSX automatically.

### Using the site

- **Search** — type in the search box; the **in: All fields** picker narrows the
  search to specific fields (process name only, systems, buyer personas, …).
- **Filters** — multi-select; values within a filter are OR-ed, filters are
  AND-ed together. Small value sets render as chip rows, large ones (e.g.
  Industry) as a searchable dropdown. **+ Add filter** exposes the optional
  filters; the ✕ at the end of a row hides one. Choices persist in the browser.
- **Tweaks** (floating panel) — hero theme, brand accent, expanded-view layout
  (Sections / Spread / Story / Tabs), compact density, and reset.

---

## Releasing a milestone

Before a big change you want to be able to roll back to, copy the current
published shell and data into `archive/`:

```
cp index.html archive/$(date +%F)-vN.html
cp data/processes.xlsx archive/$(date +%F)-processes.xlsx
```

Then make your edits and commit. Pages always serves whatever `index.html` and
`data/processes.xlsx` are at the repo root paths.
