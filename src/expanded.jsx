// ============================================================
// GoWide — expanded views (sections / spread / story / tabs)
// ============================================================

const { useState: useStateExp } = React;

// ────────────────────────────────────────────────────────────
// SECTIONS — collapsible accordion (default).
// ────────────────────────────────────────────────────────────
function ExpandedSections({ p }) {
  const [open, setOpen] = useStateExp({});

  const tintFor = (accent, isOpen) => {
    if (isOpen) return `linear-gradient(135deg, color-mix(in srgb, ${accent} 6%, #fff) 0%, #fff 65%)`;
    return "#fff";
  };

  return (
    <div style={{
      padding: "20px 28px 28px",
      background: "var(--paper-warm)",
      borderTop: "1px solid var(--rule)",
      animation: "gw-fade-up 0.32s ease both",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SECTIONS.map((s) => {
          const isOpen = !!open[s.id];
          return (
            <div key={s.id} style={{
              border: "1px solid",
              borderColor: isOpen
                ? `color-mix(in srgb, ${s.accent} 35%, var(--rule))`
                : "var(--rule)",
              borderRadius: 12,
              background: tintFor(s.accent, isOpen),
              overflow: "hidden",
              transition: "border-color 0.18s, box-shadow 0.18s",
              boxShadow: isOpen
                ? `0 1px 2px rgba(14,14,16,0.04), 0 12px 28px -16px color-mix(in srgb, ${s.accent} 35%, transparent)`
                : "0 1px 1px rgba(14,14,16,0.02)",
            }}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: "inherit",
                }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 30, height: 30, borderRadius: 6,
                  background: isOpen ? s.accent : `color-mix(in srgb, ${s.accent} 12%, #fff)`,
                  color: isOpen ? "#fff" : s.accent,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0,
                  transition: "background 0.18s, color 0.18s",
                  fontFeatureSettings: "'tnum'",
                  border: isOpen ? "none" : `1px solid color-mix(in srgb, ${s.accent} 20%, transparent)`,
                }}>{String(s.num).padStart(2, "0")}</span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15.5,
                  fontWeight: 600,
                  color: "var(--ink)",
                  letterSpacing: "-0.012em",
                }}>{s.label}</span>
                <span style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: isOpen ? "var(--gw-orange)" : "transparent",
                  color: isOpen ? "#fff" : "var(--muted)",
                  border: isOpen ? "none" : "1px solid var(--rule)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.22s ease, background 0.18s, color 0.18s",
                }}>▼</span>
              </button>
              {isOpen && (
                <div style={{
                  padding: "0 20px 20px 20px",
                  borderTop: `1px solid color-mix(in srgb, ${s.accent} 12%, var(--rule))`,
                  background: "rgba(255,255,255,0.6)",
                  animation: "gw-fade-up 0.22s ease both",
                }}>
                  <div style={{ paddingTop: 18 }}>
                    {s.render(p)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SPREAD — magazine-style multi-column, everything inline
// ────────────────────────────────────────────────────────────
function ExpandedSpread({ p }) {
  const cc = COMPLEXITY_COLORS[p.engagement.complexity] || SHARED_GRAY;
  return (
    <div style={{
      padding: "28px 32px 36px",
      background: "var(--paper-warm)",
      borderTop: "1px solid var(--rule)",
      animation: "gw-fade-up 0.32s ease both",
    }}>
      {/* Hero band */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 32,
        paddingBottom: 24,
        borderBottom: "1px solid var(--rule)",
        marginBottom: 24,
      }}>
        <div>
          <Eyebrow color={SECTION_ACCENTS.process} num={1}>How the process flows</Eyebrow>
          <p style={{
            margin: "12px 0 0",
            fontSize: 18,
            lineHeight: 1.55,
            color: "var(--ink)",
            fontWeight: 400,
            textWrap: "pretty",
            maxWidth: 640,
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.012em",
          }}>
            {p.process.description}
          </p>
        </div>
        <div style={{ display: "grid", gap: 10, alignSelf: "start" }}>
          <StatTile label="Complexity" value={p.engagement.complexity} color={cc} />
          <StatTile label="Time to first insight" value={p.engagement.timeToInsight} mono />
          <StatTile label="Mining approach" value={p.engagement.miningType} />
        </div>
      </div>

      {/* Happy path + failure variants (full width) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          padding: "16px 20px",
          background: "#fff",
          borderRadius: 10,
          border: "1px solid var(--rule)",
          borderLeft: `3px solid ${SECTION_ACCENTS.process}`,
          marginBottom: 18,
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            color: SECTION_ACCENTS.process, textTransform: "uppercase", letterSpacing: "0.14em",
            marginBottom: 6, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontFamily: "var(--font-mono)", letterSpacing: 0, fontSize: 14 }}>→</span>
            Happy path
          </div>
          <div style={{ fontSize: 14.5, color: "var(--ink)", lineHeight: 1.6 }}>
            {p.process.happyPath}
          </div>
        </div>

        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
          color: "var(--c-marketing)", textTransform: "uppercase", letterSpacing: "0.14em",
          marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: 0, fontSize: 14 }}>✕</span>
          Where it breaks · {p.process.failureVariants.length} common variants
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(p.process.failureVariants.length, 3)}, 1fr)`,
          gap: 12,
        }}>
          {p.process.failureVariants.map((v, i) => (
            <div key={i} style={{
              padding: "14px 16px",
              background: "#fff",
              border: "1px solid var(--rule)",
              borderRadius: 10,
              borderTop: "2px solid var(--c-marketing)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-marketing)",
                  fontWeight: 600, letterSpacing: 0,
                }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{v.name}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PI + spec sheet 2-col */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 32,
        marginBottom: 28,
      }}>
        <div>
          <Eyebrow color={SECTION_ACCENTS.piReveals} num={4}>What PI reveals</Eyebrow>
          <div style={{ marginTop: 14 }}>
            <PIRevealsBlock p={p} accent={SECTION_ACCENTS.piReveals} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Eyebrow color={SECTION_ACCENTS.systems} num={2}>Where the data lives</Eyebrow>
            <div style={{ marginTop: 12 }}><SystemsBlock p={p} /></div>
          </div>
          <div>
            <Eyebrow color={SECTION_ACCENTS.metrics} num={3}>Key metrics</Eyebrow>
            <div style={{ marginTop: 12 }}><MetricsBlock p={p} expandable /></div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <Eyebrow color={SECTION_ACCENTS.engagement} num={5}>Engagement profile</Eyebrow>
        <div style={{ marginTop: 14 }}><EngagementBlock p={p} /></div>
      </div>

      <div>
        <Eyebrow color={SECTION_ACCENTS.buyers} num={6}>Who buys & how to pitch</Eyebrow>
        <div style={{ marginTop: 14 }}><BuyersBlock p={p} /></div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// STORY — editorial single-column, strong typographic hierarchy
// ────────────────────────────────────────────────────────────
function ExpandedStory({ p }) {
  return (
    <div style={{
      padding: "36px 32px 40px",
      background: "var(--paper-warm)",
      borderTop: "1px solid var(--rule)",
      animation: "gw-fade-up 0.32s ease both",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Eyebrow color={SECTION_ACCENTS.process} num={1}>How the process flows</Eyebrow>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          lineHeight: 1.35,
          color: "var(--ink)",
          margin: "16px 0 26px",
          fontWeight: 400,
          letterSpacing: "-0.018em",
          textWrap: "pretty",
        }}>
          {p.process.description}
        </p>

        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8,
          marginBottom: 30, paddingBottom: 24,
          borderBottom: "1px solid var(--rule)",
        }}>
          <ComplexityChip complexity={p.engagement.complexity} />
          <MonoChip>{p.engagement.timeToInsight}</MonoChip>
          <Chip color={SHARED_SERVICE}>{p.engagement.miningType}</Chip>
        </div>

        <div style={{ marginBottom: 30 }}>
          <h3 style={{
            fontSize: 19, marginBottom: 12,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 14,
              color: SECTION_ACCENTS.process, fontWeight: 600,
            }}>→</span>
            The happy path
          </h3>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--body)", margin: 0 }}>
            {p.process.happyPath}
          </p>
        </div>

        <div style={{ marginBottom: 34 }}>
          <h3 style={{ fontSize: 19, marginBottom: 18 }}>Where it breaks</h3>
          <div style={{ display: "grid", gap: 18 }}>
            {p.process.failureVariants.map((v, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "auto 1fr",
                gap: 20, alignItems: "baseline",
              }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30,
                  color: "var(--c-marketing)",
                  letterSpacing: "-0.03em", lineHeight: 1,
                  width: 56, textAlign: "right",
                  fontFeatureSettings: "'tnum'",
                }}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{v.name}</div>
                  <div style={{ fontSize: 14.5, color: "var(--body)", lineHeight: 1.65 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 34 }}>
          <Eyebrow color={SECTION_ACCENTS.piReveals} num={4}>What PI reveals</Eyebrow>
          <div style={{ marginTop: 16 }}>
            <PIRevealsBlock p={p} accent={SECTION_ACCENTS.piReveals} />
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <Eyebrow color={SECTION_ACCENTS.systems} num={2}>Where the data lives</Eyebrow>
          <div style={{ marginTop: 14 }}><SystemsBlock p={p} /></div>
        </div>
        <div style={{ marginBottom: 30 }}>
          <Eyebrow color={SECTION_ACCENTS.metrics} num={3}>Key metrics</Eyebrow>
          <div style={{ marginTop: 14 }}><MetricsBlock p={p} expandable /></div>
        </div>
        <div style={{ marginBottom: 30 }}>
          <Eyebrow color={SECTION_ACCENTS.engagement} num={5}>Engagement profile</Eyebrow>
          <div style={{ marginTop: 14 }}><EngagementBlock p={p} /></div>
        </div>
        <div>
          <Eyebrow color={SECTION_ACCENTS.buyers} num={6}>Who buys & how to pitch</Eyebrow>
          <div style={{ marginTop: 14 }}><BuyersBlock p={p} /></div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TABS — dossier with one section at a time
// ────────────────────────────────────────────────────────────
function ExpandedTabs({ p }) {
  const [active, setActive] = useStateExp(SECTIONS[0].id);
  const section = SECTIONS.find(s => s.id === active) || SECTIONS[0];

  return (
    <div style={{
      borderTop: "1px solid var(--rule)",
      background: "var(--paper-warm)",
      animation: "gw-fade-up 0.32s ease both",
    }}>
      <div style={{
        display: "flex", gap: 0,
        padding: "0 24px",
        borderBottom: "1px solid var(--rule)",
        background: "#fff",
        overflowX: "auto",
      }}>
        {SECTIONS.map(s => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                padding: "14px 16px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? s.accent : "var(--muted)",
                letterSpacing: "-0.005em",
                position: "relative",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                opacity: isActive ? 0.85 : 0.5,
                letterSpacing: 0,
              }}>{String(s.num).padStart(2, "0")}</span>
              {s.label}
              {isActive && (
                <span style={{
                  position: "absolute",
                  left: 12, right: 12, bottom: -1,
                  height: 2, background: s.accent, borderRadius: 2,
                }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "28px 32px 36px", minHeight: 320 }}>
        <div key={active} style={{ animation: "gw-fade-up 0.22s ease both" }}>
          <Eyebrow color={section.accent} num={section.num}>{section.label}</Eyebrow>
          <div style={{ marginTop: 18, maxWidth: 980 }}>
            {section.render(p)}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ExpandedSections, ExpandedSpread, ExpandedStory, ExpandedTabs });
