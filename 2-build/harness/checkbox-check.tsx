/* Phase-2 validation harness for Checkbox — same purpose as badge-check.tsx /
   chip-check.tsx: render the generated CSS on the real skeleton and let the
   values be checked against each DS's own reference before moving on. Not
   the final registry page.

   Every declared axis gets a control:
     - mode (all themes)
     - density (Salt only — moves box size, corner radius, gap, and label type)
     - tri-state: unchecked / checked / indeterminate — THE transition, not
       just three static mounts. Stage 1 below drives the actual click/space
       interaction so the browser's own native toggle-and-clear-indeterminate
       behaviour is what is on screen, not a prop flipped from outside.
     - disabled
     - validation: off / error / warning (Salt only has warning)
     - readOnly (Salt only)
     - group (Salt only — CheckboxGroup, with its own disabled/validation
       merge visible by toggling the GROUP's controls, not the child's)

   FOUR SUB-STAGES PER THEME:
     1. TRI-STATE TRANSITION — one real checkbox, click/space it, watch
        indeterminate -> checked resolve natively (behavior.tri-state).
     2. THE STATE MATRIX — six checkboxes fixed at rest/checked/
        indeterminate x enabled/disabled, so state.rest through
        state.disabled are all on screen at once for a fidelity check
        against the real DS.
     3. VALIDATION — every value validation supports in this column,
        both unchecked and checked, so the "error survives the checked
        fill" question is actually visible rather than asserted.
     4. GROUP — Salt only; every other column prints why it has none. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Checkbox, CheckboxGroup, type CheckboxConfig } from "../skeleton/checkbox"
import configs from "../out/gen/checkbox-config.json"
import panel from "../out/gen/checkbox-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

const NO_GROUP_REASON: Record<string, string> = {
  shadcn:
    "no group construct — CONFIRMED ABSENCE. checkbox.mdx's own prose: \"Use multiple fields to create a checkbox list\" — a documented composition pattern, not a component capability.",
  m3: "no group/set token family exists in _md-comp-checkbox.scss in either edition, and no companion file references one.",
}

const VALIDATION_LABEL: Record<string, string> = {
  off: "off",
  error: "error",
  warning: "warning (Salt only)",
}

function Legend({ children }: { children: React.ReactNode }) {
  return <div className="checkbox-legend">{children}</div>
}

/* Stage 1 — drives the REAL transition: mount indeterminate, then click (or
   space) it, and watch the browser natively resolve to checked. This is the
   transition CLAUDE.md's method notes insist on testing, not just the three
   end states. */
