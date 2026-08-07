/* Phase-2 validation harness for RadioGroup — same purpose as
   checkbox-check.tsx/switch-check.tsx: render the generated CSS on the real
   skeleton and let the values be checked against each DS's own reference
   before moving on. Not the final registry page.

   Every declared axis gets a control:
     - mode (all themes)
     - density (Salt only)
     - the SELECTION TRANSITION, not just a static mount (CLAUDE.md method
       notes: "test the transition a user performs, not the end state" —
       stage 1 below clicks a real, unselected radio in a live three-item
       group and watches the PREVIOUSLY selected sibling deselect natively,
       the exact mechanism behavior.selection-model documents)
     - disabled (both item-level and group-level, since Salt/shadcn are the
       only two columns with a real group-level disabled to demonstrate)
     - readOnly (Salt only, both item- and group-level)
     - validation (Salt: off/error/warning; shadcn: off/error; M3: none at
       all — printed as an explicit absence)

   FIVE SUB-STAGES PER THEME:
     1. THE SELECTION TRANSITION — a real three-item group, click an
        unselected item, watch the group resolve so exactly one is checked.
     2. THE STATE MATRIX — checked/unchecked x enabled/disabled, plus a
        read-only pair for Salt.
     3. GROUP-LEVEL DISABLED/READ-ONLY — Salt/shadcn only; M3 explicitly
        shows why it cannot (no group entity to hold the prop).
     4. VALIDATION — off/error(/warning for Salt), printed as an explicit
        ABSENCE note for M3.
     5. STRUCTURE NOTE — which structure.group/structure.dot strategy this
        column uses, printed as text so the anatomy divergence is visible
        in the harness too, not just asserted in the matrix doc. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { RadioGroup, RadioItem } from "../skeleton/radio-group"
import configs from "../out/gen/radio-group-config.json"
import panel from "../out/gen/radio-group-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

type RadioGroupConfig = {
  groupShape?: string
  shell?: string
  dotMode?: string
  disabled?: boolean[]
  readOnly?: boolean[]
  required?: boolean[]
  validation?: string[]
}

function Legend({ children }: { children: React.ReactNode }) {
  return <div className="checkbox-legend">{children}</div>
}

const OPTIONS = [
  { value: "default", label: "Default" },
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
]

/* Stage 1 — drives the REAL transition: mount with "comfortable" selected,
   then click "compact", and watch the group resolve so "comfortable"
   deselects and "compact" selects — the actual mechanism
   behavior.selection-model documents, not two independent static mounts. */
