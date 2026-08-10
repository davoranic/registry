/* Phase-2 validation harness for Table — same purpose as toggle-group-
   check.tsx/combobox-check.tsx: render the generated CSS on the real
   skeleton and let the values be checked against each DS's own reference
   before moving on. Not the final registry page.

   FOUR STAGES PER THEME:
     1. FULL TABLE — header/body/footer/caption, 6 rows x 4 columns
        (structure.*, style.header.text/.body.text/.footer.text/.caption.text,
        style.cell.padding, prop.align on the numeric column).
     2. ROW STATES — rest / hover (real :hover, drive with the mouse) /
        selected / disabled, one row each (state.row.*, style.row.*).
     3. ZEBRA / VARIANT / DIVIDER — Salt only; shadcn/M3 render the
        CONFIRMED ABSENCE legend (prop.zebra/.variant/.divider).
     4. STICKY HEADER + FOOTER in a height-constrained scroll box — Salt
        only (prop.sticky-header/-footer); shadcn/M3 render the CONFIRMED
        ABSENCE legend. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHeadCell,
  TableCell,
  type TableConfig,
} from "../skeleton/table"
import configs from "../out/gen/table-config.json"
import panel from "../out/gen/table-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

const PEOPLE = [
  { name: "Ava Chen", status: "Active", role: "Engineer", amount: "$4,200.00" },
  { name: "Marcus Webb", status: "Active", role: "Designer", amount: "$3,150.00" },
  { name: "Priya Nair", status: "Invited", role: "Engineer", amount: "$0.00" },
  { name: "Diego Ramos", status: "Active", role: "Product", amount: "$5,400.00" },
  { name: "Sofia Kessler", status: "Suspended", role: "Support", amount: "$1,980.00" },
  { name: "Ken Osei", status: "Active", role: "Engineer", amount: "$4,750.00" },
]

function Stage({ theme }: { theme: Theme }) {
  const config = (configs as Record<string, TableConfig>)[theme]
  const isSalt = theme === "salt"
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const supportsZebra = config.zebra?.includes(true)
  const supportsVariant = (config.variant?.length ?? 0) > 0
  const supportsDivider = (config.divider?.length ?? 0) > 0
  const supportsSticky = config.stickyHeader?.includes(true) || config.stickyFooter?.includes(true)

  const total = PEOPLE.reduce((sum, p) => sum + Number(p.amount.replace(/[$,]/g, "")), 0)

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
          1 · full table — header/body/footer/caption (structure.* · style.header.text/.body.text/.footer.text/.caption.text · style.cell.padding · prop.align)
        </div>
        <div className="checkbox-row">
          <Table config={config} variant={config.variant?.[0]} align="left" caption="Team roster and total compensation.">
            <TableHeader config={config}>
              <TableRow>
                <TableHeadCell config={config}>Name</TableHeadCell>
                <TableHeadCell config={config}>Status</TableHeadCell>
                <TableHeadCell config={config}>Role</TableHeadCell>
                <TableHeadCell config={config} align="right">Amount</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PEOPLE.map((p) => (
                <TableRow key={p.name}>
                  <TableCell config={config}>{p.name}</TableCell>
                  <TableCell config={config}>{p.status}</TableCell>
                  <TableCell config={config}>{p.role}</TableCell>
                  <TableCell config={config} align="right">{p.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter config={config}>
              <TableRow>
                <TableCell config={config} colSpan={3}>Total</TableCell>
                <TableCell config={config} align="right">
                  {"$" + total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">2 · row states — rest / hover (drive with the mouse) / selected / disabled (state.row.* · style.row.*)</div>
        <div className="checkbox-row">
          <Table config={config} aria-label="Row states">
            <TableHeader config={config}>
              <TableRow>
                <TableHeadCell config={config}>Row</TableHeadCell>
                <TableHeadCell config={config}>Note</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell config={config}>Rest</TableCell>
                <TableCell config={config}>plain row — hover it with the mouse</TableCell>
              </TableRow>
              <TableRow selected>
                <TableCell config={config}>Selected</TableCell>
                <TableCell config={config}>data-state="selected" — static demo, see behavior.row-selection</TableCell>
              </TableRow>
              <TableRow disabled>
                <TableCell config={config}>Disabled</TableCell>
                <TableCell config={config}>data-disabled — M3 only has a real rule for this row</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">3 · zebra / variant / divider (prop.zebra / prop.variant / prop.divider)</div>
        <div className="checkbox-row">
          {supportsZebra || supportsVariant || supportsDivider ? (
            <Table config={config} variant={config.variant?.[1] ?? config.variant?.[0]} zebra divider={config.divider?.[0]} aria-label="Zebra / variant / divider">
              <TableBody>
                {PEOPLE.slice(0, 5).map((p) => (
                  <TableRow key={p.name}>
                    <TableCell config={config}>{p.name}</TableCell>
                    <TableCell config={config}>{p.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <span className="checkbox-legend">CONFIRMED ABSENCE — no tone-variant/zebra/divider axis for this column.</span>
          )}
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">4 · sticky header + footer, in a height-constrained scroll box (prop.sticky-header / prop.sticky-footer)</div>
        <div className="checkbox-row">
          {supportsSticky ? (
            <Table
              config={config}
              aria-label="Sticky header/footer"
              containerStyle={{ height: "160px", border: "1px solid #ccc" }}
            >
              <TableHeader config={config} sticky>
                <TableRow>
                  <TableHeadCell config={config}>Name</TableHeadCell>
                  <TableHeadCell config={config} align="right">Amount</TableHeadCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...PEOPLE, ...PEOPLE].map((p, i) => (
                  <TableRow key={p.name + i}>
                    <TableCell config={config}>{p.name}</TableCell>
                    <TableCell config={config} align="right">{p.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter config={config} sticky>
                <TableRow>
                  <TableCell config={config}>Total</TableCell>
                  <TableCell config={config} align="right">scroll to see it pin</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <span className="checkbox-legend">CONFIRMED ABSENCE — no sticky-header/-footer capability for this column.</span>
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
        <b>Table — phase 2 validation</b>
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