function TransitionDemo({
  config,
  disabled,
}: {
  config: CheckboxConfig
  disabled: boolean
}) {
  const [checked, setChecked] = React.useState(false)
  const [indeterminate, setIndeterminate] = React.useState(true)

  return (
    <div className="checkbox-row">
      <Checkbox
        config={config}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        label="Select all"
        aria-label="Select all"
        onCheckedChange={(next) => {
          setChecked(next)
          setIndeterminate(false)
        }}
      />
      <span className="checkbox-note">
        {indeterminate ? "indeterminate — click or Space it" : checked ? "checked (resolved)" : "unchecked (resolved)"}
      </span>
      <button
        onClick={() => {
          setChecked(false)
          setIndeterminate(true)
        }}
      >
        reset to indeterminate
      </button>
    </div>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, CheckboxConfig>)[theme]
  const validations = (config.validation as unknown as string[]) ?? []
  const hasGroup = Boolean(config.group)
  const hasReadOnly = Array.isArray((config as any).readOnly) && (config as any).readOnly.includes(true)
  const isSalt = theme === "salt"

  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [disabled, setDisabled] = React.useState(false)
  const [groupDisabled, setGroupDisabled] = React.useState(false)
  const [groupValidation, setGroupValidation] = React.useState<string>("off")

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
        <span className="cap-control">
          <button disabled={!disabled} onClick={() => setDisabled(false)}>
            enabled
          </button>
          <button disabled={disabled} onClick={() => setDisabled(true)}>
            disabled
          </button>
        </span>
      </figcaption>

      {/* 1 — the tri-state TRANSITION, not just the end states */}
      <div className="checkbox-block">
        <div className="checkbox-caption">
          1 · tri-state transition (behavior.tri-state) — mounted indeterminate, click/space to resolve
        </div>
        <TransitionDemo config={config} disabled={disabled} />
      </div>

      {/* 2 — the state matrix: every combination of tri-state x enabled/disabled at once */}
      <div className="checkbox-block">
        <div className="checkbox-caption">2 · state matrix (rest / checked / indeterminate × enabled / disabled)</div>
        <div className="checkbox-row">
          {(["unchecked", "checked", "indeterminate"] as const).map((s) => (
            <span className="checkbox-cell" key={s + "-enabled"}>
              <Checkbox
                config={config}
                checked={s === "checked"}
                indeterminate={s === "indeterminate"}
                label={s}
                aria-label={s}
              />
              <span className="checkbox-note">{s}, enabled</span>
            </span>
          ))}
          {(["unchecked", "checked", "indeterminate"] as const).map((s) => (
            <span className="checkbox-cell" key={s + "-disabled"}>
              <Checkbox
                config={config}
                checked={s === "checked"}
                indeterminate={s === "indeterminate"}
                disabled
                label={s}
                aria-label={s + " disabled"}
              />
              <span className="checkbox-note">{s}, disabled</span>
            </span>
          ))}
          {hasReadOnly && (
            <span className="checkbox-cell">
              <Checkbox config={config} checked readOnly label="read-only" aria-label="read-only" />
              <span className="checkbox-note">checked, readOnly (Salt: JS-level, not the spec-inert HTML attribute)</span>
            </span>
          )}
        </div>
      </div>

      {/* 3 — validation, both unchecked and checked, so "does error survive the fill" is visible */}
      <div className="checkbox-block">
        <div className="checkbox-caption">3 · validation (prop.validation / style.box.validation)</div>
        {validations.filter((v) => v !== "off").length ? (
          <div className="checkbox-row">
            {validations
              .filter((v) => v !== "off")
              .flatMap((v) => [
                <span className="checkbox-cell" key={v + "-u"}>
                  <Checkbox config={config} validation={v} label={VALIDATION_LABEL[v] ?? v} aria-label={v + " unchecked"} />
                  <span className="checkbox-note">{VALIDATION_LABEL[v] ?? v}, unchecked</span>
                </span>,
                <span className="checkbox-cell" key={v + "-c"}>
                  <Checkbox config={config} validation={v} checked label={VALIDATION_LABEL[v] ?? v} aria-label={v + " checked"} />
                  <span className="checkbox-note">{VALIDATION_LABEL[v] ?? v}, checked</span>
                </span>,
              ])}
          </div>
        ) : (
          <Legend>no validation tone in this column</Legend>
        )}
      </div>

      {/* 4 — group, Salt only; every other column prints why it has none */}
      <div className="checkbox-block">
        <div className="checkbox-caption">4 · group (structure.group / behavior.group-navigation)</div>
        {hasGroup ? (
          <>
            <div className="checkbox-row" style={{ marginBottom: 6 }}>
              <span className="cap-control">
                <button disabled={!groupDisabled} onClick={() => setGroupDisabled(false)}>
                  group enabled
                </button>
                <button disabled={groupDisabled} onClick={() => setGroupDisabled(true)}>
                  group disabled
                </button>
              </span>
              <span className="cap-control">
                {["off", "error"].map((v) => (
                  <button key={v} disabled={v === groupValidation} onClick={() => setGroupValidation(v)}>
                    group {v}
                  </button>
                ))}
              </span>
            </div>
            <CheckboxGroup config={config} disabled={groupDisabled} validation={groupValidation} direction="vertical">
              <Checkbox config={config} label="Alternatives" aria-label="Alternatives" />
              <Checkbox config={config} defaultChecked label="Equities" aria-label="Equities" />
              <Checkbox config={config} label="Fixed income" aria-label="Fixed income" />
            </CheckboxGroup>
            <span className="checkbox-note">
              no roving tabindex — every checkbox keeps its own tab stop (behavior.group-navigation); toggle
              &quot;group disabled&quot;/&quot;group validation&quot; above to see the OR-merge (behavior.disabled-handling
              / behavior.validation) apply to every child without touching them individually
            </span>
          </>
        ) : (
          <Legend>{NO_GROUP_REASON[theme]}</Legend>
        )}
      </div>
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>Checkbox — phase 2 validation</b>
      </header>
      <div className="body">
        <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => (
          <Stage key={t} theme={t} />
        ))}
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
