/* Shared side panel: every row of a component's generated panel data
   (contract/templates/<name>.template.json x columns/<name>.*.json, via
   2-build/tools/gen-from-template.py's panel output), grouped by piece,
   for one theme at a time. Read-only readout — registry.tsx (calendar)
   has the richer, stage-wired version of this; this is the same display
   half, reused across every other component's check page so each one
   gets a "side panel with all the values" without re-deriving it. */
import * as React from "react"

const PIECES: Array<[string, string]> = [
  ["structure", "Anatomy"], ["behavior", "Behavior"], ["prop", "Props"],
  ["slot", "Slots"], ["state", "States"], ["style", "Styles"],
]

export function ThemeTabs({ themes, active, onChange }:
  { themes: readonly string[]; active: string; onChange: (t: string) => void }) {
  return (
    <nav className="tabs">
      {themes.map((t) => (
        <button key={t} data-active={t === active || undefined} onClick={() => onChange(t)}>{t}</button>
      ))}
    </nav>
  )
}

export function ValuePanel({ theme, panel }: { theme: string; panel: any }) {
  return (
    <aside className="panel">
      {PIECES.map(([piece, title]) => {
        const rows = (panel.rows || []).filter((r: any) => r.piece === piece)
        if (!rows.length) return null
        return (
          <section key={piece}>
            <h2>{title}</h2>
            {piece === "behavior" && panel.behavior?.pattern && (
              <p className="pattern">{panel.behavior.pattern}</p>
            )}
            {rows.map((r: any) => {
              const cell = r.cells?.[theme] ?? { display: "template-owned" }
              const notApplicable = cell.kind === "off"
              return (
                <div className="row" key={r.id} data-kind={cell.kind}>
                  <div className="row-head">
                    <code>{r.id.replace(/^[a-z]+\./, "")}</code>
                    <span className="policy" data-policy={notApplicable ? "not-applicable" : r.policy}>
                      {notApplicable ? "not applicable" : r.policy}
                    </span>
                  </div>
                  <div className="cell">{cell.display}</div>
                  {(cell.source || cell.note || r.note) && (
                    <div className="src">{cell.source ?? cell.note ?? r.note}</div>
                  )}
                </div>
              )
            })}
          </section>
        )
      })}
    </aside>
  )
}
