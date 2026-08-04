/* Progress skeleton - written from the template's part union (a track holding
   a groove, an optional buffer, an indicator and an optional stop indicator;
   or a circular ring; plus an optional formatted label). Inherits from no
   design system.

   THE SHAPE IS STRUCTURE, NOT A STYLE. A linear progress is a clipped
   horizontal box with an absolutely-positioned fill; a circular progress is
   an SVG ring whose arc length is the value. They share no element, so the
   chassis branches on `shape` rather than restyling one box into the other.
   Salt ships both as peer exports from one directory, M3 merged both into one
   token family with linear/circular sub-namespaces, and shadcn ships linear
   only - see docs/PROGRESS-MATRIX.md's scope note.

   LESSON 2, AND IT IS THE LIVE RISK IN THIS COMPONENT. The percentage is a
   per-INSTANCE quantity. It is written as an INLINE STYLE on the very element
   that consumes it, and never routed through a theme-scoped custom property -
   because a var() inside a custom-property declaration resolves where it is
   DECLARED, not where it is used, which is how select froze a measured width
   to 0px with every gate green. Both systems that have an element do exactly
   the same thing in source: Salt writes `style={{ width: `${progress}%` }}`
   on its bar and shadcn writes `style={{ transform: `translateX(...)` }}` on
   its indicator.

   THREE FILL MECHANISMS, RECEIVED AS CONFIG. Salt sets `width`, shadcn
   translates a full-width element inside an overflow-hidden track, and M3's
   own library scales it (which is why material-web disowns the indicator's
   corner radius: "can only control track since scaling is used on
   buffer/progress"). The mechanism decides whether the fill can be rounded
   and whether it is direction-aware, so it is config, not a detail.

   DETERMINACY IS INFERRED, NOT SELECTED. Salt computes
   `value === undefined && bufferValue === undefined`; Radix computes
   `value == null`. Neither takes a mode prop, which is why prop.determinacy
   is a CAPABILITY LIST rather than an ordered enum. The chassis reproduces
   the inference and then CLAMPS it: a circular progress can only be
   indeterminate in a column whose structure.indeterminate-circular is on, and
   no column turns it on, because `spinner` owns the indeterminate circular
   glyph.

   DECLARED SIMPLIFICATIONS, stated rather than smoothed:
     1. The circular ring is one SVG circle with a pathLength-100 dash,
        driven by the instance value. Salt draws its ring as four rotated
        half-overlay divs and M3's real implementation is an SVG arc; a
        CSS-only chassis needs one concrete geometry, the same declaration
        skeleton/spinner.tsx makes for its fixed arc sweep.
     2. The buffer renders in the LINEAR shape only. Salt has a circular
        buffer too - four more nested overlay divs - and it is not modelled;
        no style row describes it.
     3. The groove is always a dedicated full-bleed child. In Salt it must be
        (its rail is half the container's height and has to be offset); in
        shadcn and M3 the groove IS the container in source, and painting it
        on a 100%-tall child is byte-equivalent.

   Every behavior row in contract/templates/progress.template.json is
   implemented below and asserted by scripts/check-progress-behavior.mjs.
   This file contains no effects and no refs: every behaviour is a pure
   computation performed during render, which is why that script's guard
   block is INVERTED (it asserts the file stays that way) rather than empty
   and vacuously true. */
import * as React from "react"

export interface ProgressConfig {
  shape?: string[]
  determinacy?: string[]
  fillMechanism?: string
  buffer?: boolean
  stopIndicator?: boolean
  label?: boolean
  indeterminateBand?: boolean
  indeterminateCircular?: boolean
  role?: string
  valueRange?: string
  valueText?: boolean
  labelFormat?: string
  completeState?: boolean
  hideLabel?: boolean[]
  max?: number
  min?: number
}

export interface ProgressProps {
  config: ProgressConfig
  /* undefined => indeterminate, in every column that supports it. This is the
     inference, not a mode prop - see behavior.determinacy-detection. */
  value?: number
  /* Salt only: a second, pending indicator drawn behind the active one. */
  bufferValue?: number
  min?: number
  max?: number
  shape?: string
  hideLabel?: boolean
  className?: string
  "aria-label"?: string
}

