/* Phase-2 validation harness for Combobox — same purpose as
   select-check.tsx/popover-check.tsx: render the generated CSS on the real
   skeleton and let the values be checked against each DS's own reference
   before moving on. Not the final registry page.

   FOUR SUB-STAGES PER THEME:
     1. LIVE INTERACTION — a real input; typing filters the list
        (behavior.filter/.registry-filter-default), ArrowDown/Up move a
        highlighted option while focus stays on the input
        (behavior.focus-model), Enter commits, Escape closes, an outside
        click dismisses.
     2. PARTS, forced open — group/group-label/separator/selected-marker/
        clear-button/toggle-button, forced on where the column's own config
        allows it.
     3. EMPTY STATE (structure.empty-state) — a query matching nothing,
        forced open, shows shadcn's real ComboboxEmpty affordance; Salt/M3
        show the CONFIRMED ABSENCE legend instead.
     4. DISABLED / READ-ONLY — where the column has the capability. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Combobox, type ComboboxConfig, type ComboboxOptionModel } from "../skeleton/combobox"
import configs from "../out/gen/combobox-config.json"
import panel from "../out/gen/combobox-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

const FRUITS: ComboboxOptionModel[] = [
  { value: "apple", label: "Apple" },
  { value: "apricot", label: "Apricot" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "cherry", label: "Cherry" },
  { value: "cranberry", label: "Cranberry", disabled: true },
  { value: "date", label: "Date" },
]

const GROUPED = [
  { label: "Citrus", options: [{ value: "orange", label: "Orange" }, { value: "lemon", label: "Lemon" }] },
  { label: "Berries", options: [{ value: "strawberry", label: "Strawberry" }, { value: "raspberry", label: "Raspberry" }] },
]

function Stage({ theme }: { theme: Theme }) {
  const config = (configs as Record<string, ComboboxConfig>)[theme]
  const isSalt = theme === "salt"
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")

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
          1 · live (behavior.filter / .focus-model / .enter-commits / .dismiss-escape / .dismiss-outside)
        </div>
        <div className="checkbox-row">
          <Combobox config={config} options={FRUITS} placeholder="Search fruit…" />
          <span className="checkbox-note">
            type to filter (case-insensitive substring), Arrow keys to highlight, Enter to commit, Escape to close.
            Real focus should stay on the input the whole time — check devtools' Elements panel, not this note.
          </span>
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">
          2 · parts, forced open (structure.option-group/.separator/.selected-marker/.clear-button/.toggle-button)
        </div>
        <div className="checkbox-row" style={{ position: "static" }}>
          <Combobox
            config={config}
            groups={GROUPED}
            defaultValue="orange"
            forceOpen
            className="static-item"
          />
        </div>
        {!config.group && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — structure.option-group is off for this column; options render ungrouped.</div>
        )}
        {!config.separator && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — structure.separator is off for this column.</div>
        )}
        {!config.clearButton && (
          <div className="checkbox-legend">CONFIRMED ABSENCE — structure.clear-button is off for this column.</div>
        )}
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">
          3 · empty state (structure.empty-state) — query matches nothing, forced open
        </div>
        <div className="checkbox-row" style={{ position: "static" }}>
          {config.emptyState ? (
            <EmptyStateDemo config={config} />
          ) : (
            <div className="checkbox-legend">CONFIRMED ABSENCE — structure.empty-state is off for this column; an unmatched filter renders an empty, zero-height popup with no message.</div>
          )}
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">4 · disabled / read-only</div>
        <div className="checkbox-row">
          <Combobox config={config} options={FRUITS} disabled defaultValue="apple" />
          {config.readOnly ? (
            <Combobox config={config} options={FRUITS} readOnly defaultValue="apple" />
          ) : (
            <span className="checkbox-legend">CONFIRMED ABSENCE — prop.read-only is off for this column.</span>
          )}
        </div>
      </div>
    </figure>
  )
}

/** Stage 3's own tiny harness: seeds a query that matches nothing so the
    real empty-state filtering branch renders (zero results out of FRUITS),
    rather than faking the branch with a static prop. */
function EmptyStateDemo({ config }: { config: ComboboxConfig }) {
  return (
    <Combobox
      config={config}
      options={FRUITS}
      initialQuery="zzz-no-match"
      forceOpen
      className="static-item"
      emptyStateText="No items found."
    />
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>Combobox — phase 2 validation</b>
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
        .static-item [data-slot="combobox-popup"] { position: static !important; }
      `}</style>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
