/* Slider skeleton — written from the template's part union (a root, a track,
   an always-real fill segment, one or two thumbs each nested INSIDE the
   track and each containing a real native <input type="range"> plus an
   optional value-readout, optional tick marks inside the track, and
   Salt-only min/max end labels flanking the whole thing). Inherits from no
   design system — see slider.template.json's behavior.chassis note for the
   full DOM-shape reasoning and every declared approximation.

   THE HEADLINE DECISION, made explicit before writing a single selector per
   CLAUDE.md rule 12: range is modelled as ONE shared boolean config axis
   (`range`) for all three columns, even though the three real systems reach
   it three different ways (Salt: a separate exported component, RangeSlider,
   sharing SliderTrack/SliderThumb internals; shadcn: thumb COUNT driven by
   value array length, genuinely uncapped; M3: a `range: boolean` property).
   See prop.value-shape in the template for the full three-way account.

   INPUT STRATEGY: each thumb gets its OWN narrow, per-thumb-centred native
   <input type="range"> (matching Salt's real SliderThumb.css mechanism
   exactly: width ~= the thumb's own hit area, positioned via
   `left: <percent>%; transform: translateX(-50%)`), NOT M3's real
   full-track-width, clip-path-restricted pair — chosen because a narrow
   per-thumb input needs no clip-path midpoint math to keep two range thumbs
   independently draggable, and is the SAME mechanism this component's own
   Salt source already ships in production (a declared, reasonable
   simplification for M3, and a declared union for shadcn/Radix, whose real
   Thumb has no native input at all — primitives/ was not cloned).

   VALUE-READOUT VISIBILITY is CSS-only (`:hover`/`:focus-within`/
   `:has(input:active)`, all scoped to the ONE thumb via `base`'s own rule in
   slider.template.json), matching M3's own real mechanism exactly and a
   declared simplification of Salt's real JS-timer hover-delay — see
   structure.value-readout. A `forceShowValue` prop exists purely so a
   harness/conformance driver can assert the readout's presence without
   simulating a real pointer hover.

   Every conditional style rule in slider.template.json anchors its `:has()`
   at the narrowest ancestor guaranteed to contain both the input and its
   target as descendants (the thumb itself for thumb-scoped rules), so no
   rule depends on sibling adjacency or a particular nesting depth — the
   exact selector-fidelity discipline RADIO-GROUP-MATRIX.md findings 7-8
   describe: verify a selector matches the RIGHT element, not merely SOME
   element. track / fill / thumb / value readout / ticks / end-labels each
   carry their OWN data-slot from this file's first draft, never conflated. */
import * as React from "react"

export interface SliderConfig {
  range?: boolean[]
  valueReadout?: string
  ticks?: boolean[]
  disabled?: boolean[]
}

export type SliderValue = number | [number, number]

export interface SliderProps {
  config: SliderConfig
  value?: SliderValue
  defaultValue?: SliderValue
  onValueChange?: (value: SliderValue) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** per-instance choice within config.range's capability list */
  range?: boolean
  /** per-instance choice within config.ticks's capability list */
  showTicks?: boolean
  /* Salt-only owned slots — see slot.min-label / slot.max-label */
  minLabel?: string
  maxLabel?: string
  format?: (value: number) => string | number
  name?: string
  id?: string
  className?: string
  "aria-label"?: string
  /** demo/test escape hatch for structure.value-readout's CSS-only visibility mechanism */
  forceShowValue?: boolean
}

