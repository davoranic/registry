import * as React from "react"
import { createRoot } from "react-dom/client"

import { DEMOS } from "./demos"
import themeMeta from "./theme-meta.gen.json"
import contractMeta from "./contract-meta.gen.json"
import iconSets from "./icon-sets.gen.json"

import "./showroom.css"

type Mode = "light" | "dark"

/* ------------------------------------------------------------------ state */

function useTheme() {
  const names = Object.keys(themeMeta as Record<string, any>)
  const [theme, setTheme] = React.useState(names[0])
  const [mode, setMode] = React.useState<Mode>("light")
  const [density, setDensity] = React.useState("medium")
  const [iconSet, setIconSet] = React.useState("lucide")

  const caps = (themeMeta as any)[theme].capabilities
  const hasDensity = Boolean(caps.density)
  const iconOptions: string[] = Array.isArray(caps.iconSets)
    ? caps.iconSets
    : caps.iconSets?.options ?? ["lucide"]

  React.useEffect(() => {
    const root = document.documentElement
    for (const n of names) root.classList.remove(`theme-${n}`)
    root.classList.add(`theme-${theme}`)
    root.classList.toggle("dark", mode === "dark")
    if (hasDensity) root.dataset.density = density
    else delete root.dataset.density
    root.style.setProperty("--icon-set", iconSet)
    document.querySelectorAll<HTMLLinkElement>("[data-theme-css]").forEach((el) => {
      el.media = el.dataset.themeCss === theme ? "all" : "not all"
    })
  }, [theme, mode, density, iconSet, hasDensity, names])

  React.useEffect(() => {
    if (!iconOptions.includes(iconSet)) setIconSet(iconOptions[0])
  }, [theme]) // eslint-disable-line react-hooks/exhaustive-deps

  return { theme, setTheme, mode, setMode, density, setDensity, iconSet, setIconSet,
           names, caps, hasDensity, iconOptions }
}

/* ------------------------------------------------------------------ chrome */

