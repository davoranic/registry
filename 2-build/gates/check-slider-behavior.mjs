#!/usr/bin/env node
/* check-slider-behavior — the seventeenth component to ship the third gate
 * (button, calendar, spinner, tooltip, alert, input, select, dialog, tabs,
 * card, badge, progress, chip, checkbox, switch, radio-group came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows. Nothing
 * automatic checks BEHAVIOR rows. SELECT-MATRIX.md finding 16 records the
 * consequence once already: a documented-but-unimplemented dismissal.
 *
 * SLIDER-SPECIFIC RISK THIS GATE WAS WRITTEN TO CATCH: this component's whole
 * VALUE-CHANGE mechanism (behavior.keyboard-value-change, behavior.pointer-
 * drag, behavior.track-click-jump) is easy to break silently — a future edit
 * to setThumbValue's clamp/step math, or to handleTrackPointerDown's
 * nearest-thumb selection, could stop moving the thumb at all, or move the
 * WRONG thumb in range mode, and NOTHING in gen-from-template.py or the
 * style/structure gates would notice — CSS and config rows would still
 * validate fine. This script asserts the literal value-change code exists;
 * harness/conformance.tsx's checkSlider() (added alongside this file) asserts
 * the OBSERVABLE consequence — that a real value change actually moves the
 * thumb/fill, in both single and range mode.
 *
 * This script asserts, for every behavior row in slider.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/slider.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>` (none of this
 *       component's eight behavior rows are config-channel, so this branch
 *       is inert here but kept for parity with every other
 *       check-<name>-behavior.mjs).
 * Any failure exits 1.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see the closing note this
 * script prints, and see harness/conformance.tsx's checkSlider() for the
 * real DOM-driven assertions this gate cannot make.
 *
 * CALIBRATION (CLAUDE.md rule 11): this gate was deliberately broken before
 * being trusted — the `symbol` for behavior.track-click-jump was changed to
 * a string not present in the skeleton ("onPointerDownXXX"), confirmed the
 * gate went red with the expected "cited code not found" message, then
 * restored to the real symbol below.
 *
 * Run: node 2-build/gates/check-slider-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/slider.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a slider actually does these things: decide
 * what role the thumb announces -> decide how it announces its value ->
 * decide how a key changes the value -> decide how a drag changes the
 * value -> decide how a track click changes the value -> decide when the
 * readout shows -> decide who can reach it -> decide how it submits.
 * `symbol` must appear VERBATIM in skeleton/slider.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  "behavior.role": {
    order: 1,
    how: 'Salt [S] and M3 [S] both get role="slider" for FREE from the native <input type="range">, no explicit role attribute written by either. shadcn/Radix is [R], the Thumb documented as an explicit <span role="slider">, since it is not a native input at all. The chassis reproduces the free-role mechanism uniformly for all three by always rendering a real native input with type="range" (a declared approximation for shadcn, whose real source has none at all — see structure.native-input).',
    symbol: 'type="range"',
    where: "Slider(); the thumb's <input> element",
  },
  "behavior.value-announcement": {
    order: 2,
    how: "Salt [S] sets aria-valuenow/aria-valuetext EXPLICITLY despite being implicit from a native range input already. M3 [S] relies on the implicit aria-valuenow PLUS explicit per-thumb aria-valuemin/aria-valuemax narrower than the overall bounds in range mode. shadcn/Radix [R] must set all three explicitly since there is no native input to read them from. The chassis reproduces the explicit, belt-and-braces shape for every column: aria-valuenow and aria-valuetext are written directly on every input regardless of column.",
    symbol: "aria-valuenow={v}",
    where: "Slider(); the thumb's <input> element",
  },
  "behavior.keyboard-value-change": {
    order: 3,
    how: "Salt [S] is a JS OVERRIDE (useSliderThumb's own keydown handler) reproducing native Arrow/Home/End/PageUp/PageDown semantics, done so restrictToMarks/marks/stepMultiplier can be supported. M3 [S] is genuinely NATIVE, no override at all. shadcn/Radix [R] is JS-driven since there is no native input. The chassis's real native <input type=\"range\"> gives every column this behaviour for FREE via the browser's own keyboard semantics — no custom keydown handler exists in this file for value computation, by design (see the template's behavior.pattern note).",
    symbol: 'type="range"',
    where: "Slider(); the thumb's <input> element (native browser keyboard semantics, no custom keydown handler needed)",
  },
  "behavior.pointer-drag": {
    order: 4,
    how: "Salt [S] is fully JS-driven (useSliderThumb's handlePointerMove on window). M3 [S] is genuinely native (the real input spans the interactive area, the browser performs the drag). shadcn/Radix [R] is JS pointer tracking. The chassis's real native input makes dragging genuinely native browser behaviour for every column — onChange reads e.target.valueAsNumber, the whole mechanism.",
    symbol: "e.target.valueAsNumber",
    where: "Slider(); the thumb's <input> onChange handler",
  },
  "behavior.track-click-jump": {
    order: 5,
    how: "Salt [S] is explicit JS (handlePointerDownOnTrack). M3 [S] is genuinely free (the native input's own hit area spans the full track width). shadcn/Radix [R] is presumed, the standard Radix convention. This chassis's own narrow-per-thumb-input choice (see behavior.chassis) means EVERY column needs an explicit track-level handler: handleTrackPointerDown computes the click position, finds the nearest thumb, and forwards a synthetic value change.",
    symbol: "handleTrackPointerDown",
    where: "Slider(); the track's onPointerDown handler",
  },
  "behavior.value-readout-visibility": {
    order: 6,
    how: 'Salt [S]: shown on pointer-hover (300ms-delayed hide), drag, or keyboard focus — an opt-OUT capability. M3 [S]: shown on hover, focus-within, or active — an opt-IN capability, CSS-only. shadcn: CONFIRMED ABSENCE, no readout to show. The chassis reproduces the visibility MECHANISM as pure CSS (see base in slider.template.json — ":hover"/"focus-within"/":has(input:active)"), matching M3\'s real mechanism, plus a forceShowValue escape hatch for demonstration/testing.',
    symbol: "forceShowValue",
    where: "Slider(); data-force-visible on the thumb",
  },
  "behavior.disabled-handling": {
    order: 7,
    how: "Salt [S]: ancestor FormField merge, pointer-events:none on the wrapper. shadcn [S]: native disabled forwarded to every input. M3 [S]: native ?disabled on each input PLUS a component-wide opacity/colour treatment (see style.root.disabled/style.track.disabled/style.fill.disabled/style.thumb.disabled). The chassis reproduces native disabled on every input plus a data-disabled attribute on the root that every column's own CSS keys off.",
    symbol: "data-disabled={disabled || undefined}",
    where: "Slider(); the root element",
  },
  "behavior.form-participation": {
    order: 8,
    how: "Salt [S]: native, the input(s) ARE the real form control(s); range mode submits TWO separately-named inputs. shadcn/Radix [R]: presumed hidden native bubble input(s). M3 [S]: a full form-associated custom element, single mode submits one value, range mode submits TWO named entries (nameStart/nameEnd) — the SAME two-named-values shape Salt's own RangeSlider independently uses. The chassis reproduces the two-named-inputs shape for range mode directly.",
    symbol: '`${name ?? "slider"}-${index === 0 ? "start" : "end"}`',
    where: "Slider(); the thumb's <input> name attribute, range-mode branch",
  },
}

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/slider.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`slider behaviour self-check — ${behaviorRows.length} behavior rows in slider.template.json`)
lines.push("")

if (behaviorRows.length === 0) {
  lines.push("  NO BEHAVIOUR ROWS — this gate would have nothing to prove.")
}

const ordered = [...behaviorRows].sort(
  (a, b) => (CHECKLIST[a.id]?.order ?? 999) - (CHECKLIST[b.id]?.order ?? 999),
)

for (const row of ordered) {
  const entry = CHECKLIST[row.id]
  const tags = [row.policy, row.channel].join("/")
  if (!entry) {
    failures.push(
      `${row.id} (${tags}): NO CHECKLIST ENTRY — a documented behavior with no stated implementation is exactly the SELECT-MATRIX.md finding-16 failure.`,
    )
    lines.push(`  FAIL ${row.id}  [${tags}]  no checklist entry`)
    continue
  }
  const problems = []
  if (!source.includes(entry.symbol)) {
    problems.push(`cited code \`${entry.symbol}\` not found in ${SKELETON}`)
  }
  if (row.channel === "config") {
    const param = row.param
    if (!param) {
      problems.push("config-channel row has no `param`")
    } else {
      if (!(param in (template.skeletonParams ?? {}))) {
        problems.push(`param '${param}' missing from template.skeletonParams`)
      }
      if (!source.includes(`config.${param}`)) {
        problems.push(`skeleton never reads config.${param}`)
      }
    }
  }
  if (problems.length) {
    for (const p of problems) failures.push(`${row.id} (${tags}): ${p}`)
    lines.push(`  FAIL ${row.id}  [${tags}]  ${problems.join("; ")}`)
  } else {
    lines.push(`  ok   ${row.id}  [${tags}]`)
    lines.push(`         ${entry.how}`)
    lines.push(`         -> ${SKELETON} :: ${entry.where}`)
  }
}

const lockedInfo = behaviorRows.filter((r) => r.policy === "locked" && r.channel === "info")
lines.push("")
lines.push(
  `brief's minimum subset (policy=locked, channel=info): ${lockedInfo.length} rows — ${lockedInfo
    .map((r) => r.id)
    .join(", ")} — all present in the checklist: ${lockedInfo.every((r) => CHECKLIST[r.id]) ? "yes" : "n/a"}`,
)

for (const id of Object.keys(CHECKLIST)) {
  if (!behaviorRows.some((r) => r.id === id)) {
    failures.push(`checklist entry '${id}' has no matching behavior row in slider.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: NONE — Slider never conditionally renders a ref it reads (trackRef is unconditional in every column), so there is no useLayoutEffect/useEffect of any kind in this file to guard, the same dialog-trap-immune shape checkbox.tsx/switch.tsx/radio-group.tsx already have.",
)
const hasEffect = source.includes("useLayoutEffect(") || source.includes("useEffect(")
if (hasEffect) {
  failures.push(
    `ref-effect guard: ${SKELETON} now contains a ref-reading effect (useLayoutEffect/useEffect) that this gate's "no ref-reading effect" claim does not account for — either update this gate with a REF_EFFECT_GUARDS block (see check-checkbox-behavior.mjs's pattern) or the new effect is unguarded.`,
  )
  lines.push("  FAIL a ref-reading effect now exists but no guard block covers it")
} else {
  lines.push("  ok   no ref-reading effect exists (confirmed by absence)")
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and no unguarded ref-reading effect exists.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. A real conformance harness drives the skeleton in a DOM and asserts observable behaviour — see harness/conformance.tsx's checkSlider(), which this component's build ADDS TO rather than replaces this gate with: that a real keyboard ArrowRight and a real value-change both move the thumb and resize the fill, in single AND range mode, in all three columns (behavior.keyboard-value-change/behavior.pointer-drag, the real TRANSITION, not two static mounts); that a disabled slider's input does not respond (behavior.disabled-handling); and that the value-readout element exists only where structure.value-readout says it should (behavior.value-readout-visibility). ONE ENVIRONMENT CAVEAT, repeated from every prior component's gate: this page runs in a hidden tab, where focus EVENTS are suppressed though document.activeElement still updates on a programmatic .focus() — anything asserting on a focus EVENT arriving needs a synthetic bubbling focusin, not a bare .focus() call.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
