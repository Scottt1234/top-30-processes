// ============================================================
// GoWide — App: ranked list of 30 processes
// ============================================================

const { useState: useS, useMemo: useM, useEffect: useE } = React;

// ── Tweak defaults (persisted via __edit_mode_set_keys) ─────
const APP_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "expandMode": "sections",
  "density": "comfy",
  "heroTheme": "dark",
  "accent": "#F26522"
}/*EDITMODE-END*/;

// Accent → deep-shade mapping (for hover / pressed states)
const ACCENT_DEEP = {
  "#F26522": "#C84F12",   // GoWide orange
  "#2B2F8C": "#1A1E5F",   // deep indigo
  "#1F8A7A": "#14635A",   // teal
  "#0F1014": "#000000",   // charcoal
};

// ── Row ──────────────────────────────────────────────────────
function ProcessRow({ p, expandMode, density, defaultOpen }) {
  const [expanded, setExpanded] = useS(!!defaultOpen);
  const domainColor = DOMAIN_COLORS[p.domain] || SHARED_GRAY;

  const pad = density === "compact" ? "12px 22px" : "18px 26px";
  const nameSize = density === "compact" ? 14.5 : 16.5;
  const numSize = density === "compact" ? 13 : 15;

  let Expanded = ExpandedSections;
  if (expandMode === "spread") Expanded = ExpandedSpread;
  else if (expandMode === "story") Expanded = ExpandedStory;
  else if (expandMode === "tabs") Expanded = ExpandedTabs;

  return (
    <div
      data-screen-label={`P${String(p.id).padStart(2,"0")} ${p.name}`}
      style={{
        borderBottom: "1px solid var(--rule)",
        background: expanded ? "var(--paper-warm)" : "#fff",
        transition: "background 0.18s ease",
        position: "relative",
      }}
    >
      <span style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: 3,
        background: expanded ? domainColor.accent : "transparent",
        transition: "background 0.18s ease",
      }} />

      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="gw-row-trigger"
        style={{
          width: "100%",
          padding: pad,
          paddingLeft: density === "compact" ? 24 : 30,
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto",
          alignItems: "center",
          gap: 18,
          background: "transparent",
          border: "none",
          textAlign: "left",
          fontFamily: "inherit",
          color: "inherit",
        }}
      >
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: numSize + 1,
          fontWeight: 600,
          color: expanded ? domainColor.accent : "var(--ink)",
          minWidth: 36,
          letterSpacing: "-0.02em",
          fontFeatureSettings: "'tnum'",
          transition: "color 0.18s ease",
        }}>
          {String(p.id).padStart(2, "0")}
        </span>

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: nameSize,
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.3,
            letterSpacing: "-0.015em",
          }}>
            {p.name}
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}>
          <DomainChip domain={p.domain} dot />
          {density !== "compact" && <ComplexityChip complexity={p.engagement.complexity} />}
        </div>

        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28, height: 28,
          borderRadius: 999,
          background: expanded ? "var(--gw-orange)" : "transparent",
          color: expanded ? "#fff" : "var(--muted)",
          border: expanded ? "none" : "1px solid var(--rule)",
          fontSize: 10,
          transform: expanded ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.22s ease, background 0.18s ease, color 0.18s ease",
        }}>
          ▼
        </span>
      </button>

      {expanded && <Expanded p={p} />}
    </div>
  );
}

// ── Owner bucketing ─────────────────────────────────────────
const OWNER_BUCKETS = [
  { id: "Sales",          re: /\b(sales|cro|revenue|rev[\s-]?ops|sales ops)\b/i },
  { id: "Marketing",      re: /\b(cmo|marketing|brand|demand gen)\b/i },
  { id: "Service / CX",   re: /\b(service|customer success|customer care|cco|cs|support)\b/i },
  { id: "Finance",        re: /\b(cfo|finance|controller|treasur|ar |ap |collect)\b/i },
  { id: "Operations",     re: /\b(coo|operations|supply chain|field|manufacturing|procurement|logist)\b/i },
  { id: "IT / Data",      re: /\b(cio|cto|ciso|it ops|engineering|data|platform)\b/i },
  { id: "HR / Legal",     re: /\b(hr|chro|people|legal|counsel|compliance|risk)\b/i },
  { id: "Executive",      re: /\b(ceo|executive director|board|gm|managing director)\b/i },
];
const ownerBuckets = (p) => {
  const text = [p.buyers.problemOwner, p.buyers.budgetOwner].join(" ");
  const buckets = OWNER_BUCKETS.filter(b => b.re.test(text)).map(b => b.id);
  return buckets.length ? buckets : ["Other"];
};

