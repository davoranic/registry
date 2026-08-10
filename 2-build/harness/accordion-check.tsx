/* Phase-2 validation harness for Accordion — same purpose as
   dropdown-menu-check.tsx/toast-check.tsx: render the generated CSS on the
   real skeleton and let the values be checked against each DS's own
   reference before moving on. Not the final registry page.

   FOUR SUB-STAGES PER THEME:
     1. LIVE INTERACTION — a real group; click/keyboard toggles items, the
        single-vs-multiple/collapsible axis is exercised where the column
        supports it (shadcn), Salt's own independent-per-item behaviour is
        left exactly as its config leaves it (no type axis at all).
     2. PARTS, forced open — icon / status / disabled, forced on where the
        column's own config allows it.
     3. INDICATOR SIDE — Salt only; left (default, indented content) vs
        right, side by side.
     4. M3 — CONFIRMED ABSENCE, printed rather than a fake render (see
        ACCORDION-MATRIX.md §0 — M3 has no accordion at all). */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Accordion, type AccordionConfig, type AccordionItemModel } from "../skeleton/accordion"
import configs from "../out/gen/accordion-config.json"
import panel from "../out/gen/accordion-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

function baseItems(config: AccordionConfig): AccordionItemModel[] {
  return [
    { value: "info", trigger: "Product information", content: "Our flagship product combines cutting-edge technology with sleek design." },
    { value: "ship", trigger: "Shipping details", content: "Standard delivery takes 3-5 business days; express ships in 1-2." },
    {
      value: "ret",
      trigger: "Return policy",
      content: "A 30-day return policy applies to every order.",
      status: config.status?.includes("warning") ? "warning" : undefined,
    },
    { value: "sup", trigger: "Support (disabled)", content: "Not shown — disabled.", disabled: true },
  ]
}

function Stage({ theme }: { theme: Theme }) {
  const config = (configs as Record<string, AccordionConfig>)[theme]
  const isSalt = theme === "salt"
  const isM3 = theme === "m3"
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [expanded, setExpanded] = React.useState<string[]>(["info"])

  const items = React.useMemo(() => baseItems(config), [config])

  if (isM3) {
    return (
      <figure className="stage" data-theme={theme}>
        <figcaption>{theme}</figcaption>
        <div className="checkbox-block">
          <div className="checkbox-legend">
            CONFIRMED ABSENCE — no accordion, expansion-panel, or disclosure component or token family exists anywhere in 3-source/material-web (checked by both a name grep across the whole clone and a directory listing of every top-level component folder). See ACCORDION-MATRIX.md §0.
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
          1 · live (behavior.expand-toggle{config.type ? " / prop.type=" + JSON.stringify(config.type) : ""}{config.arrowNav ? " / behavior.arrow-navigation" : ""})
        </div>
        <div className="checkbox-row">
          <Accordion
            config={config}
            items={items}
            type={config.type ? "single" : undefined}
            collapsible={Boolean(config.collapsible)}
            value={expanded}
            onValueChange={setExpanded}
          />
          <span className="checkbox-note">expanded: {expanded.join(", ") || "(none)"}</span>
        </div>
        {!config.type && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — prop.type is off for this column; every item toggles independently (no group-level exclusivity, see behavior.exclusive-expand).</div>
        )}
        {!config.arrowNav && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — behavior.arrow-navigation is off for this column; Tab is the only way to move between triggers.</div>
        )}
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">2 · parts, forced open (structure.icon / .status-icon / behavior.disabled-item)</div>
        <div className="checkbox-row" style={{ position: "static" }}>
          <Accordion config={config} items={items} forceOpen={["info", "ret"]} className="static-item" />
        </div>
        {!config.status && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — structure.status-icon / prop.status is off for this column.</div>
        )}
      </div>

      {isSalt && (
        <div className="checkbox-block">
          <div className="checkbox-caption">3 · indicator side (prop.indicator-side — Salt only)</div>
          <div className="checkbox-row" style={{ position: "static", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div className="checkbox-note">left (default, indented content)</div>
              <Accordion config={config} items={items.slice(0, 2)} indicatorSide="left" forceOpen={["info"]} className="static-item" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="checkbox-note">right</div>
              <Accordion config={config} items={items.slice(0, 2)} indicatorSide="right" forceOpen={["info"]} className="static-item" />
            </div>
          </div>
        </div>
      )}
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>Accordion — phase 2 validation</b>
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
