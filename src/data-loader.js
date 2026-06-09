// ============================================================
// Data loader — parses data/processes.xlsx (SheetJS) into:
//   window.processes   — array of process objects (legacy shape +
//                        _fields flat map used by search/filter)
//   window.fieldConfig — rows of the Fields sheet (search/filter/chip config)
// The workbook is the single source of truth; editors maintain it in
// Excel / Google Sheets. See the workbook's ReadMe sheet for rules.
// ============================================================

(function () {
  const norm = (s) => String(s == null ? "" : s).trim();
  const sheetKey = (name) => norm(name).toLowerCase().replace(/[\s_-]+/g, "");
  const yes = (v) => /^y(es)?$|^true$|^1$/i.test(norm(v));
  const splitList = (v) => norm(v).split("|").map(x => x.trim()).filter(Boolean);

  // Sheets the renderer understands natively; anything else with a
  // "Process ID" column becomes a generic extra section.
  const KNOWN_SHEETS = ["readme", "processes", "fields", "systems", "metrics", "failurevariants", "quickwins"];

  // Processes-sheet columns consumed by the bespoke renderers. Any other
  // column declared on the Fields sheet renders generically in the
  // expanded view's "More details" block.
  const KNOWN_COLUMNS = [
    "ID", "Name", "Family", "Domain", "Industries", "Owner Areas", "Complexity",
    "Time to Insight", "Mining Type", "Pilot ICP", "SF Cloud", "Primary Systems",
    "Headline Metrics", "Buyer Personas", "Description", "Happy Path", "PI Insight",
    "Complexity Driver", "Mining Detail", "Problem Owner", "Budget Owner",
    "Language - Operational", "Language - Financial", "SF Licence Link",
  ];

  function rowsOf(wb, key) {
    const name = wb.SheetNames.find(n => sheetKey(n) === key);
    if (!name) return [];
    return XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "", raw: false });
  }

  function groupByProcess(rows) {
    const map = {};
    rows.forEach(r => {
      const id = norm(r["Process ID"]);
      if (!id) return;
      (map[id] = map[id] || []).push(r);
    });
    return map;
  }

  window.loadWorkbookData = async function (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not fetch " + url + " (" + res.status + ")");
    const wb = XLSX.read(await res.arrayBuffer(), { type: "array" });

    // ── Fields config ──────────────────────────────────────────
    const fieldConfig = rowsOf(wb, "fields")
      .filter(r => norm(r["Field"]))
      .map(r => ({
        key: norm(r["Field"]),
        label: norm(r["Label"]) || norm(r["Field"]),
        type: /list/i.test(norm(r["Type"])) ? "list" : "text",
        searchable: yes(r["Searchable"]),
        filter: /^default$/i.test(norm(r["Filter"])) ? "default"
              : /^optional$/i.test(norm(r["Filter"])) ? "optional" : "no",
        chip: yes(r["Chip in list"]),
      }));
    const fieldByKey = {};
    fieldConfig.forEach(f => { fieldByKey[f.key] = f; });
    const isList = (key) => (fieldByKey[key] || {}).type === "list";

    // ── Child sheets ───────────────────────────────────────────
    const systemsBy  = groupByProcess(rowsOf(wb, "systems"));
    const metricsBy  = groupByProcess(rowsOf(wb, "metrics"));
    const variantsBy = groupByProcess(rowsOf(wb, "failurevariants"));
    const winsBy     = groupByProcess(rowsOf(wb, "quickwins"));

    // Unknown sheets with a Process ID column → generic sections
    const extraSheets = wb.SheetNames
      .filter(n => !KNOWN_SHEETS.includes(sheetKey(n)))
      .map(n => ({
        id: sheetKey(n),
        label: norm(n),
        by: groupByProcess(XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: "", raw: false })),
      }))
      .filter(s => Object.keys(s.by).length);

    // ── Processes ──────────────────────────────────────────────
    const processes = rowsOf(wb, "processes")
      .filter(r => norm(r["Name"]))
      .map(r => {
        const id = norm(r["ID"]);

        // Flat field map: every configured field, lists split — this is
        // what search and the dynamic filters operate on.
        const fields = {};
        fieldConfig.forEach(f => {
          if (!(f.key in r)) return;
          fields[f.key] = isList(f.key) ? splitList(r[f.key]) : norm(r[f.key]);
        });

        // Fields declared in config but unknown to the bespoke layout —
        // rendered generically in the expanded view.
        const extraFields = fieldConfig
          .filter(f => !KNOWN_COLUMNS.includes(f.key) && norm(r[f.key]))
          .map(f => ({ key: f.key, label: f.label, value: fields[f.key] }));

        // Generic sections from unknown sheets, for this process
        const extraSections = extraSheets
          .map(s => {
            const rows = (s.by[id] || []).map(row => {
              const cols = Object.keys(row).filter(c => !/^process (id|name)$/i.test(norm(c)) && norm(row[c]));
              if (!cols.length) return null;
              return {
                title: norm(row[cols[0]]),
                body: cols.length > 1 ? norm(row[cols[1]]) : "",
                meta: cols.slice(2).map(c => norm(c) + ": " + norm(row[c])),
              };
            }).filter(Boolean);
            return rows.length ? { id: s.id, label: s.label, rows } : null;
          })
          .filter(Boolean);

        const sys = (systemsBy[id] || []).map(s => ({
          name: norm(s["System"]),
          type: /^enrich/i.test(norm(s["Type"])) ? "enrichment" : "primary",
          note: norm(s["Note"]) || undefined,
        }));
        const mets = (metricsBy[id] || []).map(m => ({
          tier: /^support/i.test(norm(m["Tier"])) ? "supporting" : "headline",
          name: norm(m["Metric"]),
          desc: norm(m["Description"]),
          type: norm(m["Type"]) || "operational",
        }));

        const p = {
          id: Number(id) || id,
          name: norm(r["Name"]),
          domain: norm(r["Domain"]),
          family: norm(r["Family"]),
          industries: splitList(r["Industries"]),
          ownerAreas: splitList(r["Owner Areas"]),
          primarySystems: splitList(r["Primary Systems"]),
          headlineMetrics: splitList(r["Headline Metrics"]),
          buyerPersonas: splitList(r["Buyer Personas"]),
          sfCloud: norm(r["SF Cloud"]),
          pilotICP: norm(r["Pilot ICP"]),
          process: {
            description: norm(r["Description"]),
            happyPath: norm(r["Happy Path"]),
            failureVariants: (variantsBy[id] || []).map(v => ({
              name: norm(v["Variant"]), desc: norm(v["Description"]),
            })),
          },
          systems: sys,
          metrics: {
            headline: mets.filter(m => m.tier === "headline"),
            supporting: mets.filter(m => m.tier === "supporting"),
          },
          piReveals: {
            insight: norm(r["PI Insight"]),
            quickWins: (winsBy[id] || []).map(w => norm(w["Quick Win"])).filter(Boolean),
          },
          engagement: {
            complexity: norm(r["Complexity"]),
            timeToInsight: norm(r["Time to Insight"]),
            miningType: norm(r["Mining Type"]),
            complexityDriver: norm(r["Complexity Driver"]),
            miningDetail: norm(r["Mining Detail"]),
          },
          buyers: {
            problemOwner: norm(r["Problem Owner"]),
            budgetOwner: norm(r["Budget Owner"]),
            language: {
              operational: norm(r["Language - Operational"]),
              financial: norm(r["Language - Financial"]),
            },
            sfLicenseLink: norm(r["SF Licence Link"]),
          },
          _fields: fields,
          _extraFields: extraFields,
          _extraSections: extraSections,
        };

        // Full-text haystack for "search everything"
        p._searchAll = [
          Object.values(fields).map(v => Array.isArray(v) ? v.join(" ") : v).join(" "),
          sys.map(s => s.name + " " + (s.note || "")).join(" "),
          mets.map(m => m.name + " " + m.desc).join(" "),
          p.process.failureVariants.map(v => v.name + " " + v.desc).join(" "),
          p.piReveals.quickWins.join(" "),
          extraSections.map(s => s.label + " " + s.rows.map(x => x.title + " " + x.body).join(" ")).join(" "),
        ].join(" ").toLowerCase();

        return p;
      })
      .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0));

    window.processes = processes;
    window.fieldConfig = fieldConfig;
    return { processes, fieldConfig };
  };
})();
