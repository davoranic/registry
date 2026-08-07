/* Phase-2 validation harness for Switch — same purpose as checkbox-check.tsx:
   render the generated CSS on the real skeleton and let the values be
   checked against each DS's own reference before moving on. Not the final
   registry page.

   Every declared axis gets a control:
     - mode (all themes)
     - density (Salt only — moves track/thumb size, corner radius, gap, and
       label type)
     - the off->on TRANSITION, not just two static mounts (CLAUDE.md method
       notes: "test the transition a user performs, not the end state" —
       stage 1 below clicks a real switch and watches the native toggle)
     - disabled
     - readOnly (Salt only)
     - size: default / sm (shadcn ONLY — a genuinely new axis checkbox never
       had; see prop.size)
     - icons (M3 ONLY — opt-in, defaults off; see prop.icons)

   FIVE SUB-STAGES PER THEME:
     1. THE TRANSITION — one real switch, click it, watch off resolve to on
        natively (the transition, not a prop flipped from outside).
     2. THE STATE MATRIX — four switches fixed at off/on x enabled/disabled,
        plus a read-only pair for Salt, so state.rest through state.disabled
        are all on screen at once for a fidelity check against the real DS.
     3. SIZE — shadcn only; every other column prints why it has none.
     4. ICONS — M3 only; every other column prints why it has none.
     5. VALIDATION — printed as an explicit ABSENCE note in all three
        columns (switch has no validation tone anywhere — the exact inverse
        of checkbox's finding that all three shipped one), so the negative
        is visible in the harness too, not just asserted in the matrix doc. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Switch } from "../skeleton/switch"
import configs from "../out/gen/switch-config.json"
import panel from "../out/gen/switch-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

type SwitchConfig = {
  shell?: string
  iconMode?: string
  disabled?: boolean[]
  readOnly?: boolean[]
  required?: boolean[]
  size?: string[]
  icons?: boolean[]
}

function Legend({ children }: { children: React.ReactNode }) {
  return <div className="checkbox-legend">{children}</div>
}

/* Stage 1 — drives the REAL transition: mount OFF, then click it, and watch
   the browser natively resolve to on. */
