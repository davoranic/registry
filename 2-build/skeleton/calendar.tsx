/* Calendar skeleton — written from the APG grid/date-picker pattern for the
   template union. Inherits from no design system: every structural or
   content-format difference between systems is a parameter received from
   the generated per-theme config. */
import * as React from "react"

export interface CalendarConfig {
  navVariant: "caption" | "month-year-dropdowns" | "month-menu"
  weekdayFormat: "narrow" | "short"
  dayFormat: "numeric" | "2-digit"
  outsideDays: "muted" | "hidden"
  gridWeeks: "variable" | "fixed-6"
  selectionCommit: "immediate" | "confirm"
  range?: boolean
  header?: boolean
  inputToggle?: boolean
  actions?: boolean
  todayMarker?: boolean
  densities?: string[] | null
}

export interface CalendarRange { from: Date; to?: Date }
export interface CalendarProps {
  config: CalendarConfig
  defaultMonth?: Date
  selected?: Date | null
  selectedRange?: CalendarRange | null
  locale?: string
  "aria-label"?: string
}

/* All date arithmetic is calendar-based (year/month/day fields), never
   millisecond-based: fixed 24h blocks break on DST-transition days
   (2026-11-01 has 25 hours in US timezones — caught by the owner). */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

function monthGrid(month: Date, fixedSix: boolean): Date[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = addDays(first, -first.getDay())
  const weeks: Date[][] = []
  for (let w = 0; w < 6; w++) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i))
    if (!fixedSix && w > 0 && !sameMonth(week[0], month) && week[0] > first) break
    weeks.push(week)
  }
  return weeks
}

function Chevron({ dir }: { dir: "left" | "right" | "down" }) {
  /* neutral geometric placeholder — per-system icon sets are a declared
     deferral in the template (slot.icons row) */
  const d = dir === "left" ? "M7.5 2 3.5 6l4 4" : dir === "right" ? "M4.5 2l4 4-4 4" : "M2 4.5l4 4 4-4"
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={d} /></svg>
}

