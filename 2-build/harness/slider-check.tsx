/* Phase-2 validation harness for Slider — same purpose as
   radio-group-check.tsx/switch-check.tsx: render the generated CSS on the
   real skeleton and let the values be checked against each DS's own
   reference before moving on. Not the final registry page.

   Every declared axis gets a control:
     - mode (all themes)
     - density (Salt only)
     - the VALUE TRANSITION, not just a static mount (CLAUDE.md method
       notes: "test the transition a user performs, not the end state") —
       stage 1 below drives a real keyboard ArrowRight on the native input
       and a programmatic drag-equivalent value set, watching the thumb AND
       fill move, not just two independent static mounts at different values
     - range (single vs two-thumb — every column's own capability list)
     - ticks (Salt/M3 only, shadcn prints an explicit absence)
     - value-readout (tooltip/label/none — forced visible via
       forceShowValue so the geometry can be inspected without simulating a
       real pointer hover)
     - disabled

   FIVE SUB-STAGES PER THEME:
     1. THE VALUE TRANSITION — a live single-thumb slider; ArrowRight moves
        it, and a "jump to 80" button demonstrates a programmatic drag-
        equivalent change.
     2. RANGE — a live two-thumb slider (prop.range).
     3. TICKS — Salt/M3 only; shadcn prints an explicit absence.
     4. VALUE READOUT, FORCED VISIBLE — geometry check target for the
        thumb/value-label pair (RADIO-GROUP-MATRIX.md finding 8's lesson:
        confirm layout, not just that a state toggle changes something).
     5. DISABLED. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Slider } from "../skeleton/slider"
import configs from "../out/gen/slider-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

type SliderConfig = {
  range?: boolean[]
  valueReadout?: string
  ticks?: boolean[]
  disabled?: boolean[]
}

function Legend({ children }: { children: React.ReactNode }) {
  return <div className="checkbox-legend">{children}</div>
}

/* Stage 1 — drives the REAL transition: a keyboard ArrowRight on the native
   input, AND a programmatic "jump to 80" button (the drag-equivalent), both
   watched against the displayed value so the thumb/fill movement is a real
   consequence of user input, not a hand-set prop. */
function TransitionDemo({ config }: { config: SliderConfig }) {
  const [value, setValue] = React.useState(30)
  return (
    <div className="checkbox-row">
      <Slider config={config} value={value} onValueChange={(v) => setValue(v as number)} aria-label="transition" />
      <span className="checkbox-note">value: {value}</span>
      <button onClick={() => setValue(80)}>jump to 80 (drag-equivalent)</button>
      <span className="checkbox-note">↑ or focus the thumb and press ArrowRight for a real keyboard transition</span>
    </div>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, SliderConfig>)[theme]
  const hasTicks = Array.isArray(config.ticks) && config.ticks.includes(true)
  const isSalt = theme === "salt"

  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")

  return (
    <figure
      className="stage"
      data-theme={theme}
      data-mode={mode === "dark" ? "dark" : undefined}
      data-density={isSalt ? density : undefined}
    >
      <figcaption>
        {theme} · {mode}
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => (
              <button key={d} disabled={d === density} onClick={() => setDensity(d)}>
                {d}
              </button>
            ))}
          </span>
        )}
      </figcaption>

      {/* 1 — the VALUE TRANSITION, not just static mounts */}
      <div className="checkbox-block">
        <div className="checkbox-caption">1 · value transition (behavior.keyboard-value-change / behavior.pointer-drag)</div>
        <TransitionDemo config={config} />
      </div>

      {/* 2 — range (prop.range) */}
      <div className="checkbox-block">
        <div className="checkbox-caption">2 · range (prop.range) — {config.range?.join(", ")}</div>
        <div className="checkbox-row">
          <Slider config={config} range defaultValue={[20, 60]} aria-label="range" />
        </div>
      </div>

      {/* 3 — ticks */}
      <div className="checkbox-block">
        <div className="checkbox-caption">3 · ticks (structure.ticks)</div>
        {hasTicks ? (
          <Slider config={config} defaultValue={40} showTicks step={10} aria-label="ticks" />
        ) : (
          <Legend>CONFIRMED ABSENCE — no tick-mark capability of any kind in the canonical shadcn slider.tsx (see structure.ticks).</Legend>
        )}
      </div>

      {/* 4 — value readout, FORCED VISIBLE (a geometry check target, not just a state toggle) */}
      <div className="checkbox-block">
        <div className="checkbox-caption">4 · value readout, forced visible (structure.value-readout={String(config.valueReadout)})</div>
        {config.valueReadout !== "none" ? (
          <Slider config={config} defaultValue={65} forceShowValue aria-label="readout" />
        ) : (
          <Legend>CONFIRMED ABSENCE — no value-display element renders at all (see structure.value-readout).</Legend>
        )}
      </div>

      {/* 5 — disabled */}
      <div className="checkbox-block">
        <div className="checkbox-caption">5 · disabled (prop.disabled)</div>
        <div className="checkbox-row">
          <Slider config={config} defaultValue={45} disabled aria-label="disabled" />
        </div>
      </div>
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header>
        <b>Slider — phase 2 validation</b>
      </header>
      <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => (
          <Stage key={t} theme={t} />
        ))}
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
