import { useState } from "react";

import processes from "./processes.json";

// Sort by pilot ID
processes.sort((a, b) => a.id - b.id);

const complexityColors = {
  "Simple": { bg: "#e8f5e9", text: "#2e7d32", border: "#2e7d32" },
  "Simple to Moderate": { bg: "#f1f8e9", text: "#558b2f", border: "#558b2f" },
  "Moderate": { bg: "#fff3e0", text: "#e65100", border: "#e65100" },
  "Moderate to Complex": { bg: "#fff3e0", text: "#bf360c", border: "#bf360c" },
  "Complex": { bg: "#ffebee", text: "#c62828", border: "#c62828" },
};

const sectionConfig = [
  { id: "process", label: "What Is This Process?", accent: "#1a3a5c", bg: "#f0f4f8" },
  { id: "systems", label: "Where Does the Data Live?", accent: "#0d5e4f", bg: "#edf7f4" },
  { id: "metrics", label: "Key Metrics", accent: "#5c1a1a", bg: "#fdf2f2" },
  { id: "piReveals", label: "What PI Reveals + Quick Wins", accent: "#4a2c6e", bg: "#f5f0fa" },
  { id: "engagement", label: "Engagement Profile", accent: "#5c4a1a", bg: "#faf5ee" },
  { id: "buyers", label: "Who Buys & Where", accent: "#0066cc", bg: "#f0f6ff" },
];

