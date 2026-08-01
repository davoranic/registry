import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import "./calendar.css"

export interface CalendarRange {
  from: Date
  to?: Date | null
}

export interface CalendarProps {
  /* the displayed month; uncontrolled when only defaultMonth is given */
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  selected?: Date | null
  onSelect?: (date: Date) => void
  /* range position is an ANNOTATION on the day part, not a canonical state:
     it composes with selected rather than replacing it */
  selectedRange?: CalendarRange | null
  isDateUnavailable?: (date: Date) => boolean
  showWeekNumbers?: boolean
  weekStartsOn?: 0 | 1
  readOnly?: boolean
  locale?: string
  /* names the grid together with the month caption */
  label?: string
}

/* ---- date helpers (no dependencies; all arithmetic is local-time) ---- */
const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())
const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1)
const addDays = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
const addMonths = (date: Date, amount: number) => {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1)
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate()
  return new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(date.getDate(), lastDay)
  )
}
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()
const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`

/* ISO 8601 week number */
const weekNumber = (date: Date) => {
  const target = startOfDay(date)
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7))
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  firstThursday.setDate(
    firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7)
  )
  return (
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
  )
}

/* APG grid pattern as used by the Date Picker Dialog: a role=grid of week rows
   and day gridcells with a roving tabindex, arrows by day and week, Home/End
   across the week, PageUp/PageDown by month (Shift by year), Enter/Space to
   select. Every day button's accessible name is its full date. */
function Calendar({
  month,
  defaultMonth,
  onMonthChange,
  selected,
  onSelect,
  selectedRange,
  isDateUnavailable,
  showWeekNumbers = false,
  weekStartsOn = 0,
  readOnly = false,
  locale,
  label = "Calendar",
}: CalendarProps) {
  const captionId = React.useId()
  const gridRef = React.useRef<HTMLTableElement>(null)
  const shouldFocus = React.useRef(false)

  const today = React.useMemo(() => startOfDay(new Date()), [])
  const initialMonth = month ?? defaultMonth ?? selected ?? today
  const [focusedDate, setFocusedDate] = React.useState(() =>
    startOfDay(selected ?? initialMonth)
  )

  /* the displayed month follows the controlled prop when there is one */
  const displayedMonth = month ? startOfMonth(month) : startOfMonth(focusedDate)

  const captionFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale]
  )
  const dayFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale]
  )
  const weekdayShort = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale]
  )
  const weekdayLong = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "long" }),
    [locale]
  )

  /* six weeks so the grid never reflows between months */
  const weeks = React.useMemo(() => {
    const first = startOfMonth(displayedMonth)
    const offset = (first.getDay() - weekStartsOn + 7) % 7
    const start = addDays(first, -offset)
    return Array.from({ length: 6 }, (_, week) =>
      Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day))
    )
  }, [displayedMonth, weekStartsOn])

  const weekdays = weeks[0]

  React.useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    gridRef.current
      ?.querySelector<HTMLButtonElement>(
        `[data-slot="day-button"][data-date="${isoDate(focusedDate)}"]`
      )
      ?.focus()
  }, [focusedDate, displayedMonth])

  const goTo = (date: Date, focus = true) => {
    shouldFocus.current = focus
    setFocusedDate(startOfDay(date))
    if (!isSameMonth(date, displayedMonth)) onMonthChange?.(startOfMonth(date))
  }

  const unavailable = (date: Date) => Boolean(isDateUnavailable?.(date))

  const select = (date: Date) => {
    if (readOnly || unavailable(date)) return
    onSelect?.(startOfDay(date))
  }

  const isSelected = (date: Date) => {
    if (selected && isSameDay(date, selected)) return true
    if (!selectedRange) return false
    const { from, to } = selectedRange
    if (to) return date >= startOfDay(from) && date <= startOfDay(to)
    return isSameDay(date, from)
  }

  const rangePosition = (date: Date) => {
    if (!selectedRange) return undefined
    const { from, to } = selectedRange
    if (!to) return isSameDay(date, from) ? "start" : undefined
    if (isSameDay(date, from)) return "start"
    if (isSameDay(date, to)) return "end"
    if (date > startOfDay(from) && date < startOfDay(to)) return "middle"
    return undefined
  }

  const onGridKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault()
        goTo(addDays(focusedDate, -1))
        return
      case "ArrowRight":
        event.preventDefault()
        goTo(addDays(focusedDate, 1))
        return
      case "ArrowUp":
        event.preventDefault()
        goTo(addDays(focusedDate, -7))
        return
      case "ArrowDown":
        event.preventDefault()
        goTo(addDays(focusedDate, 7))
        return
      case "Home":
        event.preventDefault()
        goTo(addDays(focusedDate, -((focusedDate.getDay() - weekStartsOn + 7) % 7)))
        return
      case "End":
        event.preventDefault()
        goTo(addDays(focusedDate, 6 - ((focusedDate.getDay() - weekStartsOn + 7) % 7)))
        return
      case "PageUp":
        event.preventDefault()
        goTo(addMonths(focusedDate, event.shiftKey ? -12 : -1))
        return
      case "PageDown":
        event.preventDefault()
        goTo(addMonths(focusedDate, event.shiftKey ? 12 : 1))
        return
      case "Enter":
      case " ":
        event.preventDefault()
        select(focusedDate)
        return
      default:
    }
  }

  /* exactly one day is tabbable: the focused date, or the first day of the
     displayed month when focus has drifted out of view */
  const tabbableDate = isSameMonth(focusedDate, displayedMonth)
    ? focusedDate
    : startOfMonth(displayedMonth)

  return (
    <div data-slot="calendar" data-readonly={readOnly ? "" : undefined}>
      <div data-slot="nav">
        <button
          type="button"
          data-slot="nav-previous"
          aria-label="Previous month"
          onClick={() => goTo(addMonths(displayedMonth, -1), false)}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </button>
        {/* the caption names the grid; month changes are announced */}
        <div data-slot="caption" id={captionId} aria-live="polite">
          {captionFormatter.format(displayedMonth)}
        </div>
        <button
          type="button"
          data-slot="nav-next"
          aria-label="Next month"
          onClick={() => goTo(addMonths(displayedMonth, 1), false)}
        >
          <ChevronRightIcon aria-hidden="true" />
        </button>
      </div>

      <table
        ref={gridRef}
        data-slot="grid"
        role="grid"
        aria-label={label}
        aria-labelledby={captionId}
        aria-readonly={readOnly || undefined}
        onKeyDown={onGridKeyDown}
      >
        <thead>
          <tr data-slot="weekday-row" role="row">
            {showWeekNumbers && (
              <th data-slot="weekday" scope="col">
                <span aria-hidden="true">#</span>
                <span data-slot="visually-hidden">Week</span>
              </th>
            )}
            {weekdays.map((date, index) => (
              <th
                key={index}
                data-slot="weekday"
                role="columnheader"
                scope="col"
                abbr={weekdayLong.format(date)}
              >
                <span aria-hidden="true">{weekdayShort.format(date)}</span>
                <span data-slot="visually-hidden">
                  {weekdayLong.format(date)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex} data-slot="week-row" role="row">
              {showWeekNumbers && (
                <th data-slot="week-number" role="rowheader" scope="row">
                  {weekNumber(week[0])}
                </th>
              )}
              {week.map((date) => {
                const outside = !isSameMonth(date, displayedMonth)
                const disabled = unavailable(date)
                const chosen = isSelected(date)
                const range = rangePosition(date)
                return (
                  <td
                    key={isoDate(date)}
                    data-slot="day"
                    role="gridcell"
                    data-state={chosen ? "selected" : undefined}
                    data-today={isSameDay(date, today) ? "" : undefined}
                    data-outside={outside ? "" : undefined}
                    data-range={range}
                    data-disabled={disabled ? "" : undefined}
                    aria-selected={chosen || undefined}
                  >
                    <button
                      type="button"
                      data-slot="day-button"
                      data-date={isoDate(date)}
                      data-state={chosen ? "selected" : undefined}
                      data-today={isSameDay(date, today) ? "" : undefined}
                      data-outside={outside ? "" : undefined}
                      data-disabled={disabled ? "" : undefined}
                      /* roving tabindex: exactly one day is tabbable */
                      tabIndex={isSameDay(date, tabbableDate) ? 0 : -1}
                      aria-label={dayFormatter.format(date)}
                      aria-disabled={disabled || undefined}
                      onClick={() => {
                        goTo(date)
                        select(date)
                      }}
                      onFocus={() => setFocusedDate(startOfDay(date))}
                    >
                      {date.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { Calendar }