function clampToBounds(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

function percentOf(v: number, min: number, max: number) {
  if (max === min) return 0
  return clampToBounds(((v - min) / (max - min)) * 100, 0, 100)
}

export function Slider({
  config,
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  range,
  showTicks,
  minLabel,
  maxLabel,
  format,
  name,
  id,
  className,
  "aria-label": ariaLabel,
  forceShowValue,
}: SliderProps) {
  const isRange = Boolean(range)

  /* behavior.pattern's "does range belong to a separate component" finding
     made concrete: this chassis's OWN default-value formula is illustrative,
     not a literal reproduction of any one system's own default (Salt:
     min+(max-min)/2 single, [min, min+(max-min)/2] range; M3: relies on the
     native input's own browser default, equidistant thirds for range). */
  const fallback: SliderValue = isRange
    ? [min + (max - min) / 3, min + (2 * (max - min)) / 3]
    : min + (max - min) / 2

  const [uncontrolled, setUncontrolled] = React.useState<SliderValue>(defaultValue ?? fallback)
  const isControlled = valueProp !== undefined
  const value = isControlled ? (valueProp as SliderValue) : uncontrolled

  const thumbValues: number[] = isRange ? (value as [number, number]) : [value as number]

  const trackRef = React.useRef<HTMLDivElement>(null)

  function commit(next: SliderValue) {
    if (!isControlled) setUncontrolled(next)
    onValueChange?.(next)
  }

  function setThumbValue(index: number, raw: number) {
    const stepped = Math.round(raw / step) * step
    const clamped = clampToBounds(stepped, min, max)
    if (isRange) {
      const current = value as [number, number]
      const next: [number, number] = index === 0 ? [clamped, current[1]] : [current[0], clamped]
      /* behavior.pattern's declared simplification: neighbours are clamped
         to each other rather than reproducing Salt's own preventThumbOverlap
         flip logic or M3's own action-flip state machine. */
      if (index === 0 && next[0] > next[1]) next[0] = next[1]
      if (index === 1 && next[1] < next[0]) next[1] = next[0]
      commit(next)
    } else {
      commit(clamped)
    }
  }

  /* behavior.track-click-jump — clicking anywhere on the track (not on a
     thumb itself, which stops propagation) jumps the NEAREST thumb to that
     position. Salt's own handlePointerDownOnTrack and M3's own free native
     full-width-input mechanism both reach the same observable outcome by
     different real routes (see the template row's note); this chassis's
     own narrow-per-thumb-input choice means the track itself needs its own
     explicit handler to reproduce the behaviour for every column. */
  function handleTrackPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = clampToBounds((event.clientX - rect.left) / rect.width, 0, 1)
    const raw = min + ratio * (max - min)
    let nearest = 0
    if (isRange) {
      const [a, b] = thumbValues
      nearest = Math.abs(raw - a) <= Math.abs(raw - b) ? 0 : 1
    }
    setThumbValue(nearest, raw)
  }

  const fillStartPct = isRange ? percentOf(thumbValues[0], min, max) : 0
  const fillEndPct = percentOf(thumbValues[isRange ? 1 : 0], min, max)

  const readoutMode = config.valueReadout
  const showReadout = readoutMode && readoutMode !== "none"

  const ticksCapable = Array.isArray(config.ticks) && config.ticks.includes(true)
  const showTicksNow = ticksCapable && Boolean(showTicks) && step > 0
  const tickCount = showTicksNow ? Math.min(Math.round((max - min) / step) + 1, 21) : 0
  const tickValues = Array.from({ length: tickCount }, (_, i) => min + (i * (max - min)) / Math.max(tickCount - 1, 1))

  function formatValue(v: number) {
    return format ? format(v) : v
  }

  return (
    <div
      data-slot="slider-root"
      data-disabled={disabled || undefined}
      className={className}
      aria-hidden={false}
    >
      {minLabel ? (
        <span data-slot="slider-end-label" data-end="min">
          {minLabel}
        </span>
      ) : null}

      <div
        ref={trackRef}
        data-slot="slider-track"
        onPointerDown={handleTrackPointerDown}
      >
        <div
          data-slot="slider-fill"
          style={{ left: `${fillStartPct}%`, width: `${Math.max(fillEndPct - fillStartPct, 0)}%` }}
        />

        {showTicksNow ? (
          <div data-slot="slider-ticks">
            {tickValues.map((v, i) => (
              <span key={i} data-slot="slider-tick" style={{ left: `${percentOf(v, min, max)}%` }} />
            ))}
          </div>
        ) : null}

        {thumbValues.map((v, index) => {
          const pct = percentOf(v, min, max)
          const thumbId = id ? `${id}-${index}` : undefined
          return (
            <div
              key={index}
              data-slot="slider-thumb"
              data-index={index}
              data-force-visible={forceShowValue || undefined}
              style={{ left: `${pct}%` }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input
                data-slot="slider-input"
                type="range"
                id={thumbId}
                name={isRange ? `${name ?? "slider"}-${index === 0 ? "start" : "end"}` : name}
                min={min}
                max={max}
                step={step}
                value={v}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-valuenow={v}
                aria-valuetext={String(formatValue(v))}
                onChange={(e) => setThumbValue(index, e.target.valueAsNumber)}
              />
              {showReadout ? (
                <span data-slot="slider-value">{formatValue(v)}</span>
              ) : null}
            </div>
          )
        })}
      </div>

      {maxLabel ? (
        <span data-slot="slider-end-label" data-end="max">
          {maxLabel}
        </span>
      ) : null}
    </div>
  )
}
