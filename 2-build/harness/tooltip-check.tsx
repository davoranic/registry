/* Phase-2 validation harness for Tooltip — same purpose as button-check.tsx
   and spinner-check.tsx: render the generated CSS on the real skeleton and
   let the values be checked against each DS's own reference before moving
   to the next component. Not the final registry page.

   The trigger is a plain focusable element (a styled span acting as a
   button) — hover OR Tab-focus opens the tooltip, matching the real
   trigger-events row (behavior.trigger-events) in every source system. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Tooltip, type TooltipConfig } from "../skeleton/tooltip"
import configs from "../out/gen/tooltip-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, TooltipConfig>)[theme]
  const placements = config.placement ?? []
  const statuses = config.status ?? []
  const [placement, setPlacement] = React.useState(placements[0])
  const [status, setStatus] = React.useState<string | undefined>(undefined)
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const isSalt = theme === "salt"
  return (
    <figure className="stage" data-theme={theme} data-mode={mode === "dark" ? "dark" : undefined}
            data-density={isSalt ? density : undefined}>
      <figcaption>
        {theme} · {mode}
        {placements.length > 0 && (
          <span className="cap-control">
            {placements.map((p) => <button key={p} disabled={p === placement} onClick={() => setPlacement(p)}>{p}</button>)}
          </span>
        )}
        {statuses.length > 0 && (
          <span className="cap-control">
            <button disabled={status === undefined} onClick={() => setStatus(undefined)}>none</button>
            {statuses.map((s) => <button key={s} disabled={s === status} onClick={() => setStatus(s)}>{s}</button>)}
          </span>
        )}
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => <button key={d} disabled={d === density} onClick={() => setDensity(d)}>{d}</button>)}
          </span>
        )}
      </figcaption>
      <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", padding: "48px 64px" }}>
        <Tooltip config={config} content="Tooltip content" placement={placement} status={status}>
          <span tabIndex={0} style={{ display: "inline-block", padding: "6px 12px", border: "1px solid #a1a1aa", borderRadius: 4, cursor: "default", font: "12px system-ui" }}>
            Hover or focus me
          </span>
        </Tooltip>
      </div>
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header><b>Tooltip — phase 2 validation</b></header>
      <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => <Stage key={t} theme={t} />)}
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