export function Calendar({ config, defaultMonth, selected: selectedProp, selectedRange, locale = "en-US", "aria-label": ariaLabel }: CalendarProps) {
  const today = startOfDay(new Date())
  const [committed, setCommitted] = React.useState<Date | null>(selectedProp ? startOfDay(selectedProp) : null)
  const [pending, setPending] = React.useState<Date | null>(committed)
  const [month, setMonth] = React.useState(startOfDay(defaultMonth ?? committed ?? today))
  const [focused, setFocused] = React.useState<Date>(committed ?? today)
  const [inputMode, setInputMode] = React.useState(false)
  const gridRef = React.useRef<HTMLTableElement>(null)
  const captionId = React.useId()

  const selected = config.selectionCommit === "confirm" ? pending : committed
  const range = config.range ? selectedRange : null

  const monthFmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
  const monthOnlyFmt = new Intl.DateTimeFormat(locale, { month: "short" })
  const headlineFmt = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" })
  const dayLabelFmt = new Intl.DateTimeFormat(locale, { dateStyle: "full" })
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: config.weekdayFormat })

  const fmtDay = (d: Date) => config.dayFormat === "2-digit" ? String(d.getDate()).padStart(2, "0") : String(d.getDate())

  const inRange = (d: Date) => {
    if (!range) return false
    const { from, to } = range
    if (!to) return sameDay(d, from)
    return d >= startOfDay(from) && d <= startOfDay(to)
  }
  const rangePos = (d: Date) => {
    if (!range) return undefined
    const { from, to } = range
    if (sameDay(d, from)) return "start"
    if (to && sameDay(d, to)) return "end"
    if (to && d > startOfDay(from) && d < startOfDay(to)) return "middle"
    return undefined
  }
  const isChosen = (d: Date) => (selected && sameDay(d, selected)) || inRange(d)

  const select = (d: Date) => {
    if (config.selectionCommit === "confirm") setPending(d)
    else setCommitted(d)
  }
  const moveFocus = (d: Date) => {
    const target = startOfDay(d)
    setFocused(target)
    if (!sameMonth(target, month)) setMonth(new Date(target.getFullYear(), target.getMonth(), 1))
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${iso(target)}"]`)?.focus()
    })
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const f = focused
    const jump: Record<string, () => Date> = {
      ArrowLeft: () => addDays(f, -1),
      ArrowRight: () => addDays(f, 1),
      ArrowUp: () => addDays(f, -7),
      ArrowDown: () => addDays(f, 7),
      Home: () => addDays(f, -f.getDay()),
      End: () => addDays(f, 6 - f.getDay()),
      PageUp: () => new Date(f.getFullYear(), f.getMonth() - 1, Math.min(f.getDate(), 28)),
      PageDown: () => new Date(f.getFullYear(), f.getMonth() + 1, Math.min(f.getDate(), 28)),
    }
    if (jump[e.key]) { e.preventDefault(); moveFocus(jump[e.key]()) }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(f) }
  }

  const weeks = monthGrid(month, config.gridWeeks === "fixed-6")
  const weekdays = weeks[0].map((d) => weekdayFmt.format(d))
  const years = Array.from({ length: 12 }, (_, i) => month.getFullYear() - 6 + i)
  const goMonth = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))

  return (
    <div data-slot="calendar" aria-label={ariaLabel}>
      {config.header && (
        <div data-slot="header">
          <div data-slot="header-label">Select date</div>
          <div data-slot="header-row">
            <div data-slot="header-headline">{selected ? headlineFmt.format(selected) : "—"}</div>
            {config.inputToggle && (
              <button type="button" data-slot="nav-next" aria-label={inputMode ? "Switch to calendar" : "Switch to text input"}
                      onClick={() => setInputMode(!inputMode)}>
                {inputMode ? <Chevron dir="down" /> : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M9.5 1.5l3 3L5 12H2v-3z" /></svg>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {inputMode ? (
        <input type="date" value={selected ? iso(selected) : ""} aria-label="Date"
               onChange={(e) => { const v = e.target.valueAsDate; if (v) select(startOfDay(new Date(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()))) }}
               style={{ font: "inherit", padding: 8, inlineSize: "100%", boxSizing: "border-box" }} />
      ) : (
        <>
          <div data-slot="nav" data-variant={config.navVariant}>
            {config.navVariant === "month-menu" && (
              <span data-slot="caption" id={captionId}>
                <span data-slot="dropdown-wrap">
                  <select data-slot="month-select" data-variant="menu" aria-label="Month and year" value={month.getMonth()}
                          onChange={(e) => setMonth(new Date(month.getFullYear(), Number(e.target.value), 1))}>
                    {Array.from({ length: 12 }, (_, m) => (
                      <option key={m} value={m}>{monthFmt.format(new Date(month.getFullYear(), m, 1))}</option>
                    ))}
                  </select>
                  <Chevron dir="down" />
                </span>
              </span>
            )}
            <button type="button" data-slot="nav-previous" aria-label="Previous month" onClick={() => goMonth(-1)}><Chevron dir="left" /></button>
            {config.navVariant === "caption" && (
              <span data-slot="caption" id={captionId} aria-live="polite">{monthFmt.format(month)}</span>
            )}
            {config.navVariant === "month-year-dropdowns" && (
              <span data-slot="caption" id={captionId}>
                <span data-slot="dropdown-wrap">
                  <select data-slot="month-select" aria-label="Month" value={month.getMonth()}
                          onChange={(e) => setMonth(new Date(month.getFullYear(), Number(e.target.value), 1))}>
                    {Array.from({ length: 12 }, (_, m) => (
                      <option key={m} value={m}>{monthOnlyFmt.format(new Date(2000, m, 1))}</option>
                    ))}
                  </select>
                  <Chevron dir="down" />
                </span>{" "}
                <span data-slot="dropdown-wrap">
                  <select data-slot="year-select" aria-label="Year" value={month.getFullYear()}
                          onChange={(e) => setMonth(new Date(Number(e.target.value), month.getMonth(), 1))}>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <Chevron dir="down" />
                </span>
              </span>
            )}
            <button type="button" data-slot="nav-next" aria-label="Next month" onClick={() => goMonth(1)}><Chevron dir="right" /></button>
          </div>

          <table data-slot="grid" role="grid" aria-labelledby={captionId} ref={gridRef} onKeyDown={onKeyDown}>
            <thead>
              <tr data-slot="weekday-row" role="row">
                {weekdays.map((w, i) => <th key={i} data-slot="weekday" role="columnheader" scope="col">{w}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi} data-slot="week-row" role="row">
                  {week.map((date) => {
                    const outside = !sameMonth(date, month)
                    if (outside && config.outsideDays === "hidden")
                      return <td key={iso(date)} data-slot="day" role="gridcell" aria-hidden="true" />
                    const chosen = isChosen(date)
                    const pos = rangePos(date)
                    return (
                      <td key={iso(date)} data-slot="day" role="gridcell" data-range={pos}
                          data-state={chosen ? "selected" : undefined} aria-selected={chosen || undefined}>
                        <button type="button" data-slot="day-button" data-date={iso(date)}
                                data-state={chosen ? "selected" : undefined}
                                data-today={sameDay(date, today) ? "" : undefined}
                                data-outside={outside ? "" : undefined}
                                tabIndex={sameDay(date, focused) ? 0 : -1}
                                aria-label={dayLabelFmt.format(date)}
                                onClick={() => { moveFocus(date); select(date) }}>
                          {fmtDay(date)}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {config.actions && (
        <div data-slot="actions">
          <button type="button" data-slot="action-cancel" onClick={() => setPending(committed)}>Cancel</button>
          <button type="button" data-slot="action-ok" onClick={() => { if (pending) setCommitted(pending) }}>OK</button>
        </div>
      )}
    </div>
  )
}
