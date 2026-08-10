/* Phase-2 validation harness for Toast/ToastGroup — same purpose as
   slider-check.tsx/radio-group-check.tsx: render the generated CSS on the
   real skeleton and let the values be checked against each DS's own
   reference before moving on. Not the final registry page.

   FOUR SUB-STAGES PER THEME, each targeting a specific rule from the build
   prompt:
     1. STACKING + THE REAL DISMISS TRANSITION — a live ToastGroup with an
        "add toast" button (a short, fast duration for demoing auto-dismiss)
        and each toast's own close button; multiple toasts visibly stack,
        non-overlapping, newest last (behavior.stacking-order), and BOTH a
        manual close and a real auto-dismiss timer actually remove a toast
        from the DOM (behavior.dismiss / behavior.auto-dismiss / rule 10:
        test the transition, not the end state).
     2. TYPES — one toast per config.type value, static (structure.icon /
        prop.type / style.item.type@*).
     3. PARTS — description / action / close, forced on where the column's
        own config allows it (structure.description/.action/.close).
     4. POSITION — buttons that move the SAME live group across every
        config.position value (prop.position's real skeleton branch). */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Toast, ToastGroup, DEFAULT_AUTO_DISMISS_MS } from "../skeleton/toast"
import configs from "../out/gen/toast-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

type ToastCfg = {
  icon?: boolean
  description?: boolean
  action?: boolean
  close?: boolean
  role?: string
  type?: string[]
  position?: string[]
}

let nextId = 1
type Entry = { id: number; type?: string; message: string; duration?: number }

function StackingDemo({ config }: { config: ToastCfg }) {
  const [entries, setEntries] = React.useState<Entry[]>([])

  function add(duration?: number) {
    const id = nextId++
    setEntries((cur) => [...cur, { id, type: config.type?.[0], message: `Toast #${id}`, duration }])
  }
  function remove(id: number) {
    setEntries((cur) => cur.filter((e) => e.id !== id))
  }

  return (
    <div className="checkbox-block">
      <div className="checkbox-caption">
        1 · stacking + dismiss transition (behavior.stacking-order / behavior.dismiss / behavior.auto-dismiss)
      </div>
      <div className="checkbox-row">
        <button onClick={() => add(undefined)}>add persistent toast</button>
        <button onClick={() => add(1200)}>add auto-dismiss (1.2s) toast</button>
        <span className="checkbox-note">registry default duration: {DEFAULT_AUTO_DISMISS_MS}ms — 1.2s used here for fast demoing</span>
      </div>
      <ToastGroup config={config} position={config.position?.[0]} className="demo-group">
        {entries.map((e) => (
          <Toast
            key={e.id}
            config={config}
            type={e.type}
            message={e.message}
            description={config.description ? "A supporting detail line." : undefined}
            actionLabel={config.action ? "Undo" : undefined}
            onAction={() => console.log("action", e.id)}
            duration={e.duration}
            onClose={() => remove(e.id)}
          />
        ))}
      </ToastGroup>
    </div>
  )
}

function TypesDemo({ config }: { config: ToastCfg }) {
  const types = config.type ?? [undefined as unknown as string]
  return (
    <div className="checkbox-block">
      <div className="checkbox-caption">2 · types (prop.type / structure.icon / style.item.type@*) — {types.join(", ") || "none"}</div>
      <div className="checkbox-row" style={{ flexDirection: "column", alignItems: "stretch", position: "static" }}>
        {types.map((t) => (
          <Toast key={String(t)} config={config} type={t} message={`type: ${t ?? "(none)"}`} className="static-item" />
        ))}
      </div>
    </div>
  )
}

function PartsDemo({ config }: { config: ToastCfg }) {
  return (
    <div className="checkbox-block">
      <div className="checkbox-caption">3 · parts (structure.description / structure.action / structure.close)</div>
      <div className="checkbox-row" style={{ position: "static" }}>
        <Toast
          config={config}
          message="Event has been created"
          description={config.description ? "Sunday, December 03, 2023 at 9:00 AM" : undefined}
          actionLabel={config.action ? "Undo" : undefined}
          onAction={() => {}}
          onClose={() => {}}
          className="static-item"
        />
      </div>
      {!config.description && <div className="checkbox-legend">CONFIRMED ABSENCE — structure.description is off for this column.</div>}
      {!config.action && <div className="checkbox-legend">CONFIRMED ABSENCE — structure.action is off for this column.</div>}
      {!config.close && <div className="checkbox-legend">CONFIRMED ABSENCE — structure.close is off for this column.</div>}
    </div>
  )
}

function PositionDemo({ config }: { config: ToastCfg }) {
  const positions = config.position ?? []
  const [pos, setPos] = React.useState<string | undefined>(positions[0])
  return (
    <div className="checkbox-block">
      <div className="checkbox-caption">4 · position (prop.position) — {positions.join(", ") || "off (single implied default)"}</div>
      {positions.length ? (
        <div className="cap-control">
          {positions.map((p) => (
            <button key={p} disabled={p === pos} onClick={() => setPos(p)}>
              {p}
            </button>
          ))}
        </div>
      ) : (
        <div className="checkbox-legend">CONFIRMED ABSENCE — prop.position is off for this column; one implied default corner only.</div>
      )}
      <div style={{ position: "relative", height: 160, border: "1px dashed #d4d4d8", marginTop: 8 }}>
        <ToastGroup config={config} position={pos} className="demo-group position-demo">
          <Toast config={config} message="positioned toast" className="static-item" />
        </ToastGroup>
      </div>
    </div>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, ToastCfg>)[theme]
  const isSalt = theme === "salt"
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")

  return (
    <figure className="stage" data-theme={theme} data-mode={mode === "dark" ? "dark" : undefined} data-density={isSalt ? density : undefined}>
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
      <StackingDemo config={config} />
      <TypesDemo config={config} />
      <PartsDemo config={config} />
      <PositionDemo config={config} />
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header>
        <b>Toast/Snackbar — phase 2 validation</b>
      </header>
      <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => (
          <Stage key={t} theme={t} />
        ))}
      </main>
      <style>{`
        .demo-group { position: static !important; display: flex; flex-direction: column; }
        .position-demo { position: absolute !important; }
        .static-item { position: static !important; }
      `}</style>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
