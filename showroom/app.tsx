import * as React from "react"
import { createRoot } from "react-dom/client"

import { STORIES, Boundary, type Args } from "./stories"
import themeMeta from "./theme-meta.gen.json"
import contractMeta from "./contract-meta.gen.json"
import controlsMeta from "./controls.gen.json"

import "./showroom.css"

const THEMES = themeMeta as Record<string, any>
const CONTROLS = controlsMeta as Record<string, {
  axes: Record<string, string[]>; states: string[]; parts: string[]
  behavior: string; tokens: string[]
}>
const CONTRACT = contractMeta as any
const THEME_NAMES = Object.keys(THEMES)

/* ------------------------------------------------------------------ canvas */

/** The ONLY themed element on the page. Site chrome never re-themes. */
function Canvas({ theme, mode, density, children }: {
  theme: string; mode: string; density: string | null; children: React.ReactNode
}) {
  return (
    <div className="canvas" data-theme={theme} data-mode={mode}
         data-density={density ?? undefined}>
      <div className="canvas-inner">{children}</div>
    </div>
  )
}

/* ---------------------------------------------------------------- controls */

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="ctrl-field">
      <label>{label}{hint && <em title={hint}> ⓘ</em>}</label>
      {children}
    </div>
  )
}

function Segmented({ value, options, onChange, disabled }: {
  value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <div className="segmented" data-disabled={disabled ? "" : undefined}>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} disabled={disabled}
                onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ app */

function App() {
  const [selected, setSelected] = React.useState("button")
  const [theme, setTheme] = React.useState(THEME_NAMES[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [args, setArgs] = React.useState<Args>({})
  const [tab, setTab] = React.useState<"canvas" | "anatomy" | "tokens" | "install">("canvas")
  const [compare, setCompare] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const story = STORIES.find((s) => s.name === selected)
  const meta = CONTROLS[selected] ?? { axes: {}, states: [], parts: [], behavior: "", tokens: [] }
  const caps = THEMES[theme].capabilities
  const hasDensity = Boolean(caps.density)
  const densityOptions: string[] = hasDensity ? caps.density.options : ["medium"]

  // reset args when the selected component changes — each has its own axes
  React.useEffect(() => setArgs({}), [selected])

  const groups = Array.from(new Set(STORIES.map((s) => s.group)))
  const visible = (g: string) =>
    STORIES.filter((s) => s.group === g && s.name.includes(query.toLowerCase()))

  const rendered = story ? <Boundary name={story.name}>{story.render(args)}</Boundary> : null

  return (
    <div className="shell">
      {/* ---- tree ---- */}
      <aside className="tree">
        <div className="tree-head">
          <b>UI Registry</b>
          <small>registry.davoranic.com</small>
        </div>
        <input className="filter" type="search" placeholder="Filter components…"
               value={query} onChange={(e) => setQuery(e.target.value)}
               aria-label="Filter components" />
        <nav>
          {groups.map((g) => {
            const items = visible(g)
            if (!items.length) return null
            return (
              <div className="tree-group" key={g}>
                <span className="tree-group-label">{g}</span>
                {items.map((s) => (
                  <button key={s.name} type="button"
                          aria-current={selected === s.name ? "true" : undefined}
                          onClick={() => setSelected(s.name)}>
                    {s.name}
                  </button>
                ))}
              </div>
            )
          })}
        </nav>
        <div className="tree-foot">
          {STORIES.length} components · {CONTRACT.slotCount} slots · {THEME_NAMES.length} themes
        </div>
      </aside>

      {/* ---- canvas ---- */}
      <main className="stage">
        <div className="stage-bar">
          <h1>{selected}</h1>
          <span className="behavior">{meta.behavior.split("(")[0].trim()}</span>
          <div className="spacer" />
          <div className="tabs">
            {(["canvas", "anatomy", "tokens", "install"] as const).map((t) => (
              <button key={t} type="button" aria-current={tab === t ? "page" : undefined}
                      onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>

        {tab === "canvas" && (
          compare ? (
            <div className="compare">
              {THEME_NAMES.map((t) => (
                <figure key={t}>
                  <figcaption>{THEMES[t].title}</figcaption>
                  <Canvas theme={t} mode={mode}
                          density={THEMES[t].capabilities.density ? density : null}>
                    {story ? <Boundary name={story.name}>{story.render(args)}</Boundary> : null}
                  </Canvas>
                </figure>
              ))}
            </div>
          ) : (
            <Canvas theme={theme} mode={mode} density={hasDensity ? density : null}>
              {rendered}
            </Canvas>
          )
        )}

        {tab === "anatomy" && (
          <div className="doc">
            <h2>Parts</h2>
            <p>Theme-invariant structure from <code>contract/anatomy/{selected}.json</code>.
               Themes change the recipe per part — never the parts.</p>
            <ul className="pill-list">{meta.parts.map((p) => <li key={p}>{p}</li>)}</ul>
            <h2>States</h2>
            <ul className="pill-list">{(CONTROLS[selected]?.states ?? []).map((s) => <li key={s}>{s}</li>)}</ul>
            <h2>Variant axes</h2>
            {Object.keys(meta.axes).length === 0 ? <p><em>None — this component has no variants.</em></p> : (
              <ul className="pill-list">
                {Object.entries(meta.axes).map(([axis, vals]) => (
                  <li key={axis}>{axis}: {vals.join(" · ")}</li>
                ))}
              </ul>
            )}
            <h2>Behavior</h2>
            <p>{meta.behavior || "—"}</p>
          </div>
        )}

        {tab === "tokens" && (
          <div className="doc">
            <h2>Contract slots consumed</h2>
            <p>This component reads only these. Swap the theme and every one of them
               changes value — the component never knows.</p>
            <div className="token-grid">
              {meta.tokens.map((t) => (
                <div className="token-row" key={t}>
                  <span className="token-chip" data-theme={theme} data-mode={mode}
                        style={{ background: `var(--${t}, var(--surface-sunken))` }} />
                  <code>--{t}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "install" && (
          <div className="doc">
            <h2>Install</h2>
            <pre className="cmd">npx shadcn@latest add davoranic/registry/{selected}</pre>
            <h2>Theme</h2>
            <pre className="cmd">npx shadcn@latest add davoranic/registry/theme-{theme}</pre>
            <h2>Apply</h2>
            <pre className="cmd">{`<link rel="stylesheet" href="styles/registry-base.css">
<link rel="stylesheet" href="styles/theme-${theme}.css">

<html data-theme="${theme}"${mode === "dark" ? ' data-mode="dark"' : ""}${hasDensity ? ` data-density="${density}"` : ""}>
<!-- or scope it to any container:
     <div data-theme="salt" data-density="high"> … </div> -->`}</pre>
            <h2>Files</h2>
            <ul className="pill-list">
              <li>registry/{selected}/{selected}.tsx</li>
              <li>registry/{selected}/{selected}.css</li>
              <li>contract/anatomy/{selected}.json</li>
            </ul>
          </div>
        )}
      </main>

      {/* ---- controls ---- */}
      <aside className="panel">
        <h2>Preview</h2>
        <Field label="Theme">
          <Segmented value={theme} options={THEME_NAMES} onChange={setTheme} />
        </Field>
        <Field label="Mode">
          <Segmented value={mode} options={["light", "dark"]} onChange={setMode} />
        </Field>
        <Field label="Density"
               hint={hasDensity ? undefined : `${THEMES[theme].title} declares no density axis`}>
          <Segmented value={density} options={densityOptions} onChange={setDensity}
                     disabled={!hasDensity} />
        </Field>
        <label className="check">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
          Compare all themes
        </label>

        <h2>Props</h2>
        {Object.keys(meta.axes).length === 0 && meta.states.length === 0 && (
          <p className="muted">This component declares no variant axes.</p>
        )}
        {Object.entries(meta.axes).map(([axis, values]) => (
          <Field key={axis} label={axis}>
            <select value={(args[axis] as string) ?? values[0]}
                    onChange={(e) => setArgs((p) => ({ ...p, [axis]: e.target.value }))}>
              {values.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        ))}
        {meta.states.map((s) => (
          <label className="check" key={s}>
            <input type="checkbox" checked={Boolean(args[s])}
                   onChange={(e) => setArgs((p) => ({ ...p, [s]: e.target.checked }))} />
            {s}
          </label>
        ))}

        <h2>Constraints</h2>
        <ul className="constraints">
          {THEMES[theme].constraints.map((c: string) => <li key={c}>{c}</li>)}
        </ul>
      </aside>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
