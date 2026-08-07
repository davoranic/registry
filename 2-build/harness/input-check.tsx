/* Phase-2 validation harness for Input — same purpose as tooltip-check.tsx /
   alert-check.tsx: render the generated CSS on the real skeleton and let the
   values be checked against each DS's own reference before moving on. Not
   the final registry page.

   Every declared axis gets a control here, because ALERT-MATRIX.md finding
   10 was found by clicking one: a config row whose values no CSS
   discriminates renders identically for every value, and the generator
   prints OK regardless. The controls are:
     - mode (all themes)
     - density (Salt only — the only system with the capability)
     - indicator: underline vs box (Salt bordered / M3 filled vs outlined)
     - variant (Salt primary/secondary/tertiary)
     - validation status (Salt 3, shadcn 1, M3 1) + a "none" reset
     - text-align (Salt only)
   plus permanently-rendered disabled and read-only instances, and one
   instance carrying adornments where the system has them. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Input, type InputConfig } from "../skeleton/input"
import configs from "../out/gen/input-config.json"
import panel from "../out/gen/input-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

/* Each system's own name for the two indicator mechanisms, so the toggle
   reads in the vocabulary of the system being checked. Harness labelling
   only — the generated CSS keys off the neutral underline/box values.
   Sourced in docs/INPUT-MATRIX.md's structure.indicator row. */
const INDICATOR_LABEL: Record<string, Record<string, string>> = {
  salt: { underline: "underline (default)", box: "box (bordered)" },
  shadcn: { box: "box" },
  m3: { underline: "underline (filled)", box: "box (outlined)" },
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
      <span style={{ font: "11px/1.4 ui-monospace, monospace", color: "#71717a", width: 92, flex: "0 0 auto" }}>
        {label}
      </span>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>{children}</div>
    </div>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, InputConfig>)[theme]
  const indicators = config.indicator ?? []
  const variants = config.variant ?? []
  const statuses = config.status ?? []
  const alignments = config.textAlign ?? []
  const hasReadOnly = Boolean(config.readOnly)
  const hasAdornments = Boolean(config.startAdornment) || Boolean(config.endAdornment)

  const [indicator, setIndicator] = React.useState<string | undefined>(indicators[0])
  const [variant, setVariant] = React.useState<string | undefined>(variants[0])
  const [status, setStatus] = React.useState<string | undefined>(undefined)
  const [align, setAlign] = React.useState<string | undefined>(alignments[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const isSalt = theme === "salt"

  const shared = { config, indicator, variant, status, textAlign: align }

  return (
    <figure
      className="stage"
      data-theme={theme}
      data-mode={mode === "dark" ? "dark" : undefined}
      data-density={isSalt ? density : undefined}
    >
      <figcaption>
        {theme} · {mode}
        <span className="cap-control">
          <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        </span>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => (
              <button key={d} disabled={d === density} onClick={() => setDensity(d)}>{d}</button>
            ))}
          </span>
        )}
        {indicators.length > 0 && (
          <span className="cap-control">
            {indicators.map((i) => (
              <button key={i} disabled={i === indicator} onClick={() => setIndicator(i)}>
                {INDICATOR_LABEL[theme]?.[i] ?? i}
              </button>
            ))}
          </span>
        )}
        {variants.length > 0 && (
          <span className="cap-control">
            {variants.map((v) => (
              <button key={v} disabled={v === variant} onClick={() => setVariant(v)}>{v}</button>
            ))}
          </span>
        )}
        {statuses.length > 0 && (
          <span className="cap-control">
            <button disabled={status === undefined} onClick={() => setStatus(undefined)}>no status</button>
            {statuses.map((s) => (
              <button key={s} disabled={s === status} onClick={() => setStatus(s)}>{s}</button>
            ))}
          </span>
        )}
        {alignments.length > 0 && (
          <span className="cap-control">
            {alignments.map((a) => (
              <button key={a} disabled={a === align} onClick={() => setAlign(a)}>{a}</button>
            ))}
          </span>
        )}
      </figcaption>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 360 }}>
        <Row label="rest">
          <Input {...shared} defaultValue="Value" />
        </Row>
        <Row label="placeholder">
          <Input {...shared} placeholder="Placeholder" />
        </Row>
        <Row label="disabled">
          <Input {...shared} disabled defaultValue="Value" />
        </Row>
        <Row label={hasReadOnly ? "readOnly" : "readOnly*"}>
          {/* rendered for every system, including the two with no read-only
              STYLE: shadcn's identical rendering is the sourced non-variation
              itself, and M3's is a declared absent token. Marked with * where
              the system declares no read-only capability at all. */}
          <Input {...shared} readOnly defaultValue="Value" />
        </Row>
        <Row label="readOnly empty">
          {/* Salt's emptyReadOnlyMarker: this instance should show "—" in
              Salt and stay blank in the other two. */}
          <Input {...shared} readOnly />
        </Row>
        {hasAdornments && (
          <Row label="adornments">
            <Input {...shared} adornments defaultValue="Value" />
          </Row>
        )}
      </div>
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header><b>Input — phase 2 validation</b></header>
      <div className="body">
        <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => <Stage key={t} theme={t} />)}
        </main>
        <div className="side">
          <ThemeTabs themes={THEMES} active={panelTheme} onChange={setPanelTheme} />
          <ValuePanel theme={panelTheme} panel={panel} />
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
