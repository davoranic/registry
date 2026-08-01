import * as React from "react"

import "./chart.css"

/**
 * Chart — contract/anatomy/chart.json.
 *
 * The plot itself is a graphic and carries no behavior. Accessibility comes
 * from the text alternative, not the drawing: the root is role="img" with an
 * accessible name and description, and the same values are exposed as a
 * visually-hidden table so keyboard and screen-reader users get the data.
 * Legend entries that toggle series are toggle buttons with aria-pressed.
 * Series are distinguished by more than hue — each carries its own marker
 * shape (and, for areas/bars, its own pattern) so the chart survives
 * colour-vision differences and monochrome print.
 *
 * The plotting library is an implementation choice, never anatomy; this
 * implementation draws plain SVG so the recipe has no third-party surface.
 */

export interface ChartSeries {
  key: string
  label: string
  values: number[]
}

export interface ChartProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** the accessible name of the graphic */
  label: string
  /** the accessible description — what the graphic shows */
  description?: string
  /** x-axis categories; one entry per value in every series */
  categories: string[]
  series: ChartSeries[]
  type?: "line" | "bar"
  showLegend?: boolean
  /** heading for the category column of the hidden data table */
  categoryLabel?: string
}

const VIEW_W = 640
const VIEW_H = 320
const PAD = { top: 16, right: 16, bottom: 40, left: 48 }
const PLOT_X = PAD.left
const PLOT_Y = PAD.top
const PLOT_W = VIEW_W - PAD.left - PAD.right
const PLOT_H = VIEW_H - PAD.top - PAD.bottom
const TICK_COUNT = 4

/* marker shapes cycle so a series is never identified by hue alone */
const MARKERS = ["circle", "square", "triangle", "diamond"] as const