function TransitionDemo({ config, disabled }: { config: RadioGroupConfig; disabled: boolean }) {
  const [value, setValue] = React.useState("comfortable")

  return (
    <div className="checkbox-row">
      <RadioGroup config={config} value={value} onValueChange={setValue} disabled={disabled} aria-label="density">
        {OPTIONS.map((o) => (
          <RadioItem key={o.value} config={config} value={o.value} label={o.label} aria-label={o.label} />
        ))}
      </RadioGroup>
      <span className="checkbox-note">selected: {value}</span>
      <button onClick={() => setValue("comfortable")}>reset to comfortable</button>
    </div>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, RadioGroupConfig>)[theme]
  const hasReadOnly = Array.isArray(config.readOnly) && config.readOnly.includes(true)
  const hasValidation = Array.isArray(config.validation) && config.validation.length > 1
  const isSalt = theme === "salt"

  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [disabled, setDisabled] = React.useState(false)
  const [groupDisabled, setGroupDisabled] = React.useState(false)
  const [validation, setValidation] = React.useState<string>("off")

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

      {/* 1 — the selection TRANSITION, not just static mounts */}
      <div className="checkbox-block">
        <div className="checkbox-caption">1 · selection transition (behavior.selection-model) — click "compact" to resolve</div>
        <TransitionDemo config={config} disabled={disabled} />
      </div>

      {/* 2 — the state matrix: checked/unchecked x enabled/disabled at once, plus read-only for Salt */}
      <div className="checkbox-block">
        <div className="checkbox-caption">2 · state matrix (checked / unchecked × enabled / disabled)</div>
        <div className="checkbox-row">
          <span className="checkbox-cell">
            <RadioGroup config={config} value="a" aria-label="enabled-checked">
              <RadioItem config={config} value="a" label="checked" aria-label="checked" />
            </RadioGroup>
            <span className="checkbox-note">checked, enabled</span>
          </span>
          <span className="checkbox-cell">
            <RadioGroup config={config} value="a" aria-label="enabled-unchecked">
              <RadioItem config={config} value="b" label="unchecked" aria-label="unchecked" />
            </RadioGroup>
            <span className="checkbox-note">unchecked, enabled</span>
          </span>
          <span className="checkbox-cell">
            <RadioGroup config={config} value="a" disabled aria-label="disabled-checked">
              <RadioItem config={config} value="a" label="checked" aria-label="checked disabled" />
            </RadioGroup>
            <span className="checkbox-note">checked, disabled</span>
          </span>
          <span className="checkbox-cell">
            <RadioGroup config={config} value="a" disabled aria-label="disabled-unchecked">
              <RadioItem config={config} value="b" label="unchecked" aria-label="unchecked disabled" />
            </RadioGroup>
            <span className="checkbox-note">unchecked, disabled</span>
          </span>
          {hasReadOnly && (
            <>
              <span className="checkbox-cell">
                <RadioGroup config={config} value="a" readOnly aria-label="readonly-checked">
                  <RadioItem config={config} value="a" label="checked" aria-label="checked readonly" />
                </RadioGroup>
                <span className="checkbox-note">checked, readOnly</span>
              </span>
              <span className="checkbox-cell">
                <RadioGroup config={config} value="a" readOnly aria-label="readonly-unchecked">
                  <RadioItem config={config} value="b" label="unchecked" aria-label="unchecked readonly" />
                </RadioGroup>
                <span className="checkbox-note">unchecked, readOnly — click does nothing (behavior.readonly)</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3 — group-level disabled, Salt/shadcn only */}
      <div className="checkbox-block">
        <div className="checkbox-caption">3 · group-level disabled (prop.group-disabled)</div>
        {theme === "m3" ? (
          <Legend>CONFIRMED ABSENCE — no group entity exists to hold a group-level prop (structure.group=name-scoped); each &lt;md-radio&gt; is disabled individually.</Legend>
        ) : (
          <div className="checkbox-row">
            <span className="cap-control">
              <button disabled={!groupDisabled} onClick={() => setGroupDisabled(false)}>
                group enabled
              </button>
              <button disabled={groupDisabled} onClick={() => setGroupDisabled(true)}>
                group disabled
              </button>
            </span>
            <RadioGroup config={config} value="a" disabled={groupDisabled} aria-label="group-disabled-demo">
              {OPTIONS.slice(0, 2).map((o) => (
                <RadioItem key={o.value} config={config} value={o.value === "default" ? "a" : "b"} label={o.label} aria-label={o.label} />
              ))}
            </RadioGroup>
            <span className="checkbox-note">group disabled must reach EVERY child, unmodified — the same OR-merge checkbox's own group assertion checks</span>
          </div>
        )}
      </div>

      {/* 4 — validation */}
      <div className="checkbox-block">
        <div className="checkbox-caption">4 · validation (prop.validation)</div>
        {hasValidation ? (
          <div className="checkbox-row">
            <span className="cap-control">
              {(config.validation as string[]).map((v) => (
                <button key={v} disabled={v === validation} onClick={() => setValidation(v)}>
                  {v}
                </button>
              ))}
            </span>
            <RadioGroup config={config} value="a" validation={validation} aria-label="validation-demo">
              <RadioItem config={config} value="a" label="option" aria-label="option" />
            </RadioGroup>
          </div>
        ) : (
          <Legend>CONFIRMED ABSENCE — no error/warning token family in _md-comp-radio-button.scss in either edition (see behavior.validation).</Legend>
        )}
      </div>

      {/* 5 — structure note, printed as text so the anatomy divergence is visible here too */}
      <div className="checkbox-block">
        <div className="checkbox-caption">5 · structure (structure.group / structure.dot)</div>
        <Legend>
          group wrapper: <code>{config.groupShape}</code> · dot strategy: <code>{config.dotMode}</code> · item shell: <code>{config.shell}</code>
        </Legend>
      </div>
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>RadioGroup — phase 2 validation</b>
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
