/* Registry page: calendar in three themes, right panel exposing all six
   template sections from the generated panel data. Every switchable row —
   config-channel (skeleton structure/behavior) and css-channel (generated
   style rules) — is a live control here, independent per theme. Capability
   controls (density, accent) live under their theme's tab, same as any
   other switchable row. Only the stages are themed; chrome stays neutral. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Calendar, type CalendarConfig } from "../skeleton/calendar"
import configs from "../out/gen/calendar-config.json"
import panel from "../out/gen/calendar-panel.json"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]
type Caps = Record<Theme, { density?: string; accent?: string }>
type ConfigOverrides = Record<Theme, Record<string, unknown>>
type OffSets = Record<Theme, Set<string>>
const PIECES: Array<[string, string]> = [
  ["structure", "Anatomy"], ["behavior", "Behavior"], ["prop", "Props"],
  ["slot", "Slots"], ["state", "States"], ["style", "Styles"],
]

function Stage({ theme, mode, caps, configOverrides, offSets }:
  { theme: Theme; mode: string; caps: Caps; configOverrides: ConfigOverrides; offSets: OffSets }) {
  const base = (configs as Record<string, CalendarConfig>)[theme]
  const config = { ...base, ...configOverrides[theme] } as CalendarConfig
  const selected = new Date(2026, 7, 12)
  const range = config.range ? { from: new Date(2026, 7, 18), to: new Date(2026, 7, 22) } : null
  const offTokens = [...offSets[theme]].join(" ")
  return (
    <figure className="stage" data-theme={theme} data-mode={mode === "dark" ? "dark" : undefined}
            data-density={base.densities ? caps[theme].density : undefined}
            data-accent={(base as any).accents && caps[theme].accent !== (base as any).accents[0] ? caps[theme].accent : undefined}
            data-off={offTokens || undefined}>
      <figcaption>{theme} · {mode}
        {base.densities ? ` · ${caps[theme].density}` : ""}
        {(base as any).accents ? ` · ${caps[theme].accent}` : ""}</figcaption>
      <Calendar config={config} defaultMonth={selected} selected={selected}
                selectedRange={range} aria-label={`${theme} calendar`} />
    </figure>
  )
}

function CapControl({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <span className="cap-control">
      {options.map((o) => (
        <button key={o} disabled={o === value} onClick={() => onChange(o)}>{o}</button>
      ))}
    </span>
  )
}

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle" data-disabled={disabled || undefined}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>{disabled ? "no value in this theme" : checked ? "on" : "off"}</span>
    </label>
  )
}

function Panel({ theme, caps, setCaps, configOverrides, setConfigOverrides, offSets, setOffSets }: {
  theme: Theme; caps: Caps; setCaps: (c: Caps) => void
  configOverrides: ConfigOverrides; setConfigOverrides: (c: ConfigOverrides) => void
  offSets: OffSets; setOffSets: (o: OffSets) => void
}) {
  const config = (configs as Record<string, any>)[theme]
  const off = offSets[theme]
  const toggleCss = (token: string, on: boolean) => {
    const next = new Set(off)
    if (on) next.delete(token); else next.add(token)
    setOffSets({ ...offSets, [theme]: next })
  }
  const setConfigParam = (param: string, v: unknown) =>
    setConfigOverrides({ ...configOverrides, [theme]: { ...configOverrides[theme], [param]: v } })

  return (
    <aside className="panel">
      {PIECES.map(([piece, title]) => {
        const rows = (panel as any).rows.filter((r: any) => r.piece === piece)
        if (!rows.length) return null
        return (
          <section key={piece}>
            <h2>{title}</h2>
            {piece === "behavior" && <p className="pattern">{(panel as any).behavior.pattern}</p>}
            {rows.map((r: any) => {
              const cell = r.cells?.[theme] ?? { display: "template-owned" }
              const isDensity = r.id === "prop.density" && config.densities
              const isAccent = r.id === "prop.accent" && config.accents
              const toggle = cell.toggle
              const notApplicable = cell.kind === "off"
              return (
                <div className="row" key={r.id} data-kind={cell.kind}>
                  <div className="row-head">
                    <code>{r.id.replace(/^[a-z]+\./, "")}</code>
                    <span className="policy" data-policy={notApplicable ? "not-applicable" : r.policy}>
                      {notApplicable ? "not applicable" : r.policy}
                    </span>
                  </div>
                  {notApplicable ? null : isDensity ? (
                    <CapControl options={config.densities} value={caps[theme].density}
                                onChange={(v) => setCaps({ ...caps, [theme]: { ...caps[theme], density: v } })} />
                  ) : isAccent ? (
                    <CapControl options={config.accents} value={caps[theme].accent}
                                onChange={(v) => setCaps({ ...caps, [theme]: { ...caps[theme], accent: v } })} />
                  ) : toggle?.kind === "css" ? (
                    <Toggle checked={!off.has(toggle.token)} onChange={(v) => toggleCss(toggle.token, v)} />
                  ) : toggle?.kind === "config" ? (
                    <Toggle checked={Boolean(configOverrides[theme][toggle.param] ?? cell.display === "true")}
                            onChange={(v) => setConfigParam(toggle.param, v)} />
                  ) : (
                    <div className="cell">{cell.display}</div>
                  )}
                  {(cell.source || cell.note || r.note) && (
                    <div className="src">{cell.source ?? cell.note ?? r.note}</div>
                  )}
                </div>
              )
            })}
          </section>
        )
      })}
    </aside>
  )
}

function App() {
  const [mode, setMode] = React.useState("light")
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  const [caps, setCaps] = React.useState<Caps>({
    salt: { density: "medium", accent: "blue" }, shadcn: {}, m3: {},
  })
  const [configOverrides, setConfigOverrides] = React.useState<ConfigOverrides>({ salt: {}, shadcn: {}, m3: {} })
  const [offSets, setOffSets] = React.useState<OffSets>({ salt: new Set(), shadcn: new Set(), m3: new Set() })
  React.useEffect(() => { document.body.classList.toggle("dark", mode === "dark") }, [mode])
  return (
    <div className="shell">
      <header>
        <b>UI Registry</b> <span className="dim">calendar · generated from the template matrix</span>
        <span className="spacer" />
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode: {mode}</button>
      </header>
      <div className="body">
        <main>
          {THEMES.map((t) => (
            <Stage key={t} theme={t} mode={mode} caps={caps} configOverrides={configOverrides} offSets={offSets} />
          ))}
        </main>
        <div className="side">
          <nav className="tabs">
            {THEMES.map((t) => (
              <button key={t} data-active={t === panelTheme || undefined} onClick={() => setPanelTheme(t)}>{t}</button>
            ))}
          </nav>
          <Panel theme={panelTheme} caps={caps} setCaps={setCaps}
                 configOverrides={configOverrides} setConfigOverrides={setConfigOverrides}
                 offSets={offSets} setOffSets={setOffSets} />
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
