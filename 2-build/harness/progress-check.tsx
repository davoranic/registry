/* Phase-2 validation harness for Progress — same purpose as badge-check.tsx /
   card-check.tsx: render the generated CSS on the real skeleton and let the
   values be checked against each DS's own reference before moving on. Not the
   final registry page.

   Every declared axis gets a control, because ALERT-MATRIX.md finding 10 was
   found by clicking one:
     - mode (all themes)
     - density (Salt only — the only system with the capability, and it moves
       TEN things here: the track height, the groove height, the groove
       offset, the label type, the label gap, the ring diameter, both ring
       thicknesses and both derived ring radii)
     - shape: linear / circular (Salt and M3) — STRUCTURE, not a style. The two
       forms share no element. shadcn gets no control, which is itself the
       finding: it has no circular progress at all.
     - determinacy: determinate / indeterminate — a CAPABILITY list, not an
       ordered default; the chassis infers it from the value exactly as Salt
       and Radix do, so the control passes `undefined` rather than a mode.
     - fill: 0 / 37 / 100 — three percentages, present so the FILL MECHANISM is
       inspectable. The three columns use three different ones (width /
       translate / scale) and only 0 and 100 make the difference obvious: a
       width-driven bar at 0% has no box at all, a translate-driven one has a
       full-width box parked off to the left, and a scale-driven one has a
       full-width box collapsed to nothing with its corner radius squashed
       flat — which is precisely why material-web disowns M3's
       active-indicator-shape.

   FIVE SUB-STAGES PER THEME:
     1. AXIS — the toggled shape/determinacy/fill, one instance.
     2. FILL LADDER — 0, 37, 100 side by side, with each instance's REAL ARIA
        attributes read back out of the DOM and printed underneath. That
        readout is the point of the stage: Salt publishes valuemin/valuemax/
        valuenow and no valuetext, shadcn publishes valuemin=0 (hardcoded),
        valuemax, an UNROUNDED valuenow and a valuetext percentage it never
        draws, and M3 publishes a bare role with no values at all because a
        tokens-only clone supplies no contract to reproduce.
     3. RANGE — min=20 max=40 value=35. Salt normalises over the whole range
        and DISPLAYS "75 %" while announcing valuenow=35; shadcn has no min
        prop at all, so the same instance cannot be expressed.
     4. BUFFER — Salt only. An opaque hole in the groove with a 1px accent
        hairline, not a faded fill.
     5. STOP INDICATOR — M3 only, at 37 and 100, with the 4px
        track-active-indicator-space beside it.

   HARNESS-ONLY TYPOGRAPHY, DECLARED. Only ONE system declares any type in
   this component (Salt's label is a <Text styleAs="h2">, 18px/24px semibold
   Open Sans at medium), so every other character on this page — captions,
   notes, the ARIA readout — is inline harness chrome and must not be read as
   a registry value. This is the card/badge split landing in between: card had
   no typography in any system, badge had it in all three. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Progress, type ProgressConfig } from "../skeleton/progress"
import configs from "../dist/gen/progress-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

const SHAPE_LABEL: Record<string, string> = {
  linear: "linear (the only shape all three columns express)",
  circular: "circular (Salt: a peer export; M3: the `circular` sub-namespace)",
}

const DETERMINACY_LABEL: Record<string, string> = {
  determinate: "determinate (a value is passed)",
  indeterminate: "indeterminate (NO value — inferred, not selected)",
}

const NO_SHAPE_REASON =
  "no circular form — CONFIRMED ABSENCE. progress.tsx is a horizontal bar and there is no circular progress file anywhere in the clone. shadcn's circular loading affordance is the separate Spinner component, already matrixed."

const NO_BUFFER_REASON: Record<string, string> = {
  shadcn:
    "no buffer — CONFIRMED ABSENCE. Neither progress.tsx nor the Radix primitive has a second value of any kind.",
  m3: "no buffer token in any of the five M3 progress files in either edition. The word appears exactly once in the clone, inside material-web's own comment `can only control track since scaling is used on buffer/progress` — naming something the token set does not describe.",
}

const NO_STOP_REASON: Record<string, string> = {
  salt: "no end marker of any kind in LinearProgress.css.",
  shadcn:
    "no end marker. shadcn has the same IDEA as a data attribute instead — Radix writes data-state=\"complete\" when value === max — and nothing in progress.tsx selects on it, so a finished bar looks like a 99% one.",
}

const NO_LABEL_REASON: Record<string, string> = {
  shadcn:
    "no label part. progress-label.tsx builds one by COMPOSITION out of Field + FieldLabel with a hand-written percentage — consumer text the component neither formats nor keeps in sync.",
  m3: "no typescale, label or text token in any of the five M3 progress files in either edition.",
}

/* Reads the REAL attributes back off the rendered node rather than
   recomputing them here, so the readout cannot quietly disagree with the
   chassis. This lives in the harness, not in the skeleton — skeleton/
   progress.tsx is deliberately effect-free and ref-free. */
