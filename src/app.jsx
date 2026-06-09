// ============================================================
// GoWide — App: ranked process list with workbook-driven
// search fields, filters and row chips (see data/processes.xlsx,
// "Fields" sheet).
// ============================================================

const { useState: useS, useMemo: useM, useEffect: useE, useRef: useR } = React;

// ── Tweak defaults (persisted via __edit_mode_set_keys) ─────
const APP_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "expandMode": "sections",
  "density": "comfy",
  "heroTheme": "dark",
  "accent": "#022AC0"
}/*EDITMODE-END*/;

// Accent → deep-shade mapping (for hover / pressed states)
const ACCENT_DEEP = {
  "#022AC0": "#001E5B",   // Electric Blue 30 → Navy 15
  "#066AFE": "#022AC0",   // Electric Blue 50 → 30
  "#06A59A": "#023434",   // Teal 60 → 20
  "#730394": "#481A54",   // Violet 30 → 20
};

const COMPLEXITY_ORDER = ["Simple", "Simple to Moderate", "Moderate", "Moderate to Complex", "Complex"];

// ── localStorage helpers (filter layout prefs survive reloads) ──
const loadPref = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v == null ? fallback : v;
  } catch (e) { return fallback; }
};
const savePref = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
};

// ── Field-aware chip (used on collapsed rows) ───────────────
function FieldChip({ field, p }) {
  const v = p._fields[field.key];
  if (field.key === "Domain") return <DomainChip domain={p.domain} dot />;
  if (field.key === "Complexity") return <ComplexityChip complexity={p.engagement.complexity} />;
  const values = Array.isArray(v) ? v : (v ? [v] : []);
  if (!values.length) return null;
  return (
    <>
      {values.slice(0, 2).map(x => <Chip key={x} color={SHARED_GRAY}>{x}</Chip>)}
      {values.length > 2 && <Chip color={SHARED_GRAY}>+{values.length - 2}</Chip>}
    </>
  );
}

// ── Row ──────────────────────────────────────────────────────
function ProcessRow({ p, expandMode, density, defaultOpen, chipFields }) {
  const [expanded, setExpanded] = useS(!!defaultOpen);
  const domainColor = DOMAIN_COLORS[p.domain] || SHARED_GRAY;

  const pad = density === "compact" ? "12px 22px" : "18px 26px";
  const nameSize = density === "compact" ? 14.5 : 16.5;
  const numSize = density === "compact" ? 13 : 15;

  let Expanded = ExpandedSections;
  if (expandMode === "spread") Expanded = ExpandedSpread;
  else if (expandMode === "story") Expanded = ExpandedStory;
  else if (expandMode === "tabs") Expanded = ExpandedTabs;

  const visibleChips = density === "compact" ? chipFields.slice(0, 1) : chipFields;

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
          {visibleChips.map(f => <FieldChip key={f.key} field={f} p={p} />)}
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

// ── Dropdown shell (click-outside aware) ────────────────────
function useClickOutside(onAway) {
  const ref = useR(null);
  useE(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onAway(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onAway]);
  return ref;
}

// Multi-select dropdown for high-cardinality facets (e.g. Industry)
function FacetDropdown({ field, values, selected, onToggle, onClear }) {
  const [open, setOpen] = useS(false);
  const [q, setQ] = useS("");
  const ref = useClickOutside(() => setOpen(false));

  const shown = q.trim()
    ? values.filter(v => v.value.toLowerCase().includes(q.trim().toLowerCase()))
    : values;

  return (
    <div className="gw-dd" ref={ref}>
      <button
        className={"gw-chip-btn gw-dd-btn" + (selected.length ? " is-active" : "")}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {selected.length
          ? `${selected.length} selected`
          : `Any ${field.label.toLowerCase()}`}
        <span className="gw-dd-caret">▾</span>
      </button>
      {open && (
        <div className="gw-dd-panel">
          <input
            className="gw-dd-search"
            type="text"
            placeholder={`Find a ${field.label.toLowerCase()}…`}
            value={q}
            onChange={e => setQ(e.target.value)}
            autoFocus
          />
          <div className="gw-dd-list">
            {shown.map(v => {
              const on = selected.includes(v.value);
              return (
                <button
                  key={v.value}
                  className={"gw-dd-item" + (on ? " is-on" : "")}
                  onClick={() => onToggle(v.value)}
                >
                  <span className="tick">{on ? "✓" : ""}</span>
                  <span className="val">{v.value}</span>
                  <span className="count">{v.count}</span>
                </button>
              );
            })}
            {!shown.length && <div className="gw-dd-empty">No matches</div>}
          </div>
          {selected.length > 0 && (
            <button className="gw-dd-clear" onClick={onClear}>Clear {field.label.toLowerCase()}</button>
          )}
        </div>
      )}
    </div>
  );
}

// One facet row: chips when few values, dropdown when many
function FacetRow({ field, values, selected, setSelected, onRemove }) {
  const toggle = (v) => setSelected(
    selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]
  );

  return (
    <div className="gw-filter-row">
      <span className="label">{field.label}</span>
      <div className="chips">
        {values.length <= 8 ? (
          <>
            <button
              className={"gw-chip-btn" + (!selected.length ? " is-active" : "")}
              onClick={() => setSelected([])}
            >All</button>
            {values.map(v => (
              <button
                key={v.value}
                className={"gw-chip-btn" + (selected.includes(v.value) ? " is-active" : "")}
                onClick={() => toggle(v.value)}
              >{v.value}</button>
            ))}
          </>
        ) : (
          <FacetDropdown
            field={field}
            values={values}
            selected={selected}
            onToggle={toggle}
            onClear={() => setSelected([])}
          />
        )}
        <button className="gw-facet-remove" title={`Hide the ${field.label} filter`} onClick={onRemove}>✕</button>
      </div>
    </div>
  );
}

