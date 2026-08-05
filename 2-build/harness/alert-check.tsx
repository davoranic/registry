/* Phase-2 validation harness for Alert — same purpose as button-check.tsx/
   spinner-check.tsx: render the generated CSS on the real skeleton and let
   the values be checked against each DS's own reference before moving on.
   Not the final registry page. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Alert, type AlertConfig } from "../skeleton/alert"
import configs from "../out/gen/alert-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, AlertConfig>)[theme]
  const tones = config.tone ?? []
  const emphases = config.emphasis ?? []
  const [tone, setTone] = React.useState<string | undefined>(tones[0])
  const [emphasis, setEmphasis] = React.useState<string | undefined>(emphases[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const isSalt = theme === "salt"
  return (
    <figure className="stage" data-theme={theme} data-mode={mode === "dark" ? "dark" : undefined}
            data-density={isSalt ? density : undefined}>
      <figcaption>
        {theme} · {mode}
        {tones.length > 0 && (
          <span className="cap-control">
            {tones.map((t) => <button key={t} disabled={t === tone} onClick={() => setTone(t)}>{t}</button>)}
          </span>
        )}
        {emphases.length > 0 && (
          <span className="cap-control">
            {emphases.map((e) => <button key={e} disabled={e === emphasis} onClick={() => setEmphasis(e)}>{e}</button>)}
          </span>
        )}
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => <button key={d} disabled={d === density} onClick={() => setDensity(d)}>{d}</button>)}
          </span>
        )}
      </figcaption>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 480 }}>
        <Alert config={config} tone={tone} emphasis={emphasis} title="Update available">
          There has been an update to the terms and conditions.
        </Alert>
        <Alert
          config={config}
          tone={tone}
          emphasis={emphasis}
          title="Unable to process your request"
          actions={<button type="button">Retry</button>}
          onClose={() => {}}
        >
          Please check your connection and try again.
        </Alert>
      </div>
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header><b>Alert — phase 2 validation</b></header>
      <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => <Stage key={t} theme={t} />)}
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
