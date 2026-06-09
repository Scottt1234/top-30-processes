// One-time migration + regeneration tool:
// reads the frozen v3 data file (archive/data-v3.js) and writes
// data/processes.xlsx — the editable source of truth the site now loads.
//
// Usage:  npm install xlsx   (one-off; node_modules is gitignored)
//         node tools/build-workbook.mjs [input-data.js] [output.xlsx]
//
// After the migration the workbook is edited directly (Excel / Google
// Sheets / LibreOffice) — this script is only kept in case you ever need
// to rebuild the workbook from a JS data file again.

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const inputPath = path.resolve(repoRoot, process.argv[2] || "archive/data-v3.js");
const outputPath = path.resolve(repoRoot, process.argv[3] || "data/processes.xlsx");

// data file sets window.processes
global.window = {};
require(inputPath);
const processes = global.window.processes;
if (!Array.isArray(processes) || !processes.length) {
  console.error("No processes found in " + inputPath);
  process.exit(1);
}

// ── Derivations previously hardcoded in app.jsx, now materialised as
//    editable columns so laymen can correct them directly ──────────
const familyOf = (domain) => {
  if (!domain) return "Other";
  if (domain.includes("Service") || domain.includes("Field")) return "Service / Field";
  if (domain.includes("Sales")) return "Sales";
  if (domain.includes("Revenue") || domain.includes("Finance") || domain.includes("ERP")) return "Revenue / Finance";
  if (domain.includes("Marketing") || domain.includes("Commerce")) return "Marketing / Commerce";
  if (domain.includes("Data") || domain.includes("Agentforce")) return "Data / Agentforce";
  return "Other";
};

const OWNER_BUCKETS = [
  { id: "Sales",        re: /\b(sales|cro|revenue|rev[\s-]?ops|sales ops)\b/i },
  { id: "Marketing",    re: /\b(cmo|marketing|brand|demand gen)\b/i },
  { id: "Service / CX", re: /\b(service|customer success|customer care|cco|cs|support)\b/i },
  { id: "Finance",      re: /\b(cfo|finance|controller|treasur|ar |ap |collect)\b/i },
  { id: "Operations",   re: /\b(coo|operations|supply chain|field|manufacturing|procurement|logist)\b/i },
  { id: "IT / Data",    re: /\b(cio|cto|ciso|it ops|engineering|data|platform)\b/i },
  { id: "HR / Legal",   re: /\b(hr|chro|people|legal|counsel|compliance|risk)\b/i },
  { id: "Executive",    re: /\b(ceo|executive director|board|gm|managing director)\b/i },
];
const ownerAreasOf = (p) => {
  const text = [p.buyers.problemOwner, p.buyers.budgetOwner].join(" ");
  const hits = OWNER_BUCKETS.filter(b => b.re.test(text)).map(b => b.id);
  return hits.length ? hits : ["Other"];
};

const list = (a) => (a || []).join(" | ");

// ── Sheet: Processes (one row per process) ─────────────────────────
const processRows = processes.map(p => ({
  "ID": p.id,
  "Name": p.name,
  "Family": familyOf(p.domain),
  "Domain": p.domain,
  "Industries": list(p.industries),
  "Owner Areas": list(ownerAreasOf(p)),
  "Complexity": p.engagement.complexity,
  "Time to Insight": p.engagement.timeToInsight,
  "Mining Type": p.engagement.miningType,
  "Pilot ICP": p.pilotICP,
  "SF Cloud": p.sfCloud,
  "Primary Systems": list(p.primarySystems),
  "Headline Metrics": list(p.headlineMetrics),
  "Buyer Personas": list(p.buyerPersonas),
  "Description": p.process.description,
  "Happy Path": p.process.happyPath,
  "PI Insight": p.piReveals.insight,
  "Complexity Driver": p.engagement.complexityDriver,
  "Mining Detail": p.engagement.miningDetail,
  "Problem Owner": p.buyers.problemOwner,
  "Budget Owner": p.buyers.budgetOwner,
  "Language - Operational": p.buyers.language.operational,
  "Language - Financial": p.buyers.language.financial,
  "SF Licence Link": p.buyers.sfLicenseLink,
}));

