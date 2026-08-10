/* Phase-2 validation harness for Drawer — same purpose as dialog-check.tsx:
   render the generated CSS on the real skeleton and let the values be
   checked against each DS's own reference before moving on. Not the final
   registry page.

   Every declared axis gets a control here, per ALERT-MATRIX.md finding 10's
   standing lesson (found by clicking one). The controls are:
     - mode (all themes)
     - position: left / top / right / bottom (all themes — the defining
       axis of this component; M3 has no top-sheet source at all, so its
       @top stage is rendered with a visible "no source" note rather than
       silently reusing another position's values)
     - variant: primary / secondary / tertiary (Salt only)
     - close button on/off, so structure.close-button's three modes
       (optional / manual / none) are all reachable — for Salt and shadcn
       BOTH require an explicit instance opt-in, a real, sourced contrast
       with dialog-check.tsx's own shadcn column, which defaults ON
     - drag handle on/off (shadcn + M3 only, and only visible at all when
       position="bottom" — both real sources agree on this constraint)
     - long content on/off

   TWO kinds of instance, deliberately, same convention as dialog-check.tsx:
     1. a PINNED one, rendered open inside a dashed frame and labelled
        PINNED — contained, every global side effect suspended.
     2. a REAL one behind a real trigger button, fully modal for whichever
        mechanisms this column's config actually turns on (Salt has NO
        scroll lock, confirmed — see DRAWER-MATRIX.md Finding 4 — so the
        page will keep scrolling behind an open Salt drawer, on purpose). */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Drawer, type DrawerConfig } from "../skeleton/drawer"
import configs from "../out/gen/drawer-config.json"
import panel from "../out/gen/drawer-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

const CLOSE_LABEL: Record<string, string> = {
  optional: "optional (Salt: a separate DrawerCloseButton export, consumer-placed)",
  manual: "manual (shadcn: DrawerClose is a bare, entirely unstyled primitive)",
  none: "none (M3: no close token exists)",
}

const SHORT = "Choosing a privacy setting applies it to every device signed in to this account."

const LONG = (
  <>
    <p style={{ margin: "0 0 1em" }}>{SHORT}</p>
    <p style={{ margin: "0 0 1em" }}>
      This second paragraph exists so the body overflows. The panel itself is the scroll
      container (overflow: auto, from the base CSS) — unlike dialog, no column here has a
      dedicated content-scroller sub-part.
    </p>
    <p style={{ margin: "0 0 1em" }}>
      A third paragraph, to be sure the box overflows at the smaller left/right widths too.
    </p>
    <p style={{ margin: 0 }}>A fourth, for the same reason at top/bottom.</p>
  </>
)

function PlaceholderButton({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: "outline" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        font: "inherit",
        padding: "0.4em 1em",
        border: "1px solid currentColor",
        borderRadius: 4,
        background: variant === "outline" ? "none" : "currentColor",
        color: variant === "outline" ? "inherit" : "Canvas",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}

const POSITIONS = ["left", "top", "right", "bottom"] as const

function Stage({ theme, position }: { theme: Theme; position: (typeof POSITIONS)[number] }) {
  const config = (configs as Record<string, DrawerConfig>)[theme]
  const variants = config.variant ?? []
  const closeMode = config.closeButton ?? "none"
  const dragCapable = Boolean(config.dragHandle)

  const [variant, setVariant] = React.useState<string | undefined>(variants[0])
  const [mode, setMode] = React.useState("light")
  const [long, setLong] = React.useState(false)
  const [closeOn, setCloseOn] = React.useState(closeMode !== "none")
  const [dragOn, setDragOn] = React.useState(true)
  const [liveOpen, setLiveOpen] = React.useState(false)
  const isSalt = theme === "salt"
  const noSource = theme === "m3" && position === "top"

  const shared = {
    config,
    position,
    variant: isSalt ? variant : undefined,
    title: "Notification settings",
    description: "Choose how you want to be notified about account activity.",
    showCloseButton: closeMode === "none" ? undefined : closeOn,
    footer: (
      <>
        <PlaceholderButton variant="outline">Cancel</PlaceholderButton>
        <PlaceholderButton>Save</PlaceholderButton>
      </>
    ),
  }

  return (
    <figure className="stage" data-theme={theme} data-mode={mode === "dark" ? "dark" : undefined}>
      <figcaption>
        {theme} · {position} · close: {CLOSE_LABEL[closeMode]}
        {noSource && <span className="cap-control" style={{ color: "#b45309" }}>no M3 source for @top — see DRAWER-MATRIX.md</span>}
        <span className="cap-control">
          <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        </span>
        {isSalt && variants.length > 0 && (
          <span className="cap-control">
            {variants.map((v) => (
              <button key={v} disabled={v === variant} onClick={() => setVariant(v)}>{v}</button>
            ))}
          </span>
        )}
        {closeMode !== "none" && (
          <span className="cap-control">
            <button disabled={closeOn} onClick={() => setCloseOn(true)}>close button</button>
            <button disabled={!closeOn} onClick={() => setCloseOn(false)}>no close button</button>
          </span>
        )}
        {dragCapable && position === "bottom" && (
          <span className="cap-control">
            <button disabled={dragOn} onClick={() => setDragOn(true)}>drag handle</button>
            <button disabled={!dragOn} onClick={() => setDragOn(false)}>no handle</button>
          </span>
        )}
        <span className="cap-control">
          <button disabled={long} onClick={() => setLong(true)}>long content</button>
          <button disabled={!long} onClick={() => setLong(false)}>short content</button>
        </span>
      </figcaption>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        <span style={{ font: "11px/1.4 ui-monospace, monospace", color: "#71717a" }}>
          PINNED OPEN — bounded by this frame on purpose; ignores Escape, outside presses and the
          focus trap so the page stays usable. Not a stuck drawer.
        </span>
        <div className="dialog-frame" style={{ minHeight: 220, position: "relative", overflow: "hidden" }}>
          <Drawer
            {...shared}
            config={{ ...config, dragHandle: dragCapable && dragOn }}
            id={`${theme}-${position}-pinned`}
            open
            forceOpen
            contained
          >
            {long ? LONG : SHORT}
          </Drawer>
        </div>

        <span style={{ font: "11px/1.4 ui-monospace, monospace", color: "#71717a" }}>
          LIVE — a real instance: uses this column&apos;s own real focus trap / dismissal / (where
          real) scroll-lock mechanism, and returns focus to this button on close.
        </span>
        <div>
          <PlaceholderButton onClick={() => setLiveOpen(true)}>Open {theme} {position} drawer</PlaceholderButton>
        </div>
        <Drawer
          {...shared}
          config={{ ...config, dragHandle: dragCapable && dragOn }}
          id={`${theme}-${position}-live`}
          open={liveOpen}
          onOpenChange={setLiveOpen}
        >
          {long ? LONG : SHORT}
        </Drawer>
      </div>
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  const [position, setPosition] = React.useState<(typeof POSITIONS)[number]>("right")
  return (
    <div className="shell">
      <header>
        <b>Drawer — phase 2 validation</b>
        <span className="cap-control" style={{ marginLeft: 16 }}>
          {POSITIONS.map((p) => (
            <button key={p} disabled={p === position} onClick={() => setPosition(p)}>{p}</button>
          ))}
        </span>
      </header>
      <div className="body">
        <main style={{ flexDirection: "column", alignItems: "stretch" }}>
          {THEMES.map((t) => <Stage key={t + position} theme={t} position={position} />)}
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