function Seg({ label, value, options, onChange, locked, note }: {
  label: string; value: string; options: string[]
  onChange: (v: string) => void; locked?: boolean; note?: string
}) {
  return (
    <div className="ctl" data-locked={locked ? "" : undefined} title={note}>
      <span className="ctl-label">{label}</span>
      <div className="seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o}
                  disabled={locked} onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- foundations */

function Swatches({ title, slots }: { title: string; slots: string[] }) {
  return (
    <>
      <h3>{title}</h3>
      <div className="swatches">
        {slots.map((s) => (
          <div className="swatch" key={s}>
            <div className="chip" style={{ background: `var(--${s})`,
                 color: `var(--on-${s}, var(--on-surface))` }}>Aa</div>
            <code>--{s}</code>
          </div>
        ))}
      </div>
    </>
  )
}

function Foundations({ iconSet }: { iconSet: string }) {
  const c = contractMeta as any
  return (
    <section className="page">
      <h2>Foundations</h2>
      <p className="lede">
        Every value below comes from <code>tokens/base.css</code>, overwritten by the
        active theme adapter. Components never see anything else.
      </p>

      <Swatches title="Surfaces" slots={["surface", "surface-raised", "surface-overlay", "surface-sunken"]} />
      <Swatches title="Action & interaction" slots={["action", "action-secondary", "interaction-hover", "interaction-selected"]} />
      <Swatches title="Status" slots={["status-info", "status-success", "status-warning", "status-critical"]} />
      <Swatches title="Lines & focus" slots={["border", "border-subtle", "border-strong", "field-border", "focus"]} />

      <h3>Data palette</h3>
      <div className="data-row">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="data-chip" style={{ background: `var(--data-${i + 1})` }}>
            <span>{i + 1}</span>
          </div>
        ))}
      </div>

      <h3>Typography roles</h3>
      <div className="type-list">
        {[["display", "Net asset value"], ["heading-1", "Trading console"], ["heading-2", "Open orders"],
          ["heading-3", "Position details"], ["body", "The default reading size for prose content."],
          ["label", "Quantity"], ["action", "Submit order"], ["caption", "Settled · T+2"],
          ["code", "npx shadcn add button"], ["data", "184.32"]].map(([role, sample]) => (
          <div className="type-row" key={role}>
            <code>--type-{role}</code>
            <span style={{ font: `var(--type-${role})`,
                           textTransform: role === "action" ? "var(--action-case)" as any : undefined,
                           letterSpacing: role === "action" ? "var(--action-tracking)" : undefined }}>
              {sample}
            </span>
          </div>
        ))}
      </div>

      <h3>Spacing & control heights</h3>
      <div className="bars">
        {[["space-unit", 1], ["space-inline-sm", 1], ["space-inline-md", 2], ["space-inline-lg", 4],
          ["space-stack-sm", 2], ["space-stack-md", 4], ["space-stack-lg", 6],
          ["inset-control-x", 4], ["inset-container", 6]].map(([slot]) => (
          <div className="bar-row" key={slot as string}>
            <code>--{slot}</code>
            <div className="bar" style={{ inlineSize: `calc(var(--${slot}) * 8)` }} />
          </div>
        ))}
      </div>
      <div className="heights">
        {["sm", "md", "lg"].map((s) => (
          <div key={s} className="height-demo">
            <div className="height-box" style={{ blockSize: `var(--control-height-${s})` }} />
            <code>--control-height-{s}</code>
          </div>
        ))}
      </div>

      <h3>Radius, elevation, motion, layers</h3>
      <div className="grid-4">
        <div>
          {["radius-field-control", "radius-control", "radius-container", "radius-overlay", "radius-pill"].map((r) => (
            <div className="mini-row" key={r}>
              <span className="radius-box" style={{ borderRadius: `var(--${r})` }} />
              <code>--{r}</code>
            </div>
          ))}
        </div>
        <div>
          {["elevation-resting", "elevation-raised", "elevation-overlay", "elevation-modal"].map((e) => (
            <div className="mini-row" key={e}>
              <span className="elev-box" style={{ boxShadow: `var(--${e})` }} />
              <code>--{e}</code>
            </div>
          ))}
        </div>
        <div>
          {["duration-instant", "duration-fast", "duration-base", "duration-slow"].map((d) => (
            <div className="mini-row" key={d}>
              <span className="dur-box" style={{ transitionDuration: `var(--${d})` }} />
              <code>--{d}</code>
            </div>
          ))}
        </div>
        <div>
          {["layer-base", "layer-sticky", "layer-dropdown", "layer-overlay", "layer-modal",
            "layer-notification", "layer-tooltip"].map((l) => (
            <div className="mini-row" key={l}><code>--{l}</code></div>
          ))}
        </div>
      </div>

      <h3>Icons — {c.iconRoles.length} semantic roles × {Object.keys(iconSets as any).length} sets</h3>
      <p className="lede">
        Components reference a <em>role</em>, never a library glyph name. Switching the
        set above swaps every icon in the registry.
      </p>
      <div className="icon-grid">
        {c.iconRoles.map((role: string) => {
          const glyph = (iconSets as any)[iconSet]?.[role]
          return (
            <div className="icon-cell" key={role}>
              {glyph ? (
                <svg viewBox={glyph.viewBox} fill={glyph.fill ?? "none"}
                     stroke={glyph.stroke ? "currentColor" : undefined}
                     strokeWidth={glyph.stroke ?? undefined}
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={glyph.path} fillRule={glyph.fillRule as any} clipRule={glyph.fillRule as any} />
                </svg>
              ) : <span className="icon-missing">—</span>}
              <code>{role}</code>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- components */

function Components() {
  const groups = Array.from(new Set(DEMOS.map((d) => d.group)))
  return (
    <section className="page">
      <h2>Components</h2>
      <p className="lede">
        {DEMOS.length} live components. Each renders its real implementation —
        structure from <code>contract/anatomy/*.json</code>, recipe on contract slots.
        Interact with them; they work.
      </p>
      {groups.map((g) => (
        <div key={g}>
          <h3>{g}</h3>
          <div className="cards">
            {DEMOS.filter((d) => d.group === g).map((d) => (
              <article className="card" key={d.name}>
                <div className="stage">{d.node}</div>
                <footer>
                  <b>{d.name}</b>
                  <code>add {d.name}</code>
                </footer>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

/* ----------------------------------------------------------------- patterns */

function Patterns() {
  const c = contractMeta as any
  return (
    <section className="page">
      <h2>Patterns</h2>
      <p className="lede">
        Patterns are data — regions composed of contract components. The same file
        renders into any theme, which is what makes a design portable.
      </p>
      <div className="cards">
        {c.patterns.map((p: any) => (
          <article className="card" key={p.name}>
            <div className="pattern-body">
              <b>{p.name}</b>
              <p>{p.intent}</p>
              <div className="regions">
                {p.regions.map((r: string) => <span className="tag" key={r}>{r}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- contract */

function Contract({ theme }: { theme: string }) {
  const meta = (themeMeta as any)[theme]
  const c = contractMeta as any
  return (
    <section className="page">
      <h2>The contract</h2>
      <p className="lede">
        Source systems are never edited. Everything is translated through one semantic
        contract — the pivot — and rendered out in the target theme's character.
      </p>
      <pre className="flow">{`   source design systems (clones, untouched)
            │  lift        scripts/lift.py — the dictionary
            ▼
       THE CONTRACT       tokens/semantic.md + contract/*
            │  render     each theme's adapter
            ▼
   ${Object.values(themeMeta as any).map((t: any) => t.title).join("  ·  ")}`}</pre>

      <div className="stats">
        <div><b>{c.slotCount}</b><span>contract slots</span></div>
        <div><b>{c.anatomyCount}</b><span>anatomy specs</span></div>
        <div><b>{DEMOS.length}</b><span>components</span></div>
        <div><b>{c.patterns.length}</b><span>patterns</span></div>
        <div><b>{Object.keys(themeMeta as any).length}</b><span>themes</span></div>
        <div><b>{c.dictionaryWords}</b><span>dictionary words</span></div>
      </div>

      <h3>{meta.title} — declared capabilities</h3>
      <table className="caps">
        <tbody>
          <tr><th>modes</th><td>{(meta.capabilities.modes ?? []).join(" · ")}</td></tr>
          <tr><th>density</th><td>{meta.capabilities.density
            ? meta.capabilities.density.options.join(" · ")
            : <em>not a capability of this theme</em>}</td></tr>
          <tr><th>corners</th><td>{meta.capabilities.corner}</td></tr>
          <tr><th>icon sets</th><td>{Array.isArray(meta.capabilities.iconSets)
            ? meta.capabilities.iconSets.join(" · ")
            : `${meta.capabilities.iconSets.options.join(" · ")} (${meta.capabilities.iconSets.mechanism.split("—")[0].trim()})`}</td></tr>
        </tbody>
      </table>
      <h3>Constraints</h3>
      <ul className="constraints">
        {meta.constraints.map((x: string) => <li key={x}>{x}</li>)}
      </ul>
    </section>
  )
}

/* --------------------------------------------------------------------- app */

function App() {
  const t = useTheme()
  const [view, setView] = React.useState<"components" | "foundations" | "patterns" | "contract">("components")
  const views = ["components", "foundations", "patterns", "contract"] as const

  return (
    <>
      <header>
        <div className="brand">
          <b>UI Registry</b>
          <small>registry.davoranic.com</small>
        </div>
        <nav className="views">
          {views.map((v) => (
            <button key={v} type="button" aria-current={view === v ? "page" : undefined}
                    onClick={() => setView(v)}>{v}</button>
          ))}
        </nav>
        <div className="spacer" />
        <Seg label="theme" value={t.theme} options={t.names}
             onChange={t.setTheme} />
        <Seg label="mode" value={t.mode} options={["light", "dark"]}
             onChange={(v) => t.setMode(v as Mode)} />
        <Seg label="density" value={t.density} options={
               t.hasDensity ? t.caps.density.options : ["medium"]}
             onChange={t.setDensity} locked={!t.hasDensity}
             note={t.hasDensity ? undefined : "density is not a capability of this theme"} />
        <Seg label="icons" value={t.iconSet} options={t.iconOptions}
             onChange={t.setIconSet} />
      </header>
      <main>
        {view === "components" && <Components />}
        {view === "foundations" && <Foundations iconSet={t.iconSet} />}
        {view === "patterns" && <Patterns />}
        {view === "contract" && <Contract theme={t.theme} />}
      </main>
    </>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
