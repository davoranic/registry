/* Phase-2 validation harness for Button — same purpose as the calendar
   pilot's registry page: render the generated CSS on the real skeleton
   and let the values be checked against each DS's own reference. Not the
   final registry page (that's built once several components exist);
   this is the per-component "generate + validate before moving on" step
   the pipeline requires. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Button, type ButtonConfig } from "../skeleton/button"
import configs from "../out/gen/button-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, ButtonConfig>)[theme]
  const [tone, setTone] = React.useState(config.tone[0])
  const [emphasis, setEmphasis] = React.useState(config.emphasis[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const isSalt = theme === "salt"
  return (
    <figure className="stage" data-theme={theme} data-mode={mode === "dark" ? "dark" : undefined}
            data-density={isSalt ? density : undefined}>
      <figcaption>
        {theme} · {mode}
        <span className="cap-control">
          {config.tone.map((t) => <button key={t} disabled={t === tone} onClick={() => setTone(t)}>{t}</button>)}
        </span>
        <span className="cap-control">
          {config.emphasis.map((e) => <button key={e} disabled={e === emphasis} onClick={() => setEmphasis(e)}>{e}</button>)}
        </span>
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => <button key={d} disabled={d === density} onClick={() => setDensity(d)}>{d}</button>)}
          </span>
        )}
      </figcaption>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Button config={config} tone={tone} emphasis={emphasis}>Submit order</Button>
        <Button config={config} tone={tone} emphasis={emphasis} disabled>Submit order</Button>
        <Button config={config} tone={tone} emphasis={emphasis} loading>Submit order</Button>
        <Button config={config} tone={tone} emphasis={emphasis} icon={<span />}>With icon</Button>
      </div>
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header><b>Button — phase 2 validation</b></header>
      <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => <Stage key={t} theme={t} />)}
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
