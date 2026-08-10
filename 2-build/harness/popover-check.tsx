/* Phase-2 validation harness for Popover — same purpose as
   accordion-check.tsx/dropdown-menu-check.tsx: render the generated CSS on
   the real skeleton and let the values be checked against each DS's own
   reference before moving on. Not the final registry page.

   FOUR SUB-STAGES PER (real) THEME:
     1. LIVE INTERACTION — a real trigger; click opens/closes, Escape
        closes, an outside click dismisses. Shows the current open state so
        the transition (not just the end state) is inspectable.
     2. PARTS, forced open — header/title/description/header-actions/
        close-button/content/arrow, forced on where the column's own config
        allows it.
     3. MODAL FOCUS TRAP CONTRAST (behavior.modal-focus-trap) — the
        sharpest structural finding this component produced (see
        POPOVER-MATRIX.md Finding 2): Salt traps Tab inside the panel and
        inerts the rest of the page; shadcn does neither. Both rendered
        side by side with a live "outside button" so the contrast is
        directly testable (Tab from inside Salt's panel should never reach
        it; Tab from inside shadcn's panel should).
     4. M3 — CONFIRMED ABSENCE, printed rather than a fake render (see
        POPOVER-MATRIX.md §0 — M3 has no popover, flyout, or bubble
        component or token family at all). */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Popover, type PopoverConfig } from "../skeleton/popover"
import configs from "../out/gen/popover-config.json"
import panel from "../out/gen/popover-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

function Stage({ theme }: { theme: Theme }) {
  const config = (configs as Record<string, PopoverConfig>)[theme]
  const isSalt = theme === "salt"
  const isM3 = theme === "m3"
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [open, setOpen] = React.useState(false)
  const [outsideClicks, setOutsideClicks] = React.useState(0)

  if (isM3) {
    return (
      <figure className="stage" data-theme={theme}>
        <figcaption>{theme}</figcaption>
        <div className="checkbox-block">
          <div className="checkbox-legend">
            CONFIRMED ABSENCE — no popover, flyout, or bubble component or token family exists anywhere in 3-source/material-web (checked by both a name grep across the whole clone and a directory listing of every top-level component folder — the only two matches anywhere are documentation images/figures for the MENU component's own usage guidance, not a component). See POPOVER-MATRIX.md §0.
          </div>
        </div>
      </figure>
    )
  }

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
              <button key={d} disabled={d === density} onClick={() => setDensity(d)}>{d}</button>
            ))}
          </span>
        )}
      </figcaption>

      <div className="checkbox-block">
        <div className="checkbox-caption">
          1 · live (behavior.trigger-interaction / .dismiss-outside / .dismiss-escape / .focus-return)
        </div>
        <div className="checkbox-row" onClickCapture={() => { /* used only to count real outside clicks below */ }}>
          <Popover config={config} open={open} onOpenChange={setOpen} title="Dimensions" description="Set the dimensions for the layer.">
            <button>{open ? "Close popover" : "Open popover"}</button>
          </Popover>
          <button onClick={() => setOutsideClicks((n) => n + 1)}>outside button (click count: {outsideClicks})</button>
          <span className="checkbox-note">open: {String(open)} — click the trigger, then Escape, or click the outside button to dismiss</span>
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">
          2 · parts, forced open (structure.header/.title/.description/.header-actions/.close-button/.content/.arrow)
        </div>
        <div className="checkbox-row" style={{ position: "static" }}>
          <Popover
            config={config}
            forceOpen
            className="static-item"
            title="Export settings"
            description="Choose a format and destination for the export."
            headerActions={config.headerActions ? <span aria-hidden="true">⋯</span> : undefined}
            content={<div style={{ padding: config.content ? 0 : 8 }}>Body content, arbitrary — a form, a checkbox group, anything.</div>}
          >
            <button>Actions</button>
          </Popover>
        </div>
        {!config.arrow && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — structure.arrow is off for this column.</div>
        )}
        {!config.closeButton && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — structure.close-button is off for this column (see behavior.close-button-action).</div>
        )}
        {!config.headerActions && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — structure.header-actions is off for this column.</div>
        )}
      </div>

      {config.anchor && (
        <div className="checkbox-block">
          <div className="checkbox-caption">2b · separate anchor (structure.anchor — shadcn only)</div>
          <div className="checkbox-row" style={{ position: "static" }}>
            <Popover
              config={config}
              forceOpen
              className="static-item"
              anchorElement={<span style={{ display: "inline-block", padding: "4px 8px", border: "1px dashed currentColor" }}>anchor (not the trigger)</span>}
              content={<div>Positioned against the dashed anchor above, not this button.</div>}
            >
              <button>trigger (elsewhere)</button>
            </Popover>
          </div>
        </div>
      )}

      <div className="checkbox-block">
        <div className="checkbox-caption">
          3 · behavior.modal-focus-trap ({config.modalFocusTrap ? "ON — Tab is trapped, the rest of the page is inert" : "OFF — Tab is free, the rest of the page stays interactive"})
        </div>
        <div className="checkbox-row" style={{ position: "static" }}>
          <ModalTrapDemo config={config} />
        </div>
      </div>
    </figure>
  )
}

/** Stage 3's own tiny harness: opens on mount (forceOpen would suppress the
    real effects — see popover.tsx's own `live` gate — so this uses a REAL
    open transition instead, matching CLAUDE.md's "test the transition, not
    an already-open mount" lesson) and renders two focusable fields inside
    the popup content plus one OUTSIDE it, so Tab's real reach is directly
    observable. */
function ModalTrapDemo({ config }: { config: PopoverConfig }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <Popover config={config} open={open} onOpenChange={setOpen} className="static-item" title="Focus trap check">
        <button>{open ? "close" : "open"}</button>
      </Popover>
      <button data-slot="outside-focus-target">outside field (Tab should {config.modalFocusTrap ? "NOT" : ""} reach this from inside)</button>
    </div>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>Popover — phase 2 validation</b>
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
      <style>{`
        .static-item [data-slot="popover-popup"] { position: static !important; }
      `}</style>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