// ── Filter bar (lives in hero) ──────────────────────────────
function FilterBar({ filters, setFilters, totalShown, total }) {
  const cloudOpts = ["All", "Service / Field", "Sales", "Revenue / Finance", "Marketing / Commerce", "Data / Agentforce", "Other"];
  const complexityOpts = ["All", "Simple", "Moderate", "Complex"];
  const ownerOpts = ["All", ...OWNER_BUCKETS.map(b => b.id), "Other"];

  const btn = (label, active, onClick) => (
    <button
      key={label}
      onClick={onClick}
      className={"gw-chip-btn" + (active ? " is-active" : "")}
    >
      {label}
    </button>
  );

  return (
    <div className="gw-filter-shell">
      <div className="gw-filter-search">
        <div className="gw-search-wrap">
          <span className="gw-search-icon">⌕</span>
          <input
            className="gw-search-input"
            type="text"
            placeholder="Search 30 processes…"
            value={filters.query}
            onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
          />
        </div>
        <div className="gw-shown-count">
          <strong>{totalShown}</strong>/{total} shown
        </div>
      </div>

      <div className="gw-filter-groups">
        <div className="gw-filter-row">
          <span className="label">Family</span>
          <div className="chips">
            {cloudOpts.map(o => btn(o, filters.cloud === o, () => setFilters(f => ({ ...f, cloud: o }))))}
          </div>
        </div>
        <div className="gw-filter-row">
          <span className="label">Owner</span>
          <div className="chips">
            {ownerOpts.map(o => btn(o, filters.owner === o, () => setFilters(f => ({ ...f, owner: o }))))}
          </div>
        </div>
        <div className="gw-filter-row">
          <span className="label">Complexity</span>
          <div className="chips">
            {complexityOpts.map(o => btn(o, filters.complexity === o, () => setFilters(f => ({ ...f, complexity: o }))))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(APP_TWEAK_DEFAULTS);

  const [filters, setFilters] = useS({
    query: "",
    cloud: "All",
    owner: "All",
    complexity: "All",
  });

  // Apply hero theme + accent color globally via :root attributes / CSS vars
  useE(() => {
    document.documentElement.setAttribute("data-hero", t.heroTheme || "dark");
  }, [t.heroTheme]);

  useE(() => {
    const accent = t.accent || "#F26522";
    const accentDeep = ACCENT_DEEP[accent] || accent;
    document.documentElement.style.setProperty("--gw-orange", accent);
    document.documentElement.style.setProperty("--gw-orange-deep", accentDeep);
    // Also sync c-sales (used for the "Sales / Agentforce" domain) so the palette stays cohesive
    document.documentElement.style.setProperty("--c-sales", accent);
  }, [t.accent]);

  const cloudFamily = (domain) => {
    if (!domain) return "Other";
    if (domain.includes("Service") || domain.includes("Field")) return "Service / Field";
    if (domain.includes("Sales")) return "Sales";
    if (domain.includes("Revenue") || domain.includes("Finance") || domain.includes("ERP")) return "Revenue / Finance";
    if (domain.includes("Marketing") || domain.includes("Commerce")) return "Marketing / Commerce";
    if (domain.includes("Data") || domain.includes("Agentforce")) return "Data / Agentforce";
    return "Other";
  };

  const complexityBucket = (c) => {
    if (!c) return "Moderate";
    if (c.includes("Simple")) return "Simple";
    if (c === "Complex") return "Complex";
    return "Moderate";
  };

  const filtered = useM(() => {
    const q = filters.query.trim().toLowerCase();
    return window.processes.filter(p => {
      if (filters.cloud !== "All" && cloudFamily(p.domain) !== filters.cloud) return false;
      if (filters.complexity !== "All" && complexityBucket(p.engagement.complexity) !== filters.complexity) return false;
      if (filters.owner !== "All" && !ownerBuckets(p).includes(filters.owner)) return false;
      if (q) {
        const haystack = [
          p.name, p.domain, p.buyers.problemOwner, p.buyers.budgetOwner,
          p.process.description,
          ...(p.buyerPersonas || []),
          ...(p.headlineMetrics || []),
          ...(p.primarySystems || []),
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [filters]);

  // Hero KPIs
  useE(() => {
    const el = document.getElementById("hero-kpis-root");
    if (el) {
      window.__heroKpisRoot = window.__heroKpisRoot || ReactDOM.createRoot(el);
      window.__heroKpisRoot.render(<HeroKpis processes={window.processes} />);
    }
  }, []);

  // Legend
  useE(() => {
    const el = document.getElementById("legend-root");
    if (el) {
      window.__legendRoot = window.__legendRoot || ReactDOM.createRoot(el);
      window.__legendRoot.render(<LegendInline />);
    }
  }, [t.accent]);

  // Filter bar
  useE(() => {
    const fEl = document.getElementById("filter-root");
    if (fEl) {
      window.__filterRoot = window.__filterRoot || ReactDOM.createRoot(fEl);
      window.__filterRoot.render(
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          totalShown={filtered.length}
          total={window.processes.length}
        />
      );
    }
  }, [filters, filtered.length]);

  return (
    <>
      {filtered.length === 0 ? (
        <div style={{
          padding: "60px 24px",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 14,
        }}>
          No processes match your filters.
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setFilters({ query: "", cloud: "All", owner: "All", complexity: "All" })}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid var(--gw-orange)",
                background: "transparent",
                color: "var(--gw-orange)",
                cursor: "pointer",
                fontSize: 13, fontWeight: 500,
                fontFamily: "inherit",
              }}
            >Clear filters</button>
          </div>
        </div>
      ) : (
        filtered.map(p => (
          <ProcessRow
            key={p.id}
            p={p}
            expandMode={t.expandMode}
            density={t.density}
          />
        ))
      )}

      {/* ── Tweaks panel ──────────────────────────────────── */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero">
          <TweakRadio
            label="Theme"
            value={t.heroTheme}
            onChange={v => setTweak("heroTheme", v)}
            options={[
              { value: "dark",  label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </TweakSection>
        <TweakSection label="Brand accent">
          <TweakColor
            label="Color"
            value={t.accent}
            onChange={v => setTweak("accent", v)}
            options={["#F26522", "#2B2F8C", "#1F8A7A", "#0F1014"]}
          />
          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginTop: -4 }}>
            <strong>Orange</strong> is GoWide's signature.
          </div>
        </TweakSection>
        <TweakSection label="Expanded view">
          <TweakSelect
            label="Layout"
            value={t.expandMode}
            onChange={v => setTweak("expandMode", v)}
            options={[
              { value: "sections", label: "Sections (collapsible)" },
              { value: "spread",   label: "Spread (all inline)" },
              { value: "story",    label: "Story (editorial)" },
              { value: "tabs",     label: "Tabs (dossier)" },
            ]}
          />
        </TweakSection>
        <TweakSection label="List">
          <TweakToggle
            label="Compact mode"
            value={t.density === "compact"}
            onChange={v => setTweak("density", v ? "compact" : "comfy")}
          />
        </TweakSection>
        <TweakSection label="Reset">
          <TweakButton onClick={() => {
            setTweak(APP_TWEAK_DEFAULTS);
            setFilters({ query: "", cloud: "All", owner: "All", complexity: "All" });
          }}>Reset to defaults</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// ── Set initial hero theme before App mounts (avoid flash) ──
(function() {
  const root = document.documentElement;
  if (!root.hasAttribute("data-hero")) {
    // Try to parse the tweak defaults from the source file marker — fallback "dark"
    root.setAttribute("data-hero", "dark");
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// Color tweak helper — the tweaks panel may not export TweakColor;
// rely on the panel's standard exports.