// ── Child sheets (one row per item, keyed by Process ID) ───────────
const systemRows = [], metricRows = [], variantRows = [], winRows = [];
for (const p of processes) {
  for (const s of p.systems || []) {
    systemRows.push({ "Process ID": p.id, "Process Name": p.name, "System": s.name, "Type": s.type, "Note": s.note || "" });
  }
  for (const m of p.metrics?.headline || []) {
    metricRows.push({ "Process ID": p.id, "Process Name": p.name, "Tier": "headline", "Metric": m.name, "Description": m.desc, "Type": m.type || "" });
  }
  for (const m of p.metrics?.supporting || []) {
    metricRows.push({ "Process ID": p.id, "Process Name": p.name, "Tier": "supporting", "Metric": m.name, "Description": m.desc, "Type": m.type || "" });
  }
  for (const v of p.process?.failureVariants || []) {
    variantRows.push({ "Process ID": p.id, "Process Name": p.name, "Variant": v.name, "Description": v.desc });
  }
  for (const w of p.piReveals?.quickWins || []) {
    winRows.push({ "Process ID": p.id, "Process Name": p.name, "Quick Win": w });
  }
}

// ── Sheet: Fields — controls search / filters / chips on the site ──
// Field    = exact column header on the Processes sheet
// Type     = text | list (list = values separated by " | ") | long text
// Searchable = yes/no   → offered in the "Search in…" picker
// Filter   = default (filter shown on page load) | optional (available
//            under "+ Add filter") | no
// Chip in list = yes/no → shown as a chip on the collapsed row
const fieldRows = [
  { "Field": "Name",                   "Label": "Process name",     "Type": "text",      "Searchable": "yes", "Filter": "no",       "Chip in list": "no",  "Notes": "Row title — always visible." },
  { "Field": "Family",                 "Label": "Family",           "Type": "text",      "Searchable": "yes", "Filter": "default",  "Chip in list": "no",  "Notes": "Drives the colour coding. Known values: Service / Field, Sales, Revenue / Finance, Marketing / Commerce, Data / Agentforce, Other." },
  { "Field": "Industries",             "Label": "Industry",         "Type": "list",      "Searchable": "yes", "Filter": "default",  "Chip in list": "no",  "Notes": "" },
  { "Field": "Owner Areas",            "Label": "Owner",            "Type": "list",      "Searchable": "yes", "Filter": "default",  "Chip in list": "no",  "Notes": "Functional area of the problem/budget owner." },
  { "Field": "Complexity",             "Label": "Complexity",       "Type": "text",      "Searchable": "no",  "Filter": "default",  "Chip in list": "yes", "Notes": "Known values: Simple, Simple to Moderate, Moderate, Moderate to Complex, Complex." },
  { "Field": "Domain",                 "Label": "Domain",           "Type": "text",      "Searchable": "yes", "Filter": "optional", "Chip in list": "yes", "Notes": "Fine-grained cloud label shown on each row." },
  { "Field": "Time to Insight",        "Label": "Time to insight",  "Type": "text",      "Searchable": "no",  "Filter": "optional", "Chip in list": "no",  "Notes": "" },
  { "Field": "Mining Type",            "Label": "Mining type",      "Type": "text",      "Searchable": "no",  "Filter": "optional", "Chip in list": "no",  "Notes": "" },
  { "Field": "Pilot ICP",              "Label": "Pilot ICP",        "Type": "text",      "Searchable": "yes", "Filter": "optional", "Chip in list": "no",  "Notes": "" },
  { "Field": "SF Cloud",               "Label": "Salesforce cloud", "Type": "text",      "Searchable": "yes", "Filter": "optional", "Chip in list": "no",  "Notes": "" },
  { "Field": "Primary Systems",        "Label": "Systems",          "Type": "list",      "Searchable": "yes", "Filter": "optional", "Chip in list": "no",  "Notes": "" },
  { "Field": "Buyer Personas",         "Label": "Buyer personas",   "Type": "list",      "Searchable": "yes", "Filter": "optional", "Chip in list": "no",  "Notes": "" },
  { "Field": "Headline Metrics",       "Label": "Headline metrics", "Type": "list",      "Searchable": "yes", "Filter": "no",       "Chip in list": "no",  "Notes": "" },
  { "Field": "Description",            "Label": "Description",      "Type": "long text", "Searchable": "yes", "Filter": "no",       "Chip in list": "no",  "Notes": "" },
  { "Field": "Happy Path",             "Label": "Happy path",       "Type": "long text", "Searchable": "yes", "Filter": "no",       "Chip in list": "no",  "Notes": "" },
  { "Field": "PI Insight",             "Label": "PI insight",       "Type": "long text", "Searchable": "yes", "Filter": "no",       "Chip in list": "no",  "Notes": "" },
  { "Field": "Complexity Driver",      "Label": "Complexity driver","Type": "long text", "Searchable": "no",  "Filter": "no",       "Chip in list": "no",  "Notes": "" },
  { "Field": "Mining Detail",          "Label": "Mining detail",    "Type": "long text", "Searchable": "no",  "Filter": "no",       "Chip in list": "no",  "Notes": "" },
  { "Field": "Problem Owner",          "Label": "Problem owner",    "Type": "long text", "Searchable": "yes", "Filter": "no",       "Chip in list": "no",  "Notes": "" },
  { "Field": "Budget Owner",           "Label": "Budget owner",     "Type": "long text", "Searchable": "yes", "Filter": "no",       "Chip in list": "no",  "Notes": "" },
  { "Field": "Language - Operational", "Label": "Operational language", "Type": "long text", "Searchable": "no", "Filter": "no",    "Chip in list": "no",  "Notes": "" },
  { "Field": "Language - Financial",   "Label": "Financial language",   "Type": "long text", "Searchable": "no", "Filter": "no",    "Chip in list": "no",  "Notes": "" },
  { "Field": "SF Licence Link",        "Label": "SF licence link",  "Type": "long text", "Searchable": "yes", "Filter": "no",       "Chip in list": "no",  "Notes": "" },
];

