/* Phase-2 validation harness for Dialog — same purpose as
   select-check.tsx / input-check.tsx: render the generated CSS on the real
   skeleton and let the values be checked against each DS's own reference
   before moving on. Not the final registry page.

   Every declared axis gets a control here, because ALERT-MATRIX.md finding
   10 was found by clicking one. The controls are:
     - mode (all themes)
     - density (Salt only — the only system with the capability)
     - size: small / medium / large (Salt only; shadcn's Dialog has no size
       prop, its alert-dialog does — see the scope note)
     - status: info / error / warning / success + a "none" reset (Salt only,
       and note it is FOUR values here where Salt's own Input has three)
     - close button on/off, so structure.close-button's three modes
       (optional / default / none) are all reachable
     - long content on/off, so Salt's overflow padding, scroll dividers and
       focusable scroll region can be seen at all

   TWO kinds of instance, deliberately:
     1. a PINNED one, rendered open inside a dashed frame and labelled
        PINNED. It is `contained` (position: absolute, bounded by the frame)
        and every global side effect is suspended — no scroll lock, no
        background suppression, no focus trap, no dismissal. It exists so
        the open state is inspectable without interaction, and it is
        labelled so nobody mistakes it for a stuck dialog (a real confusion
        that happened on select).
     2. a REAL one behind a real trigger button, which is modal for
        everything: it locks the page, suppresses the background with this
        system's own mechanism, traps and returns focus, and dismisses on
        Escape and on an outside press. That is the only instance where the
        behavior rows can actually be exercised, and it is the reason
        scripts/check-dialog-behavior.mjs exists alongside it. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Dialog, type DialogConfig } from "../skeleton/dialog"
import configs from "../out/gen/dialog-config.json"
import panel from "../out/gen/dialog-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

/* each system's own name for its close-affordance default, so the readout
   is in the vocabulary of the system being checked (harness labelling only;
   the generated CSS keys off the neutral values). */
const CLOSE_LABEL: Record<string, string> = {
  optional: "optional (Salt: a separate DialogCloseButton export)",
  default: "default-on (shadcn: showCloseButton = true)",
  none: "none (M3: no close token exists)",
}

const SHORT = "Choosing a privacy setting applies it to every device signed in to this account."

const LONG = (
  <>
    <p style={{ margin: "0 0 1em" }}>{SHORT}</p>
    <p style={{ margin: "0 0 1em" }}>
      This second paragraph exists so the body overflows. In Salt that turns on three things at
      once: the extra right padding, the top and bottom scroll dividers, and the focusable
      scroll region (role=region, tabIndex=0). In shadcn and M3 nothing happens, because neither
      has a content scroller at all.
    </p>
    <p style={{ margin: "0 0 1em" }}>
      Scroll this body to watch the top divider appear and the bottom one disappear. The bottom
      one uses source&apos;s own `&gt; 1` tolerance, not `&gt; 0`.
    </p>
    <p style={{ margin: "0 0 1em" }}>
      A fourth paragraph, to be sure the box overflows at low and touch density too, where the
      panel is proportionally taller.
    </p>
    <p style={{ margin: 0 }}>A fifth, for the same reason at large size.</p>
  </>
)

/* DECLARED COMPOSITION — the action buttons belong to the future `button`
   registry component (Salt uses <Button sentiment="accented"/>, shadcn
   <Button variant="outline"/>, M3 defers to "standard text buttons").
   Rendered here as neutral placeholders, not imported. */
function PlaceholderButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        font: "inherit",
        padding: "0.4em 1em",
        border: "1px solid currentColor",
        borderRadius: 4,
        background: "none",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, DialogConfig>)[theme]
  const sizes = config.size ?? []
  const statuses = config.status ?? []
  const closeMode = config.closeButton ?? "none"

  const [size, setSize] = React.useState<string | undefined>(sizes[0])
  const [status, setStatus] = React.useState<string | undefined>(undefined)
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [long, setLong] = React.useState(true)
  const [closeOn, setCloseOn] = React.useState(closeMode === "default")
  const [liveOpen, setLiveOpen] = React.useState(false)
  const isSalt = theme === "salt"

  const shared = {
    config,
    size,
    status,
    title: "Cookie policy",
    preheader: "Privacy",
    description: "We use cookies to keep you signed in and to remember your preferences.",
    headerActions: <PlaceholderButton>Help</PlaceholderButton>,
    showCloseButton: closeMode === "none" ? undefined : closeOn,
  }

  return (
    <figure className="stage" data-theme={theme} data-mode={mode === "dark" ? "dark" : undefined} data-density={isSalt ? density : undefined}>
      <figcaption>
        {theme} · {mode} · close: {CLOSE_LABEL[closeMode]}
        <span className="cap-control">
          <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        </span>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => (
              <button key={d} disabled={d === density} onClick={() => setDensity(d)}>{d}</button>
            ))}
          </span>
        )}
        {sizes.length > 0 && (
          <span className="cap-control">
            {sizes.map((s) => (
              <button key={s} disabled={s === size} onClick={() => setSize(s)}>{s}</button>
            ))}
          </span>
        )}
        {statuses.length > 0 && (
          <span className="cap-control">
            <button disabled={status === undefined} onClick={() => setStatus(undefined)}>no status</button>
            {statuses.map((s) => (
              <button key={s} disabled={s === status} onClick={() => setStatus(s)}>{s}</button>
            ))}
          </span>
        )}
        <span className="cap-control">
          <button disabled={long} onClick={() => setLong(true)}>long content</button>
          <button disabled={!long} onClick={() => setLong(false)}>short content</button>
        </span>
        {closeMode !== "none" && (
          <span className="cap-control">
            <button disabled={closeOn} onClick={() => setCloseOn(true)}>close button</button>
            <button disabled={!closeOn} onClick={() => setCloseOn(false)}>no close button</button>
          </span>
        )}
      </figcaption>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        <span style={{ font: "11px/1.4 ui-monospace, monospace", color: "#71717a" }}>
          PINNED OPEN — bounded by this frame on purpose; it ignores Escape, outside presses and
          the focus trap so the page stays usable. Not a stuck dialog.
        </span>
        <div className="dialog-frame">
          <Dialog
            {...shared}
            id={`${theme}-pinned`}
            open
            forceOpen
            contained
            actions={
              <>
                <PlaceholderButton>Cancel</PlaceholderButton>
                <PlaceholderButton>Accept</PlaceholderButton>
              </>
            }
          >
            {long ? LONG : SHORT}
          </Dialog>
        </div>

        <span style={{ font: "11px/1.4 ui-monospace, monospace", color: "#71717a" }}>
          LIVE — a real modal: locks the page, suppresses the background, traps focus, returns it
          to this button, dismisses on Escape and on an outside press.
        </span>
        <div>
          <PlaceholderButton onClick={() => setLiveOpen(true)}>Open {theme} dialog</PlaceholderButton>
        </div>
        <Dialog
          {...shared}
          id={`${theme}-live`}
          open={liveOpen}
          onOpenChange={setLiveOpen}
          initialFocusIndex={1}
          actions={
            <>
              <PlaceholderButton onClick={() => setLiveOpen(false)}>Cancel</PlaceholderButton>
              <PlaceholderButton onClick={() => setLiveOpen(false)}>Accept</PlaceholderButton>
            </>
          }
        >
          {long ? LONG : SHORT}
        </Dialog>
      </div>
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header><b>Dialog — phase 2 validation</b></header>
      <div className="body">
        <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => <Stage key={t} theme={t} />)}
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
