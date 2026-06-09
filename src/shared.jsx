// ============================================================
// GoWide — shared UI primitives, chips, section data blocks
// ============================================================

const { useState, useEffect, useMemo, useRef } = React;

// ── Section / family color palettes ─────────────────────────
// Each palette: bg (95-tint), text (20-tint), border, accent
const SHARED_SERVICE   = { bg: "var(--c-service-95)",   text: "var(--c-service-20)",   border: "rgba(31,138,122,0.20)",  accent: "var(--c-service)" };
const SHARED_SALES     = { bg: "var(--c-sales-95)",     text: "var(--c-sales-20)",     border: "rgba(2,42,192,0.22)",    accent: "var(--c-sales)" };
const SHARED_REVENUE   = { bg: "var(--c-revenue-95)",   text: "var(--c-revenue-20)",   border: "rgba(43,47,140,0.22)",   accent: "var(--c-revenue)" };
const SHARED_MARKETING = { bg: "var(--c-marketing-95)", text: "var(--c-marketing-20)", border: "rgba(184,59,94,0.22)",   accent: "var(--c-marketing)" };
const SHARED_AMBER     = { bg: "var(--c-engagement-95)", text: "var(--c-engagement-20)", border: "rgba(180,114,24,0.22)", accent: "var(--c-engagement)" };
const SHARED_GRAY      = { bg: "#F2F0EA",               text: "#3B3A35",               border: "rgba(59,58,53,0.18)",    accent: "#6B6B70" };

// Map raw domain strings → palette
const DOMAIN_COLORS = {
  "Service Cloud":              SHARED_SERVICE,
  "Sales Cloud":                SHARED_SALES,
  "Revenue Cloud / ERP":        SHARED_REVENUE,
  "Revenue Cloud":              SHARED_REVENUE,
  "Revenue Cloud / Legal":      SHARED_REVENUE,
  "Revenue Cloud / Billing":    SHARED_REVENUE,
  "Service / Experience Cloud": SHARED_SERVICE,
  "Field Service":              SHARED_SERVICE,
  "Finance / ERP Integration":  SHARED_REVENUE,
  "Finance / Integration":      SHARED_REVENUE,
  "Finance":                    SHARED_REVENUE,
  "Experience Cloud":           SHARED_REVENUE,
  "Marketing Cloud":            SHARED_MARKETING,
  "Shield / Platform":          SHARED_GRAY,
  "Platform":                   SHARED_GRAY,
  "HR / Platform":              SHARED_REVENUE,
  "Marketing / Commerce":       SHARED_MARKETING,
  "Commerce / Service Cloud":   SHARED_MARKETING,
  "Service / Manufacturing Cloud": SHARED_AMBER,
  "Data Cloud":                 SHARED_SERVICE,
  "Agentforce":                 SHARED_SALES,
  "Platform / PSA":             SHARED_GRAY,
  "Nonprofit Cloud":            SHARED_REVENUE,
};

const COMPLEXITY_COLORS = {
  "Simple":              SHARED_SERVICE,
  "Simple to Moderate":  SHARED_SERVICE,
  "Moderate":            SHARED_AMBER,
  "Moderate to Complex": SHARED_AMBER,
  "Complex":             SHARED_MARKETING,
};

// Section accents (used in expanded views)
const SECTION_ACCENTS = {
  process:    "var(--c-sales)",      // orange — "how it flows" is the central narrative
  systems:    "var(--c-service)",    // teal — data
  metrics:    "var(--c-revenue)",    // indigo — quant
  piReveals:  "var(--gw-charcoal)",  // ink — insight
  engagement: "var(--c-engagement)", // amber — work
  buyers:     "var(--c-service)",    // teal — language/people
};

// ============== Chips ==============

const chipBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.2,
  whiteSpace: "nowrap",
  borderWidth: 1,
  borderStyle: "solid",
  lineHeight: 1.3,
};

function Chip({ color, children, dot, mono, style }) {
  const c = color || SHARED_GRAY;
  return (
    <span style={{
      ...chipBase,
      backgroundColor: c.bg,
      color: c.text,
      borderColor: c.border,
      fontFamily: mono ? "var(--font-mono)" : "inherit",
      ...(style || {}),
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: c.accent, display: "inline-block" }} />}
      {children}
    </span>
  );
}