function marker(shape: (typeof MARKERS)[number], x: number, y: number, r: number) {
  switch (shape) {
    case "square":
      return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} />
    case "triangle":
      return <polygon points={`${x},${y - r} ${x + r},${y + r} ${x - r},${y + r}`} />
    case "diamond":
      return <polygon points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`} />
    default:
      return <circle cx={x} cy={y} r={r} />
  }
}

function niceMax(value: number) {
  if (value <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  return Math.ceil(value / magnitude) * magnitude
}

function Chart({
  label,
  description,
  categories,
  series,
  type = "line",
  showLegend = true,
  categoryLabel = "Category",
  ...props
}: ChartProps) {
  const baseId = React.useId()
  const labelId = `${baseId}-label`
  const descriptionId = `${baseId}-description`
  const [hidden, setHidden] = React.useState<string[]>([])

  const visible = series.filter((entry) => !hidden.includes(entry.key))
  const max = niceMax(
    Math.max(1, ...visible.flatMap((entry) => entry.values.map((v) => Math.abs(v))))
  )
  const columns = Math.max(categories.length, 1)

  const xAt = (index: number) =>
    columns === 1
      ? PLOT_X + PLOT_W / 2
      : PLOT_X + (index / (columns - 1)) * PLOT_W
  const yAt = (value: number) => PLOT_Y + PLOT_H - (value / max) * PLOT_H

  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (max / TICK_COUNT) * i)
  const bandWidth = PLOT_W / columns
  const barWidth = visible.length > 0 ? (bandWidth * 0.7) / visible.length : bandWidth

  const toggle = (key: string) =>
    setHidden((current) =>
      current.includes(key)
        ? current.filter((entry) => entry !== key)
        : [...current, key]
    )

  return (
    <div
      data-slot="chart"
      role="img"
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
      {...props}
    >
      <span data-slot="visually-hidden" id={labelId}>
        {label}
      </span>
      {description && (
        <span data-slot="visually-hidden" id={descriptionId}>
          {description}
        </span>
      )}

      <svg
        data-slot="plot"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {/* plot-area — the data rectangle inside the axes */}
        <rect
          data-slot="plot-area"
          x={PLOT_X}
          y={PLOT_Y}
          width={PLOT_W}
          height={PLOT_H}
        />

        {/* grid-line — reference rules behind the series, always weaker than the axis */}
        {ticks.slice(1).map((tick) => (
          <line
            key={`grid-${tick}`}
            data-slot="grid-line"
            x1={PLOT_X}
            x2={PLOT_X + PLOT_W}
            y1={yAt(tick)}
            y2={yAt(tick)}
          />
        ))}

        {/* axis — the two rules */}
        <line
          data-slot="axis"
          data-axis="y"
          x1={PLOT_X}
          x2={PLOT_X}
          y1={PLOT_Y}
          y2={PLOT_Y + PLOT_H}
        />
        <line
          data-slot="axis"
          data-axis="x"
          x1={PLOT_X}
          x2={PLOT_X + PLOT_W}
          y1={PLOT_Y + PLOT_H}
          y2={PLOT_Y + PLOT_H}
        />

        {/* axis-tick — numeric ticks use type-data so digits align */}
        {ticks.map((tick) => (
          <text
            key={`tick-y-${tick}`}
            data-slot="axis-tick"
            data-axis="y"
            x={PLOT_X - 8}
            y={yAt(tick)}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {tick}
          </text>
        ))}
        {categories.map((category, index) => (
          <text
            key={`tick-x-${category}`}
            data-slot="axis-tick"
            data-axis="x"
            x={type === "bar" ? PLOT_X + bandWidth * (index + 0.5) : xAt(index)}
            y={PLOT_Y + PLOT_H + 20}
            textAnchor="middle"
          >
            {category}
          </text>
        ))}

        {/* series — the Nth visible series takes the Nth data slot, in order */}
        {series.map((entry, seriesIndex) => {
          const isHidden = hidden.includes(entry.key)
          if (isHidden) return null
          const order = visible.findIndex((v) => v.key === entry.key)
          const shape = MARKERS[seriesIndex % MARKERS.length]
          return (
            <g
              key={entry.key}
              data-slot="series"
              data-index={(seriesIndex % 12) + 1}
              data-type={type}
            >
              {type === "line" ? (
                <>
                  <polyline
                    data-slot="series-line"
                    points={entry.values
                      .map((value, index) => `${xAt(index)},${yAt(value)}`)
                      .join(" ")}
                  />
                  {entry.values.map((value, index) => (
                    <g data-slot="series-marker" key={`${entry.key}-${index}`}>
                      {marker(shape, xAt(index), yAt(value), 4)}
                    </g>
                  ))}
                </>
              ) : (
                entry.values.map((value, index) => {
                  const x =
                    PLOT_X +
                    bandWidth * index +
                    bandWidth * 0.15 +
                    barWidth * order
                  const y = yAt(value)
                  return (
                    <rect
                      data-slot="series-bar"
                      key={`${entry.key}-${index}`}
                      x={x}
                      y={y}
                      width={Math.max(barWidth - 2, 1)}
                      height={Math.max(PLOT_Y + PLOT_H - y, 0)}
                    />
                  )
                })
              )}
            </g>
          )
        })}
      </svg>

      {/* legend — toggle buttons carrying aria-pressed */}
      {showLegend && (
        <div data-slot="legend">
          {series.map((entry, seriesIndex) => {
            const isHidden = hidden.includes(entry.key)
            return (
              <button
                type="button"
                key={entry.key}
                data-slot="legend-item"
                data-index={(seriesIndex % 12) + 1}
                data-state={isHidden ? undefined : "selected"}
                aria-pressed={!isHidden}
                onClick={() => toggle(entry.key)}
              >
                <span
                  data-slot="legend-swatch"
                  data-marker={MARKERS[seriesIndex % MARKERS.length]}
                  aria-hidden="true"
                />
                {entry.label}
              </button>
            )
          })}
        </div>
      )}

      {/* data-table — required, not optional: it is what makes the graphic
          accessible. Visually hidden, exposed to assistive tech in full. */}
      <table data-slot="data-table">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">{categoryLabel}</th>
            {series.map((entry) => (
              <th scope="col" key={entry.key}>
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category}>
              <th scope="row">{category}</th>
              {series.map((entry) => (
                <td key={entry.key}>{entry.values[index]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { Chart }