function TransitionDemo({ config, disabled }: { config: SwitchConfig; disabled: boolean }) {
  const [checked, setChecked] = React.useState(false)

  return (
    <div className="checkbox-row">
      <Switch
        config={config}
        checked={checked}
        disabled={disabled}
        label="Airplane mode"
        aria-label="Airplane mode"
        onCheckedChange={setChecked}
      />
      <span className="checkbox-note">{checked ? "on (resolved)" : "off — click or Space it"}</span>
      <button onClick={() => setChecked(false)}>reset to off</button>
    </div>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, SwitchConfig>)[theme]
  const hasReadOnly = Array.isArray(config.readOnly) && config.readOnly.includes(true)
  const hasSize = Array.isArray(config.size) && config.size.length > 1
  const hasIcons = Array.isArray(config.icons) && config.icons.includes(true)
  const isSalt = theme === "salt"

  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [disabled, setDisabled] = React.useState(false)
  const [size, setSize] = React.useState<string>((config.size?.[0] as string) ?? "default")
  const [iconsOn, setIconsOn] = React.useState(false)

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

      {/* 1 — the off->on TRANSITION, not just two static mounts */}
      <div className="checkbox-block">
        <div className="checkbox-caption">1 · off→on transition (behavior.tri-state's absence — a plain 2-state toggle) — click to resolve</div>
        <TransitionDemo config={config} disabled={disabled} />
      </div>

      {/* 2 — the state matrix: off/on x enabled/disabled at once, plus read-only for Salt */}
      <div className="checkbox-block">
        <div className="checkbox-caption">2 · state matrix (off / on × enabled / disabled)</div>
        <div className="checkbox-row">
          {(["off", "on"] as const).map((s) => (
            <span className="checkbox-cell" key={s + "-enabled"}>
              <Switch config={config} checked={s === "on"} label={s} aria-label={s} />
              <span className="checkbox-note">{s}, enabled</span>
            </span>
          ))}
          {(["off", "on"] as const).map((s) => (
            <span className="checkbox-cell" key={s + "-disabled"}>
              <Switch config={config} checked={s === "on"} disabled label={s} aria-label={s + " disabled"} />
              <span className="checkbox-note">{s}, disabled</span>
            </span>
          ))}
          {hasReadOnly && (
            <>
              <span className="checkbox-cell">
                <Switch config={config} checked={false} readOnly label="read-only off" aria-label="read-only off" />
                <span className="checkbox-note">off, readOnly</span>
              </span>
              <span className="checkbox-cell">
                <Switch config={config} checked readOnly label="read-only on" aria-label="read-only on" />
                <span className="checkbox-note">
                  on, readOnly (Salt: thumb is FORCED to the neutral/off look even though it is checked — state.readonly)
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3 — size, shadcn only */}
      <div className="checkbox-block">
        <div className="checkbox-caption">3 · size (prop.size)</div>
        {hasSize ? (
          <div className="checkbox-row">
            <span className="cap-control">
              {(config.size as string[]).map((sz) => (
                <button key={sz} disabled={sz === size} onClick={() => setSize(sz)}>
                  {sz}
                </button>
              ))}
            </span>
            <span className="checkbox-cell">
              <Switch config={config} checked size={size as "default" | "sm"} label={size} aria-label={size} />
              <span className="checkbox-note">size={size}, on</span>
            </span>
            <span className="checkbox-cell">
              <Switch config={config} checked={false} size={size as "default" | "sm"} label={size} aria-label={size + " off"} />
              <span className="checkbox-note">size={size}, off</span>
            </span>
          </div>
        ) : (
          <Legend>
            {theme === "salt"
              ? "no size prop — density (a document-level, registry-wide axis) plays the equivalent role instead, see the density buttons above"
              : "CONFIRMED ABSENCE — no size-related @property anywhere; track/handle dimensions are fixed literals in every instance"}
          </Legend>
        )}
      </div>

      {/* 4 — icons, M3 only */}
      <div className="checkbox-block">
        <div className="checkbox-caption">4 · icons (prop.icons / structure.icon)</div>
        {theme === "m3" ? (
          <div className="checkbox-row">
            <span className="cap-control">
              <button disabled={!iconsOn} onClick={() => setIconsOn(false)}>
                icons off (default)
              </button>
              <button disabled={iconsOn} onClick={() => setIconsOn(true)}>
                icons on
              </button>
            </span>
            <span className="checkbox-cell">
              <Switch
                config={{ ...config, icons: [iconsOn] } as SwitchConfig}
                checked
                label="on"
                aria-label="icons on-state"
              />
              <span className="checkbox-note">on, icons={String(iconsOn)}</span>
            </span>
            <span className="checkbox-cell">
              <Switch
                config={{ ...config, icons: [iconsOn] } as SwitchConfig}
                checked={false}
                label="off"
                aria-label="icons off-state"
              />
              <span className="checkbox-note">off, icons={String(iconsOn)}</span>
            </span>
          </div>
        ) : theme === "salt" ? (
          <Legend>Salt shows a checkmark automatically whenever checked (and not read-only) — see stage 2's "on, enabled" cell; not an opt-in toggle.</Legend>
        ) : (
          <Legend>CONFIRMED ABSENCE — no icon capability of any kind.</Legend>
        )}
      </div>

      {/* 5 — validation, printed as an explicit absence in ALL THREE columns */}
      <div className="checkbox-block">
        <div className="checkbox-caption">5 · validation (behavior.validation / prop.validation)</div>
        <Legend>
          no validation tone in this column — CONFIRMED ABSENCE in all three systems (the exact inverse of checkbox, where every
          column shipped one). Salt's own Switch.tsx never destructures `validationStatus` from useFormFieldProps(); shadcn's
          canonical className string has no `aria-invalid:` class; M3's _md-comp-switch.scss contains no `error-*`/`warning-*`
          family in either token edition.
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
        <b>Switch — phase 2 validation</b>
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
