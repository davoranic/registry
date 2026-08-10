/* Phase-2 validation harness for Dropdown menu — same purpose as
   slider-check.tsx/toast-check.tsx: render the generated CSS on the real
   skeleton and let the values be checked against each DS's own reference
   before moving on. Not the final registry page.

   FOUR SUB-STAGES PER THEME:
     1. OPEN + KEYBOARD ACTIVATION — a live trigger; ArrowDown opens it and
        moves the active item, Enter activates the last-selected item
        (echoed below), Escape closes.
     2. PARTS — icon / shortcut / group + group-label, forced on where the
        column's own config allows it (structure.item-icon/.item-shortcut/
        .group/.group-label).
     3. SUBMENU — one level of real nesting; ArrowRight/hover open it,
        ArrowLeft/Escape close it, forced open here so the geometry can be
        inspected without simulating a real hover.
     4. DESTRUCTIVE ITEM — shadcn only (prop.item-variant); other columns
        print the confirmed absence instead of a fake render. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { DropdownMenu, type DropdownMenuConfig, type MenuNode } from "../skeleton/dropdown-menu"
import configs from "../out/gen/dropdown-menu-config.json"
import panel from "../out/gen/dropdown-menu-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

function baseItems(config: DropdownMenuConfig): MenuNode[] {
  return [
    { type: "item", value: "new", label: "New file", icon: true, shortcut: "⌘N" },
    { type: "item", value: "open", label: "Open…", icon: true, shortcut: "⌘O" },
    { type: "separator" },
    {
      type: "group",
      label: "Recent",
      items: [
        { type: "item", value: "r1", label: "report.pdf" },
        { type: "item", value: "r2", label: "notes.md", disabled: true },
      ],
    },
    { type: "separator" },
    {
      type: "submenu",
      value: "share",
      label: "Share",
      icon: true,
      items: [
        { type: "item", value: "share-link", label: "Copy link" },
        { type: "item", value: "share-email", label: "Email…" },
      ],
    },
  ]
}

function Stage({ theme }: { theme: Theme }) {
  const config = (configs as Record<string, DropdownMenuConfig>)[theme]
  const isSalt = theme === "salt"
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [lastSelected, setLastSelected] = React.useState<string | null>(null)

  const items = React.useMemo(() => baseItems(config), [config])

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
          1 · open + keyboard (behavior.trigger-interaction / .arrow-navigation / .item-activation / .dismiss-escape)
        </div>
        <div className="checkbox-row">
          <DropdownMenu config={config} items={items} trigger="Actions" onSelect={(v) => setLastSelected(v)} />
          <span className="checkbox-note">
            last selected: {lastSelected ?? "(none)"} — click Actions, then ArrowDown/Enter, or Escape to close
          </span>
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">
          2 · parts (structure.item-icon={String(!!config.itemIcon)} / .item-shortcut={String(!!config.itemShortcut)} / .group={String(!!config.group)} / .group-label={String(!!config.groupLabel)})
        </div>
        <div className="checkbox-row" style={{ position: "static" }}>
          <DropdownMenu config={config} items={items} trigger="Actions" forceOpen className="static-item" />
        </div>
        {!config.itemShortcut && <div className="checkbox-legend">CONFIRMED ABSENCE — structure.item-shortcut is off for this column.</div>}
        {!config.group && <div className="checkbox-legend">CONFIRMED ABSENCE — structure.group is off for this column (items render flat).</div>}
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">3 · submenu, forced open (structure.submenu-trigger / .submenu-popup, behavior.submenu-open/.submenu-close)</div>
        <div className="checkbox-row" style={{ position: "static" }}>
          <DropdownMenuForcedSubmenu config={config} items={items} />
        </div>
      </div>

      <div className="checkbox-block">
        <div className="checkbox-caption">4 · destructive item (prop.item-variant)</div>
        {config.itemVariant ? (
          <div className="checkbox-row" style={{ position: "static" }}>
            <DropdownMenu
              config={config}
              trigger="Actions"
              forceOpen
              className="static-item"
              items={[
                { type: "item", value: "rename", label: "Rename" },
                { type: "item", value: "delete", label: "Delete", variant: "destructive" },
              ]}
            />
          </div>
        ) : (
          <div className="checkbox-legend">CONFIRMED ABSENCE — prop.item-variant is off for this column, no destructive axis.</div>
        )}
      </div>
    </figure>
  )
}

/** Stage 3's own tiny harness component: opens the root menu AND forces its
    one submenu open at mount, so the nested popup's geometry is inspectable
    without simulating a real hover/ArrowRight sequence here. Uses the SAME
    DropdownMenu component — forceOpen opens the root, and a synthetic
    ArrowRight on mount opens the submenu via the real keyboard path. */
function DropdownMenuForcedSubmenu({ config, items }: { config: DropdownMenuConfig; items: MenuNode[] }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const root = ref.current
    if (!root) return
    const id = window.setTimeout(() => {
      const trigger = root.querySelector<HTMLElement>('[data-slot="dropdown-menu-trigger"]')
      trigger?.click()
      window.setTimeout(() => {
        const submenuTrigger = root.querySelector<HTMLElement>('[data-slot="dropdown-menu-submenu-trigger"]')
        submenuTrigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      }, 0)
    }, 0)
    return () => window.clearTimeout(id)
  }, [])
  return (
    <div ref={ref}>
      <DropdownMenu config={config} items={items} trigger="Actions" className="static-item" />
    </div>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>Dropdown menu — phase 2 validation</b>
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
        .static-item [data-slot="dropdown-menu-popup"] { position: static !important; }
        .static-item [data-slot="dropdown-menu-submenu-popup"] { position: absolute !important; }
      `}</style>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