function Card({ process: p }) {
  const [openSections, setOpenSections] = useState({});

  const toggle = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cc = complexityColors[p.engagement.complexity] || complexityColors["Moderate"];

  const renderSection = (config) => {
    const isOpen = openSections[config.id];
    return (
      <div key={config.id} style={{ borderBottom: "1px solid #e8e8e8" }}>
        <button
          onClick={() => toggle(config.id)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "11px 16px",
            border: "none",
            background: isOpen ? config.bg : "transparent",
            cursor: "pointer",
            textAlign: "left",
            transition: "background 0.15s",
            borderLeft: isOpen ? `3px solid ${config.accent}` : "3px solid transparent",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: isOpen ? config.accent : "#444" }}>
            {config.label}
          </span>
          <span style={{
            fontSize: "11px", color: "#999",
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}>▼</span>
        </button>
        {isOpen && (
          <div style={{
            padding: "0 16px 14px 19px",
            background: config.bg,
            borderLeft: `3px solid ${config.accent}`,
          }}>
            {renderContent(config.id, config.accent)}
          </div>
        )}
      </div>
    );
  };

  const MetricRow = ({ m }) => (
    <div style={{ display: "flex", gap: "8px", marginBottom: "5px", fontSize: "13px", lineHeight: 1.4 }}>
      <span style={{ fontWeight: 600, color: "#333", flexShrink: 0 }}>{m.name}:</span>
      <span style={{ color: "#666" }}>{m.desc}</span>
    </div>
  );

  const renderContent = (id, accent) => {
    switch (id) {
      case "process":
        return (
          <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#333" }}>
            <p style={{ margin: "0 0 12px" }}>{p.process.description}</p>
            <div style={{
              padding: "10px 12px",
              background: "rgba(255,255,255,0.7)",
              borderRadius: "6px",
              marginBottom: "12px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                Happy Path
              </div>
              <div style={{ fontSize: "13px", color: "#444" }}>{p.process.happyPath}</div>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#c62828", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Common Failure Variants
            </div>
            {p.process.failureVariants.map((v, i) => (
              <div key={i} style={{ marginBottom: i < p.process.failureVariants.length - 1 ? 8 : 0 }}>
                <span style={{ fontWeight: 600, color: "#333" }}>{v.name}: </span>
                <span style={{ color: "#555" }}>{v.desc}</span>
              </div>
            ))}
          </div>
        );

      case "systems":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {p.systems.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "8px", fontSize: "13px" }}>
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px",
                  background: s.type === "primary" ? "#0d5e4f" : "#8a8a8a",
                  color: "#fff", whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {s.type === "primary" ? "PRIMARY" : "ENRICHMENT"}
                </span>
                <span style={{ color: "#333", fontWeight: 500 }}>{s.name}</span>
                {s.note && <span style={{ color: "#888", fontSize: "12px" }}>— {s.note}</span>}
              </div>
            ))}
          </div>
        );

      case "metrics":
        return (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Headline Metrics
            </div>
            {p.metrics.headline.map((m, i) => <MetricRow key={i} m={m} />)}
            <details style={{ marginTop: "10px" }}>
              <summary style={{
                fontSize: "12px", fontWeight: 600, color: "#888", cursor: "pointer",
                padding: "4px 0", borderTop: "1px solid #e8d4d4", marginTop: "4px",
              }}>
                Supporting Metrics ({p.metrics.supporting.length})
              </summary>
              <div style={{ paddingTop: "8px" }}>
                {p.metrics.supporting.map((m, i) => <MetricRow key={i} m={m} />)}
              </div>
            </details>
          </div>
        );

      case "piReveals":
        return (
          <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#333" }}>
            <p style={{ margin: "0 0 12px" }}>{p.piReveals.insight}</p>
            <div style={{ fontSize: "11px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Typical Quick Wins
            </div>
            {p.piReveals.quickWins.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: "6px", marginBottom: 4, fontSize: "13px", color: "#444" }}>
                <span style={{ color: accent, flexShrink: 0 }}>→</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        );

      case "engagement":
        return (
          <div style={{ fontSize: "13px", color: "#333" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
              <div style={{
                padding: "6px 12px", borderRadius: "6px", background: cc.bg,
                border: `1px solid ${cc.border}`, fontSize: "12px", fontWeight: 600, color: cc.text,
              }}>
                {p.engagement.complexity}
              </div>
              <div style={{
                padding: "6px 12px", borderRadius: "6px", background: "#f0f4f8",
                border: "1px solid #b0c4de", fontSize: "12px", fontWeight: 600, color: "#1a3a5c",
              }}>
                First insight: {p.engagement.timeToInsight}
              </div>
              <div style={{
                padding: "6px 12px", borderRadius: "6px", background: "#f5f0fa",
                border: "1px solid #b39ddb", fontSize: "12px", fontWeight: 600, color: "#4a2c6e",
              }}>
                {p.engagement.miningType}
              </div>
            </div>
            <div style={{ marginBottom: "8px", lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>Main complexity driver: </span>
              <span style={{ color: "#555" }}>{p.engagement.complexityDriver}</span>
            </div>
            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>Mining detail: </span>
              <span style={{ color: "#555" }}>{p.engagement.miningDetail}</span>
            </div>
          </div>
        );

      case "buyers":
        return (
          <div style={{ fontSize: "13px", color: "#333", lineHeight: 1.6 }}>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                Problem Owner
              </div>
              {p.buyers.problemOwner}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                Budget Owner
              </div>
              {p.buyers.budgetOwner}
            </div>
            <div style={{
              padding: "10px 12px", background: "rgba(255,255,255,0.7)", borderRadius: "6px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Language That Lands
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, color: "#444" }}>Operational: </span>
                <span style={{ color: "#555" }}>{p.buyers.language.operational}</span>
              </div>
              <div>
                <span style={{ fontWeight: 600, color: "#444" }}>Financial: </span>
                <span style={{ color: "#555" }}>{p.buyers.language.financial}</span>
              </div>
            </div>
            {p.buyers.sfLicenseLink && (
              <div style={{
                marginTop: "10px", padding: "10px 12px", background: "rgba(0,102,204,0.06)",
                borderRadius: "6px", border: "1px solid rgba(0,102,204,0.15)",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#0066cc", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  Salesforce License Link
                </div>
                <div style={{ fontSize: "13px", color: "#333", lineHeight: 1.5 }}>
                  {p.buyers.sfLicenseLink}
                </div>
              </div>
            )}
            {p.industries && (
              <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {p.industries.map((ind, i) => (
                  <span key={i} style={{
                    fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                    background: "#e8eef5", color: "#1a3a5c", fontWeight: 500,
                  }}>
                    {ind}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden",
      marginBottom: "20px", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        padding: "14px 16px 10px",
        background: "linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)",
        color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: "12px", fontWeight: 700,
            background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px",
          }}>
            {String(p.id).padStart(2, "0")}
          </span>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{p.name}</h2>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
          <span style={{
            fontSize: "10px", padding: "2px 8px", borderRadius: "3px",
            background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
          }}>
            {p.domain}
          </span>
          {p.sfCloud && (
            <span style={{
              fontSize: "10px", padding: "2px 8px", borderRadius: "3px",
              background: "rgba(0,176,240,0.3)", color: "#fff",
            }}>
              SF: {p.sfCloud}
            </span>
          )}
          {p.pilotICP && (
            <span style={{
              fontSize: "10px", padding: "2px 8px", borderRadius: "3px",
              background: p.pilotICP.includes("UNBLOCK") ? "rgba(255,193,7,0.4)" : "rgba(76,175,80,0.3)",
              color: "#fff",
            }}>
              {p.pilotICP}
            </span>
          )}
          <span style={{
            fontSize: "10px", padding: "2px 8px", borderRadius: "3px",
            background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
          }}>
            {p.engagement.complexity}
          </span>
          <span style={{
            fontSize: "10px", padding: "2px 8px", borderRadius: "3px",
            background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
          }}>
            {p.engagement.timeToInsight}
          </span>
        </div>
      </div>
      {sectionConfig.map(renderSection)}
    </div>
  );
}

// Build filter option lists from data
const allDomains = [...new Set(processes.map(p => p.domain))].sort();
const allComplexities = ["Simple", "Simple to Moderate", "Moderate", "Moderate to Complex", "Complex"];
const allMiningTypes = [...new Set(processes.map(p => p.engagement.miningType))].sort();

const allPrimarySystems = [...new Set(
  processes.flatMap(p => p.systems.filter(s => s.type === "primary").map(s => {
    // Normalise to short names for filtering
    const name = s.name;
    if (name.includes("SAP")) return "SAP";
    if (name.includes("Oracle")) return "Oracle";
    if (name.includes("Salesforce")) return "Salesforce";
    if (name.includes("ServiceNow")) return "ServiceNow";
    if (name.includes("Workday")) return "Workday";
    if (name.includes("NetSuite")) return "NetSuite";
    if (name.includes("Dynamics")) return "Dynamics 365";
    if (name.includes("HubSpot")) return "HubSpot";
    if (name.includes("Jira")) return "Jira";
    return name;
  }))
)].sort();

const allBuyers = [...new Set(
  processes.flatMap(p => {
    const buyers = [];
    const po = p.buyers.problemOwner;
    const bo = p.buyers.budgetOwner;
    const combined = po + " " + bo;
    if (/CFO/i.test(combined)) buyers.push("CFO");
    if (/COO/i.test(combined)) buyers.push("COO");
    if (/CIO/i.test(combined)) buyers.push("CIO");
    if (/CRO/i.test(combined)) buyers.push("CRO");
    if (/CMO/i.test(combined)) buyers.push("CMO");
    if (/CHRO/i.test(combined)) buyers.push("CHRO");
    if (/Chief Risk|CRO.*risk/i.test(combined)) buyers.push("Chief Risk Officer");
    if (/Chief Compliance|CCO/i.test(combined)) buyers.push("Chief Compliance Officer");
    if (/General Counsel/i.test(combined)) buyers.push("General Counsel");
    if (/VP.*Sales|Sales.*VP/i.test(combined)) buyers.push("VP Sales");
    if (/VP.*Service|Service.*VP/i.test(combined)) buyers.push("VP Service");
    if (/VP.*Supply|Supply.*VP|VP.*Logistics/i.test(combined)) buyers.push("VP Supply Chain");
    if (/VP.*IT|IT.*VP/i.test(combined)) buyers.push("VP IT Ops");
    if (/VP.*HR|HR.*VP/i.test(combined)) buyers.push("VP HR Ops");
    if (/VP.*Procurement|CPO/i.test(combined)) buyers.push("CPO / VP Procurement");
    if (/VP.*Manufacturing|Plant Manager/i.test(combined)) buyers.push("VP Manufacturing");
    if (/VP.*Customer Success/i.test(combined)) buyers.push("VP Customer Success");
    return buyers;
  })
)].sort();

function matchesSystem(process, systemFilter) {
  if (!systemFilter) return true;
  return process.systems.some(s => s.type === "primary" && s.name.includes(systemFilter));
}

function matchesBuyer(process, buyerFilter) {
  if (!buyerFilter) return true;
  const combined = process.buyers.problemOwner + " " + process.buyers.budgetOwner;
  const key = buyerFilter.toLowerCase().replace(/[^a-z]/g, "");
  return combined.toLowerCase().replace(/[^a-z]/g, "").includes(key) ||
    process.buyerPersonas.some(bp => bp.toLowerCase().replace(/[^a-z]/g, "").includes(key));
}

const allSfClouds = [...new Set(processes.map(p => p.sfCloud).filter(Boolean))].sort();
const allICPs = ["UNBLOCK", "HUNT", "PROTECT"];

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    fontSize: "11px", padding: "4px 10px", borderRadius: "14px",
    border: active ? "1px solid #1a3a5c" : "1px solid #d0d0d0",
    background: active ? "#1a3a5c" : "#fff",
    color: active ? "#fff" : "#555",
    cursor: "pointer", whiteSpace: "nowrap", fontWeight: active ? 600 : 400,
    transition: "all 0.15s",
  }}>
    {label}
  </button>
);

const FilterGroup = ({ title, options, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const displayLimit = 6;
  const needsExpand = options.length > displayLimit;
  const visible = expanded ? options : options.slice(0, displayLimit);

  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
        {title}
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {visible.map(opt => (
          <FilterChip
            key={opt}
            label={opt}
            active={selected === opt}
            onClick={() => onSelect(selected === opt ? null : opt)}
          />
        ))}
        {needsExpand && !expanded && (
          <button onClick={() => setExpanded(true)} style={{
            fontSize: "11px", padding: "4px 8px", border: "none", background: "none",
            color: "#1a3a5c", cursor: "pointer", fontWeight: 500,
          }}>
            +{options.length - displayLimit} more
          </button>
        )}
      </div>
    </div>
  );
};

export default function ProcessIntelligenceCards() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState(null);
  const [complexityFilter, setComplexityFilter] = useState(null);
  const [miningFilter, setMiningFilter] = useState(null);
  const [systemFilter, setSystemFilter] = useState(null);
  const [buyerFilter, setBuyerFilter] = useState(null);
  const [sfCloudFilter, setSfCloudFilter] = useState(null);
  const [icpFilter, setIcpFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [domainFilter, complexityFilter, miningFilter, systemFilter, buyerFilter, sfCloudFilter, icpFilter].filter(Boolean).length + (search ? 1 : 0);

  const clearAll = () => {
    setSearch("");
    setDomainFilter(null);
    setComplexityFilter(null);
    setMiningFilter(null);
    setSystemFilter(null);
    setBuyerFilter(null);
    setSfCloudFilter(null);
    setIcpFilter(null);
  };

  const filtered = processes.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      const haystack = [
        p.name, p.domain, p.engagement.complexity,
        ...p.industries, ...p.primarySystems, ...p.buyerPersonas,
        p.process.description, p.piReveals.insight,
        ...p.metrics.headline.map(m => m.name),
        p.buyers.problemOwner, p.buyers.budgetOwner, p.sfCloud || '', p.pilotICP || '', p.buyers.sfLicenseLink || '',
      ].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (domainFilter && p.domain !== domainFilter) return false;
    if (complexityFilter && p.engagement.complexity !== complexityFilter) return false;
    if (miningFilter && p.engagement.miningType !== miningFilter) return false;
    if (systemFilter && !p.systems.some(s => s.type === "primary" && s.name.includes(systemFilter))) return false;
    if (buyerFilter && !matchesBuyer(p, buyerFilter)) return false;
    if (sfCloudFilter && p.sfCloud !== sfCloudFilter) return false;
    if (icpFilter && (!p.pilotICP || !p.pilotICP.includes(icpFilter))) return false;
    return true;
  });

  return (
    <div style={{
      fontFamily: "'Helvetica Neue', -apple-system, sans-serif",
      maxWidth: "700px",
      margin: "0 auto",
      padding: "20px 16px",
    }}>
      <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a3a5c", margin: "0 0 4px" }}>
        ANZ Pilot: Process Intelligence Cards
      </h1>
      <p style={{ fontSize: "13px", color: "#666", margin: "0 0 14px", lineHeight: 1.5 }}>
        {filtered.length} of {processes.length} ANZ Pilot processes{activeFilterCount > 0 ? ` (${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active)` : ""} — tap any card to expand sections.
      </p>

      {/* Search */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search processes, systems, metrics, buyers..."
          style={{
            width: "100%", padding: "9px 12px", fontSize: "13px",
            border: "1px solid #d0d0d0", borderRadius: "8px",
            outline: "none", boxSizing: "border-box",
            background: "#fafafa",
          }}
        />
      </div>

      {/* Filter toggle */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: showFilters ? "12px" : "16px" }}>
        <button onClick={() => setShowFilters(!showFilters)} style={{
          fontSize: "12px", padding: "6px 12px", borderRadius: "6px",
          border: "1px solid #d0d0d0", background: showFilters ? "#f0f4f8" : "#fff",
          cursor: "pointer", fontWeight: 500, color: "#1a3a5c",
        }}>
          {showFilters ? "Hide Filters" : "Filters"}
          {activeFilterCount > 0 && !showFilters && (
            <span style={{
              marginLeft: "6px", fontSize: "10px", background: "#1a3a5c", color: "#fff",
              borderRadius: "8px", padding: "1px 6px", fontWeight: 700,
            }}>{activeFilterCount}</span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} style={{
            fontSize: "12px", padding: "6px 12px", borderRadius: "6px",
            border: "1px solid #e0e0e0", background: "#fff",
            cursor: "pointer", color: "#c62828", fontWeight: 500,
          }}>
            Clear all
          </button>
        )}
      </div>

      {/* Filter panels */}
      {showFilters && (
        <div style={{
          padding: "14px 16px 6px", marginBottom: "16px",
          background: "#fafafa", borderRadius: "10px", border: "1px solid #e8e8e8",
        }}>
          <FilterGroup title="Domain" options={allDomains} selected={domainFilter} onSelect={setDomainFilter} />
          <FilterGroup title="Complexity" options={allComplexities.filter(c => processes.some(p => p.engagement.complexity === c))} selected={complexityFilter} onSelect={setComplexityFilter} />
          <FilterGroup title="Mining Type" options={allMiningTypes} selected={miningFilter} onSelect={setMiningFilter} />
          <FilterGroup title="Primary System" options={allPrimarySystems} selected={systemFilter} onSelect={setSystemFilter} />
          <FilterGroup title="Salesforce Cloud" options={allSfClouds} selected={sfCloudFilter} onSelect={setSfCloudFilter} />
          <FilterGroup title="Pilot ICP" options={allICPs.filter(icp => processes.some(p => p.pilotICP && p.pilotICP.includes(icp)))} selected={icpFilter} onSelect={setIcpFilter} />
          <FilterGroup title="Buyer Persona" options={allBuyers} selected={buyerFilter} onSelect={setBuyerFilter} />
        </div>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "40px 20px", color: "#888", fontSize: "14px",
        }}>
          No processes match your filters. Try removing a filter or broadening your search.
        </div>
      ) : (
        filtered.map(p => <Card key={p.id} process={p} />)
      )}
    </div>
  );
}
