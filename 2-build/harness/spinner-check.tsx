/* Phase-2 validation harness for Spinner — same purpose as button-check.tsx:
   render the generated CSS on the real skeleton and let the values be
   checked against each DS's own reference before moving to the next
   component. Not the final registry page. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Spinner, type SpinnerConfig } from "../skeleton/spinner"
import configs from "../out/gen/spinner-config.json"
import panel from "../out/gen/spinner-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, SpinnerConfig>)[theme]
  const sizes = config.size ?? []
  const [size, setSize] = React.useState<string | undefined>(sizes[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const isSalt = theme === "salt"
  return (
    <figure className="stage" data-theme={theme} data-mode={mode === "dark" ? "dark" : undefined}
            data-density={isSalt ? density : undefined}>
      <figcaption>
        {theme} · {mode}
        {sizes.length > 0 && (
          <span className="cap-control">
            {sizes.map((s) => <button key={s} disabled={s === size} onClick={() => setSize(s)}>{s}</button>)}
          </span>
        )}
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => <button key={d} disabled={d === density} onClick={() => setDensity(d)}>{d}</button>)}
          </span>
        )}
      </figcaption>
      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        <Spinner config={config} size={size} />
        <span title="text-color context, to check currentColor inheritance" style={{ color: "crimson" }}>
          <Spinner config={config} size={size} />
        </span>
      </div>
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header><b>Spinner — phase 2 validation</b></header>
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
