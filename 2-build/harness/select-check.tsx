/* Phase-2 validation harness for Select — same purpose as input-check.tsx /
   tooltip-check.tsx: render the generated CSS on the real skeleton and let
   the values be checked against each DS's own reference before moving on.
   Not the final registry page.

   Every declared axis gets a control here, because ALERT-MATRIX.md finding
   10 was found by clicking one: a config row whose values no CSS
   discriminates renders identically for every value, and the generator
   prints OK regardless. The controls are:
     - mode (all themes)
     - density (Salt only — the only system with the capability)
     - indicator: underline vs box (Salt bordered / M3 filled vs outlined)
     - size (shadcn only — its select has a size prop its input does not)
     - variant (Salt primary/secondary/tertiary)
     - validation status (Salt 3, shadcn 1, M3 1) + a "none" reset
     - FORCE OPEN, so every option state (rest / hover / active / selected /
       disabled) and the whole popup surface are visible without having to
       hold a click. The forced-open instance also carries a selected option
       and a disabled option permanently.
   plus permanently-rendered disabled and read-only trigger instances and
   one instance carrying a start adornment where the system has the slot. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Select, type SelectConfig, type SelectGroupModel, type SelectOptionModel } from "../skeleton/select"
import configs from "../out/gen/select-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

/* Each system's own name for the two indicator mechanisms, so the toggle
   reads in the vocabulary of the system being checked. Harness labelling
   only — the generated CSS keys off the neutral underline/box values.
   Sourced in docs/SELECT-MATRIX.md's structure.indicator row. */
const INDICATOR_LABEL: Record<string, Record<string, string>> = {
  salt: { underline: "underline (default)", box: "box (bordered)" },
  shadcn: { box: "box" },
  m3: { underline: "underline (filled)", box: "box (outlined)" },
}

const OPTIONS: SelectOptionModel[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry", disabled: true },
  { value: "grapes", label: "Grapes" },
  { value: "pineapple", label: "Pineapple" },
]

const GROUPS: SelectGroupModel[] = [
  {
    label: "Fruits",
    options: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "blueberry", label: "Blueberry", disabled: true },
    ],
  },
  {
    label: "Vegetables",
    options: [
      { value: "carrot", label: "Carrot" },
      { value: "leek", label: "Leek" },
    ],
  },
]

function Row({ label, children, reserve }: { label: string; children: React.ReactNode; reserve?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, width: "100%" }}>
      <span style={{ font: "11px/1.4 ui-monospace, monospace", color: "#71717a", width: 104, flex: "0 0 auto", paddingTop: 6 }}>
        {label}
      </span>
      <div style={{ flex: "1 1 auto", minWidth: 0, paddingBottom: reserve ?? 0 }}>{children}</div>
    </div>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, SelectConfig>)[theme]
  const indicators = config.indicator ?? []
  const sizes = config.size ?? []
  const variants = config.variant ?? []
  const statuses = config.status ?? []
  const hasReadOnly = Boolean(config.readOnly)
  const hasAdornment = Boolean(config.startAdornment)

  const [indicator, setIndicator] = React.useState<string | undefined>(indicators[0])
  const [size, setSize] = React.useState<string | undefined>(sizes[0])
  const [variant, setVariant] = React.useState<string | undefined>(variants[0])
  const [status, setStatus] = React.useState<string | undefined>(undefined)
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [forceOpen, setForceOpen] = React.useState(true)
  const isSalt = theme === "salt"

  const shared = { config, indicator, size, variant, status }

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
        {sizes.length > 0 && (
          <span className="cap-control">
            {sizes.map((s) => (
              <button key={s} disabled={s === size} onClick={() => setSize(s)}>{s}</button>
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
        <span className="cap-control">
          <button disabled={forceOpen} onClick={() => setForceOpen(true)}>force open</button>
          <button disabled={!forceOpen} onClick={() => setForceOpen(false)}>closed</button>
        </span>
      </figcaption>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 380 }}>
        <Row label="placeholder">
          <Select {...shared} id={`${theme}-placeholder`} options={OPTIONS} placeholder="Select a fruit" />
        </Row>
        <Row label="value">
          <Select {...shared} id={`${theme}-value`} options={OPTIONS} defaultValue="banana" />
        </Row>
        <Row label="disabled">
          <Select {...shared} id={`${theme}-disabled`} options={OPTIONS} defaultValue="banana" disabled />
        </Row>
        <Row label={hasReadOnly ? "readOnly" : "readOnly*"}>
          {/* rendered for every system, including the two with no read-only
              concept at all: shadcn's Select has no readOnly prop and M3 has
              no read-only token, so those two render identically to rest BY
              DESIGN. Marked with * where the system declares no capability. */}
          <Select {...shared} id={`${theme}-readonly`} options={OPTIONS} defaultValue="banana" readOnly />
        </Row>
        <Row label="readOnly empty">
          {/* Salt's emptyReadOnlyMarker: this instance should show "—" in
              Salt and stay blank in the other two. */}
          <Select {...shared} id={`${theme}-readonly-empty`} options={OPTIONS} readOnly />
        </Row>
        {hasAdornment && (
          <Row label="adornment">
            <Select {...shared} id={`${theme}-adornment`} options={OPTIONS} defaultValue="banana" adornments />
          </Row>
        )}
        {/* Label says PINNED so this row is not mistaken for a stuck popup:
            it ignores every dismiss path on purpose, and the stage's
            "force open" / "closed" buttons above are what release it. */}
        <Row label={forceOpen ? "PINNED OPEN · grouped" : "grouped"} reserve={forceOpen ? 340 : 0}>
          {/* the forced-open instance: a selected option (Banana), a disabled
              option (Blueberry), two groups and — where the system has them —
              a group label and a separator, all visible at once. */}
          <Select {...shared} id={`${theme}-open`} groups={GROUPS} defaultValue="banana" forceOpen={forceOpen} />
        </Row>
      </div>
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header><b>Select — phase 2 validation</b></header>
      <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => <Stage key={t} theme={t} />)}
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
