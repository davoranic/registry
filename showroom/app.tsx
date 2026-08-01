import * as React from "react"
import { createRoot } from "react-dom/client"

import { STORIES, Boundary, type Args } from "./stories"
import themeMeta from "./theme-meta.gen.json"
import contractMeta from "./contract-meta.gen.json"
import controlsMeta from "./controls.gen.json"
import systemMeta from "./system.gen.json"
import iconSets from "./icon-sets.gen.json"

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


const SYSTEM = systemMeta as any
const ICON_SETS = iconSets as Record<string, Record<string, any>>
const SYSTEM_PAGES = ["foundations", "dictionary", "translator", "rules"] as const
type SystemPage = (typeof SYSTEM_PAGES)[number]

function Md({ text }: { text: string }) {
  // minimal renderer: headings, bold, list items — honest, not fancy
  return <>{text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>
    if (line.startsWith("**") && line.includes("**", 2)) {
      const end = line.indexOf("**", 2)
      return <p key={i}><b>{line.slice(2, end)}</b>{line.slice(end + 2)}</p>
    }
    if (line.startsWith("- ") || /^\d+\. /.test(line)) return <p key={i} className="li">{line.replace(/^([-\d.]+ )/, "")}</p>
    if (!line.trim()) return null
    return <p key={i}>{line}</p>
  })}</>
}