export function Progress({
  config,
  value,
  bufferValue,
  min,
  max,
  shape,
  hideLabel,
  className,
  "aria-label": ariaLabel,
}: ProgressProps) {
  const shapeMode = shape ?? config.shape?.[0] ?? "linear"
  const minValue = min ?? config.min ?? 0
  const maxValue = max ?? config.max ?? 100

  /* behavior.determinacy-detection - inferred from the ABSENCE of a value in
     both systems that have an element, and a buffer alone is enough to make
     it determinate (Salt tests both). Then CLAMPED: a column that cannot be
     indeterminate at all, or a circular shape in a column whose circular form
     has no indeterminate mode, falls back to determinate - which is exactly
     what Salt's CircularProgress does by defaulting `value = 0`. */
  const supportsIndeterminate = (config.determinacy ?? []).includes("indeterminate")
  const inferred = value === undefined && bufferValue === undefined
  const indeterminate =
    inferred &&
    supportsIndeterminate &&
    (shapeMode !== "circular" || Boolean(config.indeterminateCircular))

  /* Only a column with structure.indeterminate-band on draws a travelling
     band. shadcn's is off, so its indeterminate case falls through to the
     fill mechanism with `value || 0` - a MOTIONLESS EMPTY BAR, which is
     precisely what its source renders. */
  const band = indeterminate && Boolean(config.indeterminateBand)

  const raw = value ?? 0
  const span = maxValue - minValue || 1
  /* Salt normalises over the WHOLE range, so min=20 max=40 value=35 is 75%,
     and the label and aria-valuenow deliberately disagree. Not clamped, the
     same as source: an over-range linear fill is clipped by the track's own
     overflow instead. */
  const progress = ((raw - minValue) / span) * 100
  const buffer = bufferValue === undefined ? 0 : ((bufferValue - minValue) / span) * 100

  /* structure.fill-mechanism - three systems, three mechanisms, and the value
     is INLINE on the element that consumes it in all three (lesson 2). */
  const fillStyle: React.CSSProperties =
    config.fillMechanism === "translate"
      ? { inlineSize: "100%", transform: `translateX(-${100 - progress}%)` }
      : config.fillMechanism === "scale"
        ? /* stretched between both insets rather than given a width, so the
             column's own margin-inline-end (M3's track-active-indicator-space)
             has something to bite on before the scale is applied */
          { insetInlineEnd: 0, transform: `scaleX(${progress / 100})` }
        : { inlineSize: `${progress}%` }

  /* behavior.value-range - Salt writes a real min; Radix hardcodes 0 and has
     no min prop at all; M3 has no element and therefore no contract.
     behavior.value-now - and SALT HAS TWO DIFFERENT NOTIONS OF "WE DO NOT
     KNOW", keyed on two different conditions, which a careless chassis would
     flatten into one. The ARIA omission is keyed on the VALUE ALONE
     (`aria-valuenow={value === undefined ? undefined : Math.round(value)}`)
     while the visual indeterminacy is keyed on the value AND the buffer. They
     disagree in exactly one case: <LinearProgress bufferValue={65} /> renders
     a static 0% bar labelled "0 %" and yet publishes NO aria-valuenow. Radix
     keys on the value alone too (`isNumber(value) ? value : undefined`), so
     the same expression serves both columns. Salt also ROUNDS the published
     value where Radix does not: value=35.6 announces 36 in one and 35.6 in
     the other. */
  const valueKnown = value !== undefined
  const range = config.valueRange ?? "none"
  const valueNow = !valueKnown
    ? undefined
    : range === "min-max"
      ? Math.round(raw)
      : range === "none"
        ? undefined
        : raw
  const valueMin = range === "min-max" ? minValue : range === "max-only" ? 0 : undefined
  const valueMax = range === "none" ? undefined : maxValue

  /* behavior.value-text - shadcn only, and the exact mirror of the visible
     label: Radix announces a percentage it never draws, Salt draws one it
     never announces, and neither does both. */
  const valueText =
    config.valueText && valueKnown
      ? `${Math.round((raw / maxValue) * 100)}%`
      : undefined

  /* state.complete - shadcn only. Radix publishes a three-valued data-state
     on both elements and nothing in shadcn's own file selects on it, so a
     finished bar looks like a 99% one. Reproduced as source has it: the
     attribute is written, no rule hangs off it. */
  const dataState = config.completeState
    ? !valueKnown
      ? "indeterminate"
      : raw === maxValue
        ? "complete"
        : "loading"
    : undefined

  /* behavior.label-formatting - Salt only, and the exact string is character:
     a rounded figure with a SPACE before the percent sign, and an EM DASH for
     the unknown case. Written as an escape rather than as a raw glyph, per
     docs/CARD-MATRIX.md's NUL-byte lesson: never put a non-obvious codepoint
     into a source file where a backslash escape will do. */
  const labelHidden = hideLabel ?? config.hideLabel?.[0] ?? false
  const showLabel = Boolean(config.label) && !labelHidden
  const labelText =
    config.labelFormat === "percent-spaced"
      ? indeterminate
        ? "\u2014 %"
        : `${Math.round(progress)} %`
      : undefined

  /* behavior.buffer-visibility - Salt's own truthy-and-positive test, so
     bufferValue={0} renders nothing while still counting as determinate. */
  const showBuffer =
    Boolean(config.buffer) &&
    shapeMode === "linear" &&
    bufferValue !== undefined &&
    bufferValue > 0

  /* structure.stop-indicator - M3 only, linear only, and determinate only: a
     dot marking 100% has nothing to mark while the band is travelling. The
     determinate gate is [R] (a tokens-only clone says nothing about it) and
     is declared here rather than assumed silently. */
  const showStopIndicator =
    Boolean(config.stopIndicator) && shapeMode === "linear" && !indeterminate

  const label = showLabel ? (
    <span data-slot="progress-label">{labelText}</span>
  ) : null

  const arc = Math.min(100, Math.max(0, progress))

  return (
    <div
      data-slot="progress"
      data-shape={shapeMode}
      data-state={dataState}
      role={config.role}
      aria-label={ariaLabel}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      aria-valuenow={valueNow}
      aria-valuetext={valueText}
      className={className}
    >
      {shapeMode === "circular" ? (
        <svg data-slot="progress-ring" aria-hidden="true">
          <circle data-slot="progress-ring-track" />
          <circle
            data-slot="progress-ring-indicator"
            pathLength="100"
            /* the instance value, inline on the element that uses it */
            strokeDasharray={`${arc} 100`}
          />
        </svg>
      ) : (
        <div data-slot="progress-track">
          <div data-slot="progress-groove" />
          {showBuffer ? (
            <div data-slot="progress-buffer" style={{ inlineSize: `${buffer}%` }} />
          ) : null}
          <div
            data-slot="progress-indicator"
            data-indeterminate={band ? "" : undefined}
            data-state={dataState}
            style={band ? undefined : fillStyle}
          />
          {showStopIndicator ? <div data-slot="progress-stop-indicator" /> : null}
        </div>
      )}
      {label}
    </div>
  )
}