// "+ Add filter" menu of optional / hidden facets
function AddFilterMenu({ available, onAdd }) {
  const [open, setOpen] = useS(false);
  const ref = useClickOutside(() => setOpen(false));
  if (!available.length) return null;
  return (
    <div className="gw-dd" ref={ref}>
      <button className="gw-chip-btn gw-add-filter" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        + Add filter
      </button>
      {open && (
        <div className="gw-dd-panel">
          <div className="gw-dd-list">
            {available.map(f => (
              <button key={f.key} className="gw-dd-item" onClick={() => { onAdd(f.key); setOpen(false); }}>
                <span className="val">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// "Search in: …" field picker
function SearchFieldPicker({ searchableFields, searchKeys, setSearchKeys }) {
  const [open, setOpen] = useS(false);
  const ref = useClickOutside(() => setOpen(false));
  const all = !searchKeys;

  const toggle = (key) => {
    if (all) { setSearchKeys([key]); return; }
    const next = searchKeys.includes(key)
      ? searchKeys.filter(k => k !== key)
      : [...searchKeys, key];
    setSearchKeys(next.length ? next : null);
  };

  const label = all
    ? "All fields"
    : searchKeys.length === 1
      ? (searchableFields.find(f => f.key === searchKeys[0]) || { label: searchKeys[0] }).label
      : `${searchKeys.length} fields`;

  return (
    <div className="gw-dd" ref={ref}>
      <button className="gw-search-in" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        in: <strong>{label}</strong> <span className="gw-dd-caret">▾</span>
      </button>
      {open && (
        <div className="gw-dd-panel gw-dd-right">
          <div className="gw-dd-list">
            <button className={"gw-dd-item" + (all ? " is-on" : "")} onClick={() => { setSearchKeys(null); setOpen(false); }}>
              <span className="tick">{all ? "✓" : ""}</span>
              <span className="val">All fields (incl. systems &amp; metrics)</span>
            </button>
            {searchableFields.map(f => {
              const on = !all && searchKeys.includes(f.key);
              return (
                <button key={f.key} className={"gw-dd-item" + (on ? " is-on" : "")} onClick={() => toggle(f.key)}>
                  <span className="tick">{on ? "✓" : ""}</span>
                  <span className="val">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter bar (lives in hero) ──────────────────────────────
function FilterBar({
  filters, setFilters, totalShown, total,
  fieldConfig, facetValues, activeFacets, setActiveFacets,
}) {
  const searchableFields = fieldConfig.filter(f => f.searchable);
  const filterableFields = fieldConfig.filter(f => f.filter !== "no");
  const availableToAdd = filterableFields.filter(f => !activeFacets.includes(f.key));

  const setFacet = (key, sel) => setFilters(f => ({ ...f, facets: { ...f.facets, [key]: sel } }));
  const anyActive = filters.query.trim() || Object.values(filters.facets).some(s => s && s.length);

  return (
    <div className="gw-filter-shell">
      <div className="gw-filter-search">
        <div className="gw-search-wrap">
          <span className="gw-search-icon">⌕</span>
          <input
            className="gw-search-input"
            type="text"
            placeholder={`Search ${total} processes…`}
            value={filters.query}
            onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
          />
        </div>
        <SearchFieldPicker
          searchableFields={searchableFields}
          searchKeys={filters.searchKeys}
          setSearchKeys={(keys) => { savePref("gw-search-keys", keys); setFilters(f => ({ ...f, searchKeys: keys })); }}
        />
        <div className="gw-shown-count">
          <strong>{totalShown}</strong>/{total} shown
        </div>
        {anyActive && (
          <button
            className="gw-clear-all"
            onClick={() => setFilters(f => ({ ...f, query: "", facets: {} }))}
          >Clear all</button>
        )}
      </div>

      <div className="gw-filter-groups">
        {activeFacets.map(key => {
          const field = fieldConfig.find(f => f.key === key);
          if (!field) return null;
          return (
            <FacetRow
              key={key}
              field={field}
              values={facetValues[key] || []}
              selected={filters.facets[key] || []}
              setSelected={(sel) => setFacet(key, sel)}
              onRemove={() => {
                setFacet(key, []);
                setActiveFacets(activeFacets.filter(k => k !== key));
              }}
            />
          );
        })}
        <div className="gw-filter-row">
          <span className="label"></span>
          <div className="chips">
            <AddFilterMenu
              available={availableToAdd}
              onAdd={(key) => setActiveFacets([...activeFacets, key])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(APP_TWEAK_DEFAULTS);
  const fieldConfig = window.fieldConfig || [];
  const processes = window.processes || [];

  const defaultFacets = useM(
    () => fieldConfig.filter(f => f.filter === "default").map(f => f.key),
    []
  );
  const [activeFacets, setActiveFacetsRaw] = useS(() => {
    const stored = loadPref("gw-active-facets", null);
    if (!stored) return defaultFacets;
    const valid = stored.filter(k => fieldConfig.some(f => f.key === k && f.filter !== "no"));
    return valid.length ? valid : defaultFacets;
  });
  const setActiveFacets = (keys) => { savePref("gw-active-facets", keys); setActiveFacetsRaw(keys); };

  const [filters, setFilters] = useS(() => ({
    query: "",
    searchKeys: loadPref("gw-search-keys", null),  // null = all searchable fields
    facets: {},                                     // key → [selected values]
  }));

  // Apply hero theme + accent color globally via :root attributes / CSS vars
  useE(() => {
    document.documentElement.setAttribute("data-hero", t.heroTheme || "dark");
  }, [t.heroTheme]);

  useE(() => {
    const accent = t.accent || "#022AC0";
    const accentDeep = ACCENT_DEEP[accent] || accent;
    document.documentElement.style.setProperty("--gw-orange", accent);
    document.documentElement.style.setProperty("--gw-orange-deep", accentDeep);
    // Also sync c-sales (used for the "Sales / Agentforce" domain) so the palette stays cohesive
    document.documentElement.style.setProperty("--c-sales", accent);
  }, [t.accent]);

  // Distinct values + counts per filterable field, derived from the data
  const facetValues = useM(() => {
    const out = {};
    fieldConfig.filter(f => f.filter !== "no").forEach(f => {
      const counts = new Map();
      processes.forEach(p => {
        const v = p._fields[f.key];
        (Array.isArray(v) ? v : (v ? [v] : [])).forEach(x => counts.set(x, (counts.get(x) || 0) + 1));
      });
      let vals = [...counts.entries()].map(([value, count]) => ({ value, count }));
      if (f.key === "Complexity") {
        vals.sort((a, b) => COMPLEXITY_ORDER.indexOf(a.value) - COMPLEXITY_ORDER.indexOf(b.value));
      } else if (vals.length <= 8) {
        vals.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
      } else {
        vals.sort((a, b) => a.value.localeCompare(b.value));
      }
      out[f.key] = vals;
    });
    return out;
  }, [fieldConfig, processes]);

  const filtered = useM(() => {
    const q = filters.query.trim().toLowerCase();
    return processes.filter(p => {
      for (const [key, sel] of Object.entries(filters.facets)) {
        if (!sel || !sel.length) continue;
        const v = p._fields[key];
        const values = Array.isArray(v) ? v : (v ? [v] : []);
        if (!values.some(x => sel.includes(x))) return false;
      }
      if (q) {
        if (!filters.searchKeys) {
          if (!p._searchAll.includes(q)) return false;
        } else {
          const hay = filters.searchKeys
            .map(k => { const v = p._fields[k]; return Array.isArray(v) ? v.join(" ") : (v || ""); })
            .join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
      }
      return true;
    });
  }, [filters, processes]);

  const chipFields = useM(() => fieldConfig.filter(f => f.chip), [fieldConfig]);

  // Hero KPIs + dynamic counts in the static hero markup
  useE(() => {
    const el = document.getElementById("hero-kpis-root");
    if (el) {
      window.__heroKpisRoot = window.__heroKpisRoot || ReactDOM.createRoot(el);
      window.__heroKpisRoot.render(<HeroKpis processes={processes} />);
    }
    const numeral = document.querySelector(".gw-numeral");
    if (numeral) numeral.textContent = processes.length;
    const count = document.getElementById("hero-count");
    if (count) count.textContent = processes.length;
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
          total={processes.length}
          fieldConfig={fieldConfig}
          facetValues={facetValues}
          activeFacets={activeFacets}
          setActiveFacets={setActiveFacets}
        />
      );
    }
  }, [filters, filtered.length, activeFacets, facetValues]);

  const resetAll = () => {
    setFilters(f => ({ ...f, query: "", facets: {}, searchKeys: null }));
    setActiveFacets(defaultFacets);
    savePref("gw-search-keys", null);
  };

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
              onClick={() => setFilters(f => ({ ...f, query: "", facets: {} }))}
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
            chipFields={chipFields}
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
            options={["#022AC0", "#066AFE", "#06A59A", "#730394"]}
          />
          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginTop: -4 }}>
            <strong>Electric Blue</strong> is the Salesforce default.
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
            resetAll();
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
    root.setAttribute("data-hero", "dark");
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