function FoundationsPage({ theme, mode, density }: { theme: string; mode: string; density: string | null }) {
  const groups: Array<[string, string[]]> = [
    ["Surfaces", ["surface", "surface-raised", "surface-overlay", "surface-sunken"]],
    ["Action & interaction", ["action", "action-secondary", "interaction-hover", "interaction-selected"]],
    ["Status", ["status-info", "status-success", "status-warning", "status-critical"]],
    ["Lines & focus", ["border", "border-subtle", "border-strong", "field-border", "focus"]],
  ]
  return (
    <Canvas theme={theme} mode={mode} density={density}>
      <div className="foundations">
        {groups.map(([title, slots]) => (
          <section key={title}>
            <h3>{title}</h3>
            <div className="swatches">
              {slots.map((sl) => (
                <div className="swatch" key={sl}>
                  <span className="chip" style={{ background: `var(--${sl})` }} />
                  <code>--{sl}</code>
                </div>
              ))}
            </div>
          </section>
        ))}
        <section>
          <h3>Data palette</h3>
          <div className="swatches">
            {Array.from({ length: 12 }, (_, i) => (
              <div className="swatch" key={i}>
                <span className="chip" style={{ background: `var(--data-${i + 1})` }} />
                <code>--data-{i + 1}</code>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Type roles</h3>
          {[["heading-1", "Trading console"], ["heading-2", "Open orders"], ["body", "Default prose size for reading."],
            ["label", "Quantity"], ["action", "Submit order"], ["caption", "Settled · T+2"], ["data", "184.32"]].map(([r, t]) => (
            <div className="type-row" key={r}>
              <code>--type-{r}</code>
              <span style={{ font: `var(--type-${r})`,
                textTransform: r === "action" ? ("var(--action-case)" as any) : undefined,
                letterSpacing: r === "action" ? "var(--action-tracking)" : undefined }}>{t}</span>
            </div>
          ))}
        </section>
        <section>
          <h3>Rhythm & shape</h3>
          <div className="rhythm-row">
            {["sm", "md", "lg"].map((z) => (
              <div key={z} className="height-demo">
                <span className="height-box" style={{ blockSize: `var(--control-height-${z})` }} />
                <code>control-height-{z}</code>
              </div>
            ))}
            {["radius-field-control", "radius-control", "radius-container", "radius-pill"].map((r) => (
              <div key={r} className="height-demo">
                <span className="radius-demo" style={{ borderRadius: `var(--${r})` }} />
                <code>{r}</code>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Icon roles ({CONTRACT.iconRoles.length}) — set follows the theme capability</h3>
          <div className="icon-grid">
            {CONTRACT.iconRoles.map((role: string) => {
              const setName = theme === "salt" ? "salt" : "lucide"
              const g = ICON_SETS[setName]?.[role]
              return (
                <div className="icon-cell" key={role}>
                  {g ? <svg viewBox={g.viewBox} fill={g.fill ?? "none"}
                            stroke={g.stroke ? "currentColor" : undefined} strokeWidth={g.stroke ?? undefined}
                            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={g.path} fillRule={g.fillRule as any} clipRule={g.fillRule as any} /></svg> : "—"}
                  <code>{role}</code>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </Canvas>
  )
}

function DictionaryPage() {
  const entries = Object.entries(SYSTEM.dictionary as Record<string, string>).filter(([, v]) => v)
  return (
    <div className="doc wide">
      <h2>The dictionary — {entries.length} words</h2>
      <p>The executable core of the translator (<code>scripts/lift.py</code>): each source-system
         word maps to a declaration on contract slots. Unknown words are never guessed —
         they land in a lift report as growth candidates, exactly like the icon roles
         and token slots grew from Salt.</p>
      <div className="dict">
        <div className="dict-head"><span>source word</span><span>contract translation</span></div>
        {entries.map(([w, css]) => (
          <div className="dict-row" key={w}><code>{w}</code><code className="dim">{css}</code></div>
        ))}
      </div>
    </div>
  )
}

function TranslatorPage() {
  return (
    <div className="doc wide">
      <h2>The translator</h2>
      <p>Originals are never edited. Everything passes through the contract — the pivot —
         and comes out wearing the target theme's character.</p>
      <pre className="cmd">{`source design systems (clones, untouched)
        │  lift      scripts/lift.py — the dictionary
        ▼
   THE CONTRACT     tokens/semantic.md + contract/*
        │  render    each theme's adapter (scoped: data-theme on any container)
        ▼
   any character — page-wide or per component`}</pre>
      <h2>Proof — one pattern file, every character</h2>
      <p>These are real renders of <code>contract/patterns/*.json</code> through each adapter,
         each with a machine-written translation report. Lossiness is allowed; silence
         about it is not.</p>
      <div className="renders">
        {SYSTEM.patternRenders.map((r: any) => (
          <a className="render-link" key={r.href} href={r.href} target="_blank" rel="noreferrer">
            <b>{r.pattern}</b>
            <span>{r.theme}</span>
            <em data-ok={r.lossless ? "" : undefined}>{r.lossless ? "lossless" : "with substitutions"}</em>
          </a>
        ))}
      </div>
      <h2>Both directions</h2>
      <p><b>Render</b> (contract → theme): what this site does live on every canvas.<br/>
         <b>Lift</b> (theme → contract): <code>python3 scripts/lift.py &lt;component&gt;</code> reads the
         shadcn clone, translates via the dictionary, and emits a draft plus its report.
         The weekly CI canary re-lifts against live upstream so new editions announce
         themselves as failing checks.</p>
    </div>
  )
}

function RulesPage() {
  return (
    <div className="doc wide">
      <Md text={SYSTEM.rules} />
      <Md text={SYSTEM.growth} />
      <Md text={SYSTEM.sync} />
      <h2>The full law</h2>
      <p className="li">contract/naming.md — the naming grammar</p>
      <p className="li">contract/states.md · variants.md — canonical states and axes</p>
      <p className="li">contract/authoring.md — the 6-step component order</p>
      <p className="li">contract/translation.md — render/lift, adoption, capability-fork, character rules</p>
      <p className="li">docs/LINKING.md — how a design system joins</p>
      <p className="li">docs/token-research.md · translation-report.md — why each rule exists</p>
    </div>
  )
}

/* ------------------------------------------------------------------ app */

// Stories keep local state with hooks, so each must render as its OWN
// component instance — calling story.render(args) inline books its hooks
// against the caller, and switching stories then crashes the whole tree
// (React #310). The key remounts the host per story so hook lists never mix.
function StoryHost({ story, args }: { story: (typeof STORIES)[number]; args: Args }) {
  return <>{story.render(args)}</>
}

function App() {
  const [selected, setSelected] = React.useState<string>("button")
  const [theme, setTheme] = React.useState(THEME_NAMES[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [args, setArgs] = React.useState<Args>({})
  const [tab, setTab] = React.useState<"canvas" | "anatomy" | "tokens" | "install">("canvas")
  const [compare, setCompare] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const isSystem = (SYSTEM_PAGES as readonly string[]).includes(selected)
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

  const rendered = story ? <Boundary name={story.name}><StoryHost key={story.name} story={story} args={args} /></Boundary> : null

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
          <div className="tree-group">
            <span className="tree-group-label">System</span>
            {SYSTEM_PAGES.map((pg) => (
              <button key={pg} type="button" aria-current={selected === pg ? "true" : undefined}
                      onClick={() => setSelected(pg)}>{pg}</button>
            ))}
          </div>
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
          <div className="tabs" style={{ display: isSystem ? "none" : undefined }}>
            {(["canvas", "anatomy", "tokens", "install"] as const).map((t) => (
              <button key={t} type="button" aria-current={tab === t ? "page" : undefined}
                      onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>

        {isSystem ? (
          selected === "foundations" ? <FoundationsPage theme={theme} mode={mode} density={hasDensity ? density : null} />
          : selected === "dictionary" ? <DictionaryPage />
          : selected === "translator" ? <TranslatorPage />
          : <RulesPage />
        ) : tab === "canvas" && (
          compare ? (
            <div className="compare">
              {THEME_NAMES.map((t) => (
                <figure key={t}>
                  <figcaption>{THEMES[t].title}</figcaption>
                  <Canvas theme={t} mode={mode}
                          density={THEMES[t].capabilities.density ? density : null}>
                    {story ? <Boundary name={story.name}><StoryHost key={`${t}:${story.name}`} story={story} args={args} /></Boundary> : null}
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

        {!isSystem && tab === "anatomy" && (
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

        {!isSystem && tab === "tokens" && (
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

        {!isSystem && tab === "install" && (
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
