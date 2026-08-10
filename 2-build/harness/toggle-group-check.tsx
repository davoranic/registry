/* Phase-2 validation harness for Toggle-group — same purpose as
   radio-group-check.tsx/combobox-check.tsx: render the generated CSS on the
   real skeleton and let the values be checked against each DS's own
   reference before moving on. Not the final registry page.

   FOUR STAGES PER THEME:
     1. SINGLE-SELECT, icon+label items (structure.item/.selected-marker,
        state.rest/.selected/.hover/.focus/.pressed) — click cycles which
        item is pressed; clicking the pressed item again deselects it
        (behavior, see the skeleton's own file banner for the sourced
        Salt divergence).
     2. MULTIPLE-SELECT, icon-only items, where the column's own config
        allows it (prop.selection-mode) — several items independently on
        at once. Salt's own config never advertises "multiple", so its
        stage 2 renders the CONFIRMED ABSENCE legend instead of a live demo.
     3. VERTICAL orientation, where the column's own config allows it
        (prop.orientation) — M3 shows the CONFIRMED ABSENCE legend.
     4. DISABLED (item + group) / VALIDATION, where each capability exists. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { ToggleGroup, ToggleGroupItem, type ToggleGroupConfig } from "../skeleton/toggle-group"
import configs from "../out/gen/toggle-group-config.json"
import panel from "../out/gen/toggle-group-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

function BoldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4h7a4 4 0 010 8H6zM6 12h8a4 4 0 010 8H6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
function ItalicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 4h8M6 20h8M14 4L10 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function UnderlineIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4v7a6 6 0 0012 0V4M4 20h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Stage({ theme }: { theme: Theme }) {
  const config = (configs as Record<string, ToggleGroupConfig>)[theme]
  const isSalt = theme === "salt"
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const supportsMultiple = config.selectionMode?.includes("multiple")
  const supportsVertical = config.orientation?.includes("vertical")

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
          1 · single-select, icon+label (structure.item/.selected-marker · state.rest/.selected/.hover/.focus/.pressed)
        </div>
        <div className="checkbox-row">
          <ToggleGroup config={config} mode="single" defaultValue="bold" aria-label="Text formatting (single)">
            <ToggleGroupItem config={config} value="bold" icon={<BoldIcon />} aria-label="Bold">Bold</ToggleGroupItem>
            <ToggleGroupItem config={config} value="italic" icon={<ItalicIcon />} aria-label="Italic">Italic</ToggleGroupItem>
            <ToggleGroupItem config={config} value="underline" icon={<UnderlineIcon />} aria-label="Underline">Underline</ToggleGroupItem>
          </ToggleGroup>
          <span className="checkbox-note">click a pressed item again to deselect it (single mode)</span>
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">2 · multiple-select, icon-only (prop.selection-mode)</div>
        <div className="checkbox-row">
          {supportsMultiple ? (
            <ToggleGroup config={config} mode="multiple" defaultValue={["bold", "underline"]} aria-label="Text formatting (multiple)">
              <ToggleGroupItem config={config} value="bold" icon={<BoldIcon />} aria-label="Bold" />
              <ToggleGroupItem config={config} value="italic" icon={<ItalicIcon />} aria-label="Italic" />
              <ToggleGroupItem config={config} value="underline" icon={<UnderlineIcon />} aria-label="Underline" />
            </ToggleGroup>
          ) : (
            <span className="checkbox-legend">CONFIRMED ABSENCE — prop.selection-mode has no "multiple" value for this column; Salt's real ToggleButtonGroup is single-select-only despite its own Value type permitting an array.</span>
          )}
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">3 · vertical orientation (prop.orientation)</div>
        <div className="checkbox-row">
          {supportsVertical ? (
            <ToggleGroup config={config} mode="single" orientation="vertical" defaultValue="light" aria-label="Mode (vertical)">
              <ToggleGroupItem config={config} value="light" aria-label="Light">Light</ToggleGroupItem>
              <ToggleGroupItem config={config} value="dark" aria-label="Dark">Dark</ToggleGroupItem>
              <ToggleGroupItem config={config} value="system" aria-label="System">System</ToggleGroupItem>
            </ToggleGroup>
          ) : (
            <span className="checkbox-legend">CONFIRMED ABSENCE — prop.orientation is off for this column; M3's own grid layout is hardcoded horizontal-only.</span>
          )}
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">4 · disabled (item + group) / validation</div>
        <div className="checkbox-row">
          <ToggleGroup config={config} mode="single" defaultValue="a" aria-label="Item-disabled demo">
            <ToggleGroupItem config={config} value="a" aria-label="A">A</ToggleGroupItem>
            <ToggleGroupItem config={config} value="b" aria-label="B" disabled>B</ToggleGroupItem>
            <ToggleGroupItem config={config} value="c" aria-label="C">C</ToggleGroupItem>
          </ToggleGroup>
          {Array.isArray(config.groupDisabled) && config.groupDisabled.includes(true) ? (
            <ToggleGroup config={config} mode="single" defaultValue="a" disabled aria-label="Group-disabled demo">
              <ToggleGroupItem config={config} value="a" aria-label="A">A</ToggleGroupItem>
              <ToggleGroupItem config={config} value="b" aria-label="B">B</ToggleGroupItem>
            </ToggleGroup>
          ) : (
            <span className="checkbox-legend">CONFIRMED ABSENCE — prop.group-disabled is off for this column.</span>
          )}
          {Array.isArray(config.validation) && config.validation.includes("error") ? (
            <ToggleGroup config={config} mode="single" defaultValue="a" validation="error" aria-label="Validation demo">
              <ToggleGroupItem config={config} value="a" aria-label="A">A</ToggleGroupItem>
              <ToggleGroupItem config={config} value="b" aria-label="B">B</ToggleGroupItem>
            </ToggleGroup>
          ) : (
            <span className="checkbox-legend">CONFIRMED ABSENCE — prop.validation is off for this column.</span>
          )}
        </div>
      </div>
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>Toggle-group — phase 2 validation</b>
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