const ARIA_KEYS = [
  "role",
  "aria-valuemin",
  "aria-valuemax",
  "aria-valuenow",
  "aria-valuetext",
  "data-state",
]

function AriaReadout({ children }: { children: React.ReactNode }) {
  const [text, setText] = React.useState("")
  const measure = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const el = node.querySelector('[data-slot="progress"]')
    if (!el) return
    setText(
      ARIA_KEYS.map((k) => `${k}=${el.getAttribute(k) ?? "—"}`).join("  "),
    )
  }, [])
  return (
    <div ref={measure}>
      {children}
      <div className="progress-aria">{text}</div>
    </div>
  )
}

function Legend({ children }: { children: React.ReactNode }) {
  return <div className="progress-legend">{children}</div>
}

const FILLS = [0, 37, 100]

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, ProgressConfig>)[theme]
  const shapes = config.shape ?? ["linear"]
  const determinacies = config.determinacy ?? ["determinate"]

  const [shape, setShape] = React.useState(shapes[0])
  const [determinacy, setDeterminacy] = React.useState(determinacies[0])
  const [fill, setFill] = React.useState(37)
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [hideLabel, setHideLabel] = React.useState(false)

  const isSalt = theme === "salt"
  const hasShapeAxis = shapes.length > 1
  const hasLabel = Boolean(config.label)
  const indet = determinacy === "indeterminate"
  /* the inference, exercised: an indeterminate instance passes NO value */
  const axisValue = indet ? undefined : fill

  return (
    <figure
      className="stage"
      data-theme={theme}
      data-mode={mode === "dark" ? "dark" : undefined}
      data-density={isSalt ? density : undefined}
    >
      <figcaption>
        {theme} · {mode} · fill={indet ? "n/a" : `${fill}%`}
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => (
              <button key={d} disabled={d === density} onClick={() => setDensity(d)}>
                {d}
              </button>
            ))}
          </span>
        )}
        {hasShapeAxis && (
          <span className="cap-control">
            {shapes.map((s) => (
              <button key={s} disabled={s === shape} onClick={() => setShape(s)} title={SHAPE_LABEL[s]}>
                {s}
              </button>
            ))}
          </span>
        )}
        <span className="cap-control">
          {determinacies.map((d) => (
            <button
              key={d}
              disabled={d === determinacy}
              onClick={() => setDeterminacy(d)}
              title={DETERMINACY_LABEL[d]}
            >
              {d}
            </button>
          ))}
        </span>
        <span className="cap-control">
          {FILLS.map((f) => (
            <button key={f} disabled={f === fill} onClick={() => setFill(f)}>
              {f}%
            </button>
          ))}
        </span>
        {hasLabel && (
          <span className="cap-control">
            <button disabled={!hideLabel} onClick={() => setHideLabel(false)}>
              label
            </button>
            <button disabled={hideLabel} onClick={() => setHideLabel(true)}>
              hideLabel
            </button>
          </span>
        )}
      </figcaption>

      {/* 1 — the toggled axis */}
      <div className="progress-block">
        <div className="progress-caption">
          1 · axis · shape={shape} determinacy={determinacy}
        </div>
        <div className="progress-frame">
          <AriaReadout>
            <Progress
              config={config}
              shape={shape}
              value={axisValue}
              hideLabel={hideLabel}
              aria-label="Download"
            />
          </AriaReadout>
        </div>
      </div>

      {/* 2 — the fill ladder, the stage that makes the mechanism inspectable */}
      <div className="progress-block">
        <div className="progress-caption">
          2 · fill ladder — 0 / 37 / 100, mechanism ={" "}
          {config.fillMechanism ?? "—"}, with each instance&apos;s REAL ARIA read back
          out of the DOM
        </div>
        {FILLS.map((f) => (
          <div className="progress-cell" key={f}>
            <div className="progress-frame">
              <AriaReadout>
                <Progress
                  config={config}
                  shape={shape}
                  value={f}
                  hideLabel={hideLabel}
                  aria-label={`Download ${f} percent`}
                />
              </AriaReadout>
            </div>
          </div>
        ))}
        <div className="progress-note">
          At 0% the mechanism shows itself: `width` gives a zero-width box,
          `translate` parks a full-width box off to the left, `scale` collapses
          a full-width box — and squashes its corner radius, which is why
          material-web lists M3&apos;s active-indicator-shape as unsupported.
        </div>
      </div>

      {/* 3 — range normalisation and the ARIA divergence */}
      <div className="progress-block">
        <div className="progress-caption">3 · range · min=20 max=40 value=35</div>
        {config.valueRange === "min-max" ? (
          <div className="progress-frame">
            <AriaReadout>
              <Progress
                config={config}
                shape={shape}
                min={20}
                max={40}
                value={35}
                hideLabel={hideLabel}
                aria-label="Download"
              />
            </AriaReadout>
            <div className="progress-note">
              Salt normalises over the WHOLE range, so this is 75% full and the
              label reads &quot;75 %&quot; while aria-valuenow stays 35. Its own e2e
              test asserts exactly this instance.
            </div>
          </div>
        ) : (
          <Legend>
            {config.valueRange === "max-only"
              ? "shadcn cannot express this instance. Radix takes `max` but has NO min prop and hardcodes aria-valuemin={0}, so a non-zero floor is unreachable — an expressibility ceiling, not a missing default. Rendered here at the same value against the default 0..100 range for comparison."
              : "M3 supplies no min/max contract at all: a tokens-only clone has no element, and no token implies one. The chassis therefore publishes role=progressbar with no value attributes rather than inventing a contract."}
            <div className="progress-frame" style={{ marginBlockStart: 10 }}>
              <AriaReadout>
                <Progress config={config} shape={shape} value={35} aria-label="Download" />
              </AriaReadout>
            </div>
          </Legend>
        )}
      </div>

      {/* 4 — the buffer, Salt only */}
      <div className="progress-block">
        <div className="progress-caption">4 · buffer (a second, pending indicator)</div>
        {config.buffer ? (
          <>
            <div className="progress-frame">
              <Progress
                config={config}
                shape={shape}
                value={37}
                bufferValue={65}
                hideLabel={hideLabel}
                aria-label="Download"
              />
            </div>
            <div className="progress-note">
              value=37 bufferValue=65. The buffer is NOT a faded fill: it is the
              PAGE&apos;s own surface colour with a 1px accent hairline drawn inside
              its edge, i.e. an opaque hole in the groove. It never enters the
              label or any ARIA attribute.
            </div>
            <div className="progress-frame" style={{ marginBlockStart: 12 }}>
              <Progress config={config} shape={shape} bufferValue={65} aria-label="Download" />
            </div>
            <div className="progress-note">
              bufferValue alone, no value. Still DETERMINATE — Salt&apos;s inference
              tests both (`value === undefined &amp;&amp; bufferValue === undefined`), so a
              buffer on its own suppresses the indeterminate band.
            </div>
          </>
        ) : (
          <Legend>{NO_BUFFER_REASON[theme]}</Legend>
        )}
      </div>

      {/* 5 — the stop indicator, M3 only, and the debt spinner left */}
      <div className="progress-block">
        <div className="progress-caption">
          5 · stop indicator + track-active-indicator-space
        </div>
        {config.stopIndicator ? (
          <>
            {[37, 100].map((f) => (
              <div className="progress-frame" key={f} style={{ marginBlockEnd: 10 }}>
                <Progress config={config} shape="linear" value={f} aria-label="Download" />
              </div>
            ))}
            <div className="progress-note">
              4px dot in the ACTIVE INDICATOR&apos;S OWN COLOUR (stop-indicator-color
              -&gt; primary), corner-full, flush with the far edge
              (stop-indicator-trailing-space 0px), plus the 4px
              track-active-indicator-space as the indicator&apos;s trailing margin.
              All of it exists ONLY in versions/latest — v0_192 has no merged
              family at all. These are the tokens docs/SPINNER-MATRIX.md finding
              6 deferred to this matrix, claimed here.
            </div>
          </>
        ) : (
          <Legend>{NO_STOP_REASON[theme]}</Legend>
        )}
      </div>

      {/* 6 — what this column has no label for */}
      {!hasLabel && (
        <div className="progress-block">
          <div className="progress-caption">6 · label</div>
          <Legend>{NO_LABEL_REASON[theme]}</Legend>
        </div>
      )}

      {!hasShapeAxis && (
        <div className="progress-block">
          <div className="progress-caption">7 · shape axis</div>
          <Legend>{NO_SHAPE_REASON}</Legend>
        </div>
      )}
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header>
        <b>Progress — phase 2 validation</b>
        <span className="dim">
          determinate (linear + circular) and indeterminate LINEAR; indeterminate
          circular belongs to `spinner`
        </span>
      </header>
      <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => (
          <Stage key={t} theme={t} />
        ))}
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