function DomainChip({ domain, dot }) {
  return <Chip color={DOMAIN_COLORS[domain] || SHARED_GRAY} dot={dot}>{domain}</Chip>;
}
function ComplexityChip({ complexity }) {
  return <Chip color={COMPLEXITY_COLORS[complexity] || SHARED_GRAY}>{complexity}</Chip>;
}
function MonoChip({ children, tone }) {
  const palette = tone === "orange"
    ? SHARED_SALES
    : { bg: "#F2F0EA", text: "#3B3A35", border: "rgba(59,58,53,0.18)" };
  return <Chip color={palette} mono>{children}</Chip>;
}

// ============== Section eyebrow ==============

function Eyebrow({ color, children, num }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: color || "var(--gw-orange)",
      fontWeight: 500,
    }}>
      {num != null && (
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: color || "var(--gw-orange)",
          opacity: 0.7,
          letterSpacing: 0,
          fontFeatureSettings: "'tnum'",
        }}>
          {String(num).padStart(2, "0")}
        </span>
      )}
      <span style={{
        display: "inline-block",
        width: 20,
        height: 2,
        background: color || "var(--gw-orange)",
      }} />
      <span style={{ letterSpacing: "0.14em" }}>{children}</span>
    </div>
  );
}

// ============== Hero KPI strip ==============

function HeroKpis({ processes }) {
  const stats = useMemo(() => {
    const complexity = {};
    processes.forEach(p => {
      const c = p.engagement.complexity;
      complexity[c] = (complexity[c] || 0) + 1;
    });
    const simple   = (complexity["Simple"]   || 0) + (complexity["Simple to Moderate"]   || 0);
    const moderate = (complexity["Moderate"] || 0) + (complexity["Moderate to Complex"] || 0);
    const complex  = complexity["Complex"] || 0;
    return { simple, moderate, complex };
  }, [processes]);

  return (
    <>
      <div className="kpi">
        <div className="kpi-v"><span className="accent">{processes.length}</span></div>
        <div className="kpi-l">Processes</div>
      </div>
      <div className="kpi">
        <div className="kpi-v">{stats.simple}</div>
        <div className="kpi-l">Simple · 2–3 wk</div>
      </div>
      <div className="kpi">
        <div className="kpi-v">{stats.moderate + stats.complex}</div>
        <div className="kpi-l">Mod. / Complex</div>
      </div>
    </>
  );
}

function LegendInline() {
  return (
    <>
      <span><span className="swatch" style={{ background: "var(--c-sales)" }} />Sales / Agentforce</span>
      <span><span className="swatch" style={{ background: "var(--c-service)" }} />Service / Field / Data</span>
      <span><span className="swatch" style={{ background: "var(--c-revenue)" }} />Revenue / Finance</span>
      <span><span className="swatch" style={{ background: "var(--c-marketing)" }} />Marketing / Commerce</span>
    </>
  );
}

// ============== Section data blocks (shared across modes) ==============

// "How the process flows" — happy path + failure variants
function FlowBlock({ p, accent, dense }) {
  const a = accent || SECTION_ACCENTS.process;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: dense ? 12 : 16 }}>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "var(--body)" }}>
        {p.process.description}
      </p>

      <div style={{
        padding: "14px 18px",
        background: "#fff",
        borderRadius: 10,
        border: "1px solid var(--rule)",
        borderLeft: `3px solid ${a}`,
      }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
          color: a, textTransform: "uppercase", letterSpacing: "0.14em",
          marginBottom: 6, display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: 0, fontSize: 14, lineHeight: 1 }}>→</span>
          Happy path
        </div>
        <div style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>
          {p.process.happyPath}
        </div>
      </div>

      <div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
          color: "var(--c-marketing)", textTransform: "uppercase", letterSpacing: "0.14em",
          marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: 0, fontSize: 14, lineHeight: 1 }}>✕</span>
          Where it breaks · {p.process.failureVariants.length} common variants
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {p.process.failureVariants.map((v, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 14,
              alignItems: "baseline",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: "var(--c-marketing-95)", color: "var(--c-marketing-20)",
                fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 11,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(184,59,94,0.18)",
                position: "relative", top: 2,
                letterSpacing: 0,
              }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14, marginBottom: 2 }}>{v.name}</div>
                <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// "Where data lives" — systems list
