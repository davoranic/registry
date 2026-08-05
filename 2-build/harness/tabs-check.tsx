/* Phase-2 validation harness for Tabs — same purpose as
   dialog-check.tsx / select-check.tsx: render the generated CSS on the
   real skeleton and let the values be checked against each DS's own
   reference before moving on. Not the final registry page.

   Every declared axis gets a control here, because ALERT-MATRIX.md
   finding 10 was found by clicking one. The controls are:
     - mode (all themes)
     - density (Salt only — the only system with the capability)
     - appearance: contained / plain (Salt's bordered/transparent and
       shadcn's default/line; M3 is plain-only and gets no control)
     - emphasis: primary / secondary (M3 only)
     - activeColor: primary / secondary / tertiary (Salt only)
     - orientation: horizontal / vertical (shadcn only)
     - divider and inset (both are real Salt TabBar props. M3 gets the
       divider control too, because it has the divider tokens — but there
       the rule is unconditional in source, so switching it off is a
       harness convenience for comparing, not an M3 capability. inset is
       Salt-only and switching it on for M3 shows nothing, since
       style.tab-bar.inset is off in that column.)
     - activation mode: automatic / manual (shadcn only — Radix exposes
       the prop; Salt is manual-only and M3 [R] automatic-only)
     - narrow / wide, which is the ONLY way to see Salt's overflow menu

   A DISABLED TAB IS ALWAYS PRESENT (the third one), because
   behavior.disabled-navigation is the row where the two live systems
   disagree outright: arrow across the strip and Salt should LAND on the
   disabled tab while shadcn steps over it. That difference is invisible
   in a screenshot, which is the whole reason
   scripts/check-tabs-behavior.mjs exists alongside this page.

   Each stage also renders a PANEL with a focusable control inside it and
   one without, so behavior.panel-focusable's conditional branch (Salt,
   M3) can be told apart from shadcn's unconditional tabIndex 0 by
   tabbing off the last tab. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Tabs, type TabsConfig, type TabsItemSpec } from "../skeleton/tabs"
import configs from "../out/gen/tabs-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

/* each system's own name for the neutral axis values, so the readout is
   in the vocabulary of the system being checked (harness labelling only;
   the generated CSS keys off the neutral values). */
const APPEARANCE_LABEL: Record<string, Record<string, string>> = {
  salt: { contained: "contained (Salt: appearance=\"bordered\")", plain: "plain (Salt: appearance=\"transparent\")" },
  shadcn: { contained: "contained (shadcn: variant=\"default\")", plain: "plain (shadcn: variant=\"line\")" },
  m3: { plain: "plain (M3: no selected container colour exists)" },
}

const MOTION_LABEL: Record<string, string> = {
  static: "static (Salt: a per-tab mark, no transition anywhere in source)",
  fade: "fade (shadcn: always painted, opacity 0 -> 1)",
  slide: "slide (M3 [R]: one measured mark that translates)",
}

/* DECLARED COMPOSITION — Salt's TabAction is a <Button
   appearance="transparent">, its Badge is the badge component, and every
   tab glyph belongs to a future icon component. Rendered here as neutral
   placeholders, not imported. */
function PlaceholderAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={-1}
      style={{
        font: "inherit",
        fontSize: "0.8em",
        lineHeight: 1,
        padding: "0.25em 0.4em",
        marginInlineStart: "0.25em",
        border: "1px solid currentColor",
        borderRadius: 3,
        background: "none",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      x
    </button>
  )
}

function PanelBody({ label, withControl }: { label: string; withControl: boolean }) {
  return (
    <div style={{ padding: "12px 0", font: "inherit" }}>
      <p style={{ margin: "0 0 8px" }}>{label} panel.</p>
      {withControl ? (
        <button type="button" style={{ font: "inherit", padding: "0.3em 0.8em" }}>
          A focusable control — so this panel should NOT be a tab stop where
          behavior.panel-focusable is conditional
        </button>
      ) : (
        <p style={{ margin: 0, font: "11px/1.4 ui-monospace, monospace", color: "#71717a" }}>
          No focusable children — this panel SHOULD be a tab stop where
          behavior.panel-focusable is conditional.
        </p>
      )}
    </div>
  )
}