// ── Sheet: ReadMe — instructions for editors ───────────────────────
const readmeRows = [
  ["HOW TO EDIT THIS WORKBOOK"],
  [""],
  ["This file is the single source of truth for the Top Processes site."],
  ["Edit it in Excel / Google Sheets / LibreOffice, save as .xlsx, then upload it"],
  ["back to the repo at data/processes.xlsx (on github.com: open the data folder,"],
  ["'Add file' → 'Upload files', drop this file, commit). The site updates in ~30s."],
  [""],
  ["SHEETS"],
  ["• Processes — one row per process. Add a row to add a process; delete a row to"],
  ["  remove one. Give every process a unique ID (the list is ordered by ID)."],
  ["• Systems / Metrics / Failure Variants / Quick Wins — detail line-items."],
  ["  Each row belongs to the process whose ID is in the 'Process ID' column."],
  ["  ('Process Name' is just a human-readable helper — the ID is what links them.)"],
  ["• Fields — controls the website: which columns are searchable, which appear as"],
  ["  filters (default = shown on load, optional = under '+ Add filter'), and which"],
  ["  show as a chip on each collapsed row."],
  [""],
  ["RULES"],
  ["• Lists (Industries, Buyer Personas, …) separate values with a pipe: A | B | C"],
  ["• To add a brand-new field (e.g. Region): add a column to Processes, fill it in,"],
  ["  then add a matching row to Fields with the same name in the 'Field' column."],
  ["  It immediately becomes searchable / filterable / displayable — no code needed."],
  ["• To add a brand-new detail section (e.g. Case Studies): add a new sheet with a"],
  ["  'Process ID' column plus a title column and a description column. It will"],
  ["  render as an extra section in each process's expanded view."],
  ["• In Metrics, 'Tier' is headline or supporting; 'Type' is operational or improvement."],
  ["• In Systems, 'Type' is primary or enrichment."],
  [""],
  ["Keep a copy before big edits — previous versions also live in the repo's"],
  ["git history and in the archive/ folder."],
];

// ── Assemble workbook ───────────────────────────────────────────────
const wb = XLSX.utils.book_new();

const addSheet = (name, rows, widths) => {
  const ws = Array.isArray(rows[0])
    ? XLSX.utils.aoa_to_sheet(rows)
    : XLSX.utils.json_to_sheet(rows);
  if (widths) ws["!cols"] = widths.map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, name);
};

addSheet("ReadMe", readmeRows, [86]);
addSheet("Processes", processRows, [
  4, 42, 18, 22, 40, 24, 20, 14, 30, 22, 18, 40, 40, 28,
  70, 70, 70, 60, 60, 50, 50, 60, 60, 70,
]);
addSheet("Systems", systemRows, [10, 42, 40, 12, 40]);
addSheet("Metrics", metricRows, [10, 42, 12, 38, 60, 12]);
addSheet("Failure Variants", variantRows, [10, 42, 28, 80]);
addSheet("Quick Wins", winRows, [10, 42, 80]);
addSheet("Fields", fieldRows, [24, 22, 10, 11, 10, 12, 90]);

XLSX.writeFile(wb, outputPath);
console.log(`Wrote ${outputPath}:`);
console.log(`  ${processRows.length} processes, ${systemRows.length} systems, ${metricRows.length} metrics, ${variantRows.length} variants, ${winRows.length} quick wins, ${fieldRows.length} field configs`);