function SystemsBlock({ p }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {p.systems.map((s, i) => (
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 12,
          alignItems: "baseline",
          padding: "10px 14px",
          background: s.type === "primary" ? "var(--c-service-95)" : "#FAFAF7",
          borderRadius: 8,
          border: s.type === "primary" ? "1px solid rgba(31,138,122,0.18)" : "1px solid var(--rule)",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.10em",
            color: s.type === "primary" ? "var(--c-service)" : "var(--muted)",
            textTransform: "uppercase",
            paddingTop: 2,
          }}>
            {s.type === "primary" ? "PRIMARY" : "ENRICH"}
          </span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{s.name}</div>
            {s.note && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>{s.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// "Key metrics"
function MetricsBlock({ p, expandable }) {
  const [showAll, setShowAll] = useState(false);
  return (
    <div>
      <div style={{ display: "grid", gap: 8 }}>
        {p.metrics.headline.map((m, i) => (
          <div key={i} style={{
            padding: "12px 14px",
            background: "#fff",
            borderRadius: 8,
            border: "1px solid var(--rule)",
            borderLeft: `3px solid ${m.type === "improvement" ? "var(--c-sales)" : "var(--c-revenue)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{m.name}</div>
              <span style={{
                fontSize: 9, fontFamily: "var(--font-mono)",
                color: m.type === "improvement" ? "var(--c-sales)" : "var(--c-revenue)",
                opacity: 0.85, letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {m.type === "improvement" ? "Δ" : "·"} {m.type}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55 }}>{m.desc}</div>
          </div>
        ))}
      </div>
      {expandable && p.metrics.supporting.length > 0 && (
        <>
          <button
            onClick={() => setShowAll(s => !s)}
            style={{
              marginTop: 10, padding: "8px 12px",
              background: "transparent", border: "1px dashed var(--rule-strong)",
              borderRadius: 8, fontSize: 12, color: "var(--muted)",
              cursor: "pointer", width: "100%", textAlign: "left",
              fontWeight: 500, fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "var(--gw-orange)"; e.currentTarget.style.color = "var(--gw-orange-deep)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "var(--rule-strong)"; e.currentTarget.style.color = "var(--muted)"; }}
          >
            {showAll ? "− Hide" : "+ Show"} {p.metrics.supporting.length} supporting metric{p.metrics.supporting.length === 1 ? "" : "s"}
          </button>
          {showAll && (
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {p.metrics.supporting.map((m, i) => (
                <div key={i} style={{ fontSize: 12.5, color: "var(--body)", padding: "6px 10px" }}>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>{m.name}</span>
                  <span style={{ color: "var(--muted)" }}> — {m.desc}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// "What PI reveals" — insight + quick wins
function PIRevealsBlock({ p, accent }) {
  const a = accent || SECTION_ACCENTS.piReveals;
  return (
    <div>
      <blockquote style={{
        margin: "0 0 16px",
        padding: "18px 22px",
        background: "var(--gw-charcoal)",
        color: "#fff",
        borderRadius: 12,
        fontSize: 14.5, lineHeight: 1.65,
        position: "relative",
        overflow: "hidden",
      }}>
        <span style={{
          position: "absolute", top: -10, right: 14,
          fontFamily: "var(--font-display)", fontSize: 110, lineHeight: 1,
          color: "var(--sf-blue-l)", opacity: 0.30, fontWeight: 700,
        }}>“</span>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
          color: "var(--sf-blue-l)", textTransform: "uppercase", letterSpacing: "0.16em",
          marginBottom: 8,
        }}>
          PI insight
        </div>
        <div style={{ position: "relative" }}>{p.piReveals.insight}</div>
      </blockquote>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
        color: "var(--gw-orange)", textTransform: "uppercase", letterSpacing: "0.16em",
        marginBottom: 10,
      }}>
        Typical quick wins
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {p.piReveals.quickWins.map((w, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 12,
            padding: "10px 14px",
            background: "#fff",
            border: "1px solid var(--rule)",
            borderRadius: 8,
            alignItems: "baseline",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 11,
              color: "var(--gw-orange)",
              fontFeatureSettings: "'tnum'",
              letterSpacing: 0,
            }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: 13.5, color: "var(--body)", lineHeight: 1.55 }}>{w}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// "Engagement profile"
function EngagementBlock({ p }) {
  const cc = COMPLEXITY_COLORS[p.engagement.complexity] || SHARED_GRAY;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 8,
      }}>
        <StatTile label="Complexity" value={p.engagement.complexity} color={cc} />
        <StatTile label="Time to first insight" value={p.engagement.timeToInsight} mono />
        <StatTile label="Mining type" value={p.engagement.miningType} />
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
          color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em",
          marginBottom: 6,
        }}>
          Main complexity driver
        </div>
        <div style={{ color: "var(--body)" }}>{p.engagement.complexityDriver}</div>
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
          color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em",
          marginBottom: 6,
        }}>
          Mining detail
        </div>
        <div style={{ color: "var(--body)" }}>{p.engagement.miningDetail}</div>
      </div>
    </div>
  );
}

function StatTile({ label, value, color, mono }) {
  const c = color || { bg: "#fff", text: "var(--ink)", border: "var(--rule)" };
  return (
    <div style={{
      padding: "12px 14px",
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 8,
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
        color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em",
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600, color: c.text,
        fontFamily: mono ? "var(--font-mono)" : "var(--font-display)",
        letterSpacing: mono ? 0 : "-0.005em",
        lineHeight: 1.2,
      }}>{value}</div>
    </div>
  );
}

// "Who buys" — problem owner, budget owner, language, SF license link
function BuyersBlock({ p }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{
          padding: "12px 14px", background: "#fff",
          border: "1px solid var(--rule)", borderRadius: 8,
          borderTop: "2px solid var(--c-sales)",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            color: "var(--c-sales)", textTransform: "uppercase", letterSpacing: "0.14em",
            marginBottom: 6,
          }}>Problem owner</div>
          <div style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.55 }}>{p.buyers.problemOwner}</div>
        </div>
        <div style={{
          padding: "12px 14px", background: "#fff",
          border: "1px solid var(--rule)", borderRadius: 8,
          borderTop: "2px solid var(--c-service)",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            color: "var(--c-service)", textTransform: "uppercase", letterSpacing: "0.14em",
            marginBottom: 6,
          }}>Budget owner</div>
          <div style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.55 }}>{p.buyers.budgetOwner}</div>
        </div>
      </div>

      <div style={{
        padding: "14px 16px",
        background: "var(--paper-warm)",
        border: "1px solid var(--rule)",
        borderRadius: 10,
      }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
          color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em",
          marginBottom: 10,
        }}>Language that lands</div>
        <div style={{ marginBottom: 8, fontSize: 13, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>Operational · </span>
          <span style={{ color: "var(--body)" }}>{p.buyers.language.operational}</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>Financial · </span>
          <span style={{ color: "var(--body)" }}>{p.buyers.language.financial}</span>
        </div>
      </div>

      {p.buyers.sfLicenseLink && (
        <div style={{
          padding: "16px 18px",
          background: "var(--gw-charcoal)",
          borderRadius: 10,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          borderLeft: "3px solid var(--sf-blue-l)",
        }}>
          <div style={{
            position: "absolute", right: -10, top: -20, fontSize: 120,
            fontFamily: "var(--font-display)", color: "rgba(0,179,255,0.10)",
            lineHeight: 1, fontWeight: 700, letterSpacing: "-0.04em",
          }}>SF</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
            color: "var(--sf-blue-l)", textTransform: "uppercase", letterSpacing: "0.16em",
            marginBottom: 8, position: "relative",
          }}>Salesforce licence link</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.92)", position: "relative" }}>
            {p.buyers.sfLicenseLink}
          </div>
        </div>
      )}
    </div>
  );
}

// ============== Generic blocks for workbook-added content ==============

// Renders Processes-sheet columns the bespoke layout doesn't know about
// (declared on the workbook's Fields sheet).
function ExtraFieldsBlock({ p }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 10,
    }}>
      {p._extraFields.map(f => (
        <div key={f.key} style={{
          padding: "12px 14px", background: "#fff",
          border: "1px solid var(--rule)", borderRadius: 8,
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
            color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em",
            marginBottom: 6,
          }}>{f.label}</div>
          <div style={{ fontSize: 13.5, color: "var(--body)", lineHeight: 1.55 }}>
            {Array.isArray(f.value) ? f.value.join(", ") : f.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// Renders rows from workbook sheets the bespoke layout doesn't know about
// (any sheet with a "Process ID" column).
function GenericSectionBlock({ rows }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "auto 1fr", gap: 12,
          padding: "10px 14px", background: "#fff",
          border: "1px solid var(--rule)", borderRadius: 8,
          alignItems: "baseline",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 11,
            color: "var(--gw-orange)", fontFeatureSettings: "'tnum'", letterSpacing: 0,
          }}>{String(i + 1).padStart(2, "0")}</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{r.title}</div>
            {r.body && <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginTop: 2 }}>{r.body}</div>}
            {r.meta && r.meta.length > 0 && (
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                {r.meta.join(" · ")}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============== Section catalog ==============

const SECTIONS = [
  { id: "process",    label: "How the process flows",   short: "Process",    accent: SECTION_ACCENTS.process,    num: 1, render: (p) => <FlowBlock p={p} accent={SECTION_ACCENTS.process} /> },
  { id: "systems",    label: "Where the data lives",    short: "Data",       accent: SECTION_ACCENTS.systems,    num: 2, render: (p) => <SystemsBlock p={p} /> },
  { id: "metrics",    label: "Key metrics",             short: "Metrics",    accent: SECTION_ACCENTS.metrics,    num: 3, render: (p) => <MetricsBlock p={p} expandable /> },
  { id: "piReveals",  label: "What PI reveals",         short: "Insights",   accent: SECTION_ACCENTS.piReveals,  num: 4, render: (p) => <PIRevealsBlock p={p} accent={SECTION_ACCENTS.piReveals} /> },
  { id: "engagement", label: "Engagement profile",      short: "Engagement", accent: SECTION_ACCENTS.engagement, num: 5, render: (p) => <EngagementBlock p={p} /> },
  { id: "buyers",     label: "Who buys & how to pitch", short: "Buyers",     accent: SECTION_ACCENTS.buyers,     num: 6, render: (p) => <BuyersBlock p={p} /> },
];

// Per-process section list: the fixed catalog plus any sections that exist
// only in the workbook (extra Fields columns, extra sheets). This is what
// lets the workbook grow without code changes.
function sectionsFor(p) {
  const extras = [];
  if (p._extraFields && p._extraFields.length) {
    extras.push({
      id: "_extraFields", label: "More details", short: "More",
      accent: "#6B6B70", render: (proc) => <ExtraFieldsBlock p={proc} />,
    });
  }
  (p._extraSections || []).forEach(sec => {
    extras.push({
      id: "_sheet_" + sec.id, label: sec.label, short: sec.label,
      accent: SECTION_ACCENTS.engagement,
      render: () => <GenericSectionBlock rows={sec.rows} />,
    });
  });
  return [
    ...SECTIONS,
    ...extras.map((s, i) => ({ ...s, num: SECTIONS.length + i + 1 })),
  ];
}

// Export to window so other Babel scripts can access
Object.assign(window, {
  SHARED_SERVICE, SHARED_SALES, SHARED_REVENUE, SHARED_MARKETING, SHARED_AMBER, SHARED_GRAY,
  DOMAIN_COLORS, COMPLEXITY_COLORS, SECTION_ACCENTS,
  Chip, DomainChip, ComplexityChip, MonoChip,
  Eyebrow, HeroKpis, LegendInline,
  FlowBlock, SystemsBlock, MetricsBlock, PIRevealsBlock, EngagementBlock, BuyersBlock,
  ExtraFieldsBlock, GenericSectionBlock,
  StatTile, SECTIONS, sectionsFor,
});