const LABELS = ["Home", "Transactions", "Loans", "Checks", "Liquidity", "Reporting"]

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, TabsConfig>)[theme]
  const appearances = config.appearance ?? []
  const emphases = config.emphasis ?? []
  const orientations = config.orientation ?? []
  const activeColors = config.activeColor ?? []
  const modes = config.activationMode ?? []
  const isSalt = theme === "salt"

  const [appearance, setAppearance] = React.useState(appearances[0])
  const [emphasis, setEmphasis] = React.useState(emphases[0])
  const [orientation, setOrientation] = React.useState(orientations[0])
  const [activeColor, setActiveColor] = React.useState(activeColors[0])
  const [activationMode, setActivationMode] = React.useState(modes[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [divider, setDivider] = React.useState(true)
  const [inset, setInset] = React.useState(false)
  const [narrow, setNarrow] = React.useState(false)
  const [value, setValue] = React.useState(LABELS[0])

  const items: TabsItemSpec[] = React.useMemo(
    () =>
      LABELS.map((label, i) => ({
        value: label,
        label,
        icon: i === 0 || i === 4,
        badge: i === 1 ? 1 : i === 3 ? 6 : undefined,
        actions: i === 1 ? <PlaceholderAction label={`Close ${label}`} /> : undefined,
        // behavior.disabled-navigation: Salt should LAND on this tab when
        // arrowing, shadcn should step over it.
        disabled: i === 2,
        content: <PanelBody label={label} withControl={i !== 0} />,
      })),
    [],
  )

  return (
    <figure
      className="stage"
      data-theme={theme}
      data-mode={mode === "dark" ? "dark" : undefined}
      data-density={isSalt ? density : undefined}
    >
      <figcaption>
        {theme} · {mode} · indicator: {MOTION_LABEL[config.indicatorMotion ?? "static"]} · shell:{" "}
        {config.tabShell} · activation: {activationMode ?? config.activationMode?.[0]} · disabled tabs:{" "}
        {config.disabledNavigation ?? "—"} · panels: {config.panelMounting}
        <span className="cap-control">
          <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        </span>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => (
              <button key={d} disabled={d === density} onClick={() => setDensity(d)}>
                {d}
              </button>
            ))}
          </span>
        )}
        {appearances.length > 1 && (
          <span className="cap-control">
            {appearances.map((a) => (
              <button key={a} disabled={a === appearance} onClick={() => setAppearance(a)}>
                {APPEARANCE_LABEL[theme]?.[a] ?? a}
              </button>
            ))}
          </span>
        )}
        {emphases.length > 1 && (
          <span className="cap-control">
            {emphases.map((e) => (
              <button key={e} disabled={e === emphasis} onClick={() => setEmphasis(e)}>
                {e}
              </button>
            ))}
          </span>
        )}
        {activeColors.length > 1 && (
          <span className="cap-control">
            {activeColors.map((c) => (
              <button key={c} disabled={c === activeColor} onClick={() => setActiveColor(c)}>
                activeColor: {c}
              </button>
            ))}
          </span>
        )}
        {orientations.length > 1 && (
          <span className="cap-control">
            {orientations.map((o) => (
              <button key={o} disabled={o === orientation} onClick={() => setOrientation(o)}>
                {o}
              </button>
            ))}
          </span>
        )}
        {modes.length > 1 && (
          <span className="cap-control">
            {modes.map((m) => (
              <button key={m} disabled={m === activationMode} onClick={() => setActivationMode(m)}>
                activation: {m}
              </button>
            ))}
          </span>
        )}
        {config.tabBar && (
          <span className="cap-control">
            <button disabled={divider} onClick={() => setDivider(true)}>
              divider
            </button>
            <button disabled={!divider} onClick={() => setDivider(false)}>
              no divider
            </button>
            <button disabled={inset} onClick={() => setInset(true)}>
              inset
            </button>
            <button disabled={!inset} onClick={() => setInset(false)}>
              no inset
            </button>
          </span>
        )}
        <span className="cap-control">
          <button disabled={!narrow} onClick={() => setNarrow(false)}>
            wide
          </button>
          <button disabled={narrow} onClick={() => setNarrow(true)}>
            narrow{config.overflowMenu ? " (shows the overflow menu)" : " (no overflow affordance exists)"}
          </button>
        </span>
      </figcaption>

      <div className={narrow ? "tabs-frame tabs-frame-narrow" : "tabs-frame"}>
        <Tabs
          config={config}
          items={items}
          value={value}
          onValueChange={setValue}
          appearance={appearance}
          emphasis={emphasis}
          orientation={orientation}
          activeColor={activeColor}
          activationMode={activationMode}
          divider={divider}
          inset={inset}
          id={`${theme}-tabs`}
        />
      </div>
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header>
        <b>Tabs — phase 2 validation</b>
        <span className="dim">
          arrow across each strip: Salt moves focus only (manual), shadcn swaps the panel on every
          step (automatic). Tab 3 is disabled — Salt lands on it, shadcn steps over it.
        </span>
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
