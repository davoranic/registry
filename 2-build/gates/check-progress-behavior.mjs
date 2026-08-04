#!/usr/bin/env node
/* check-progress-behavior — the THIRD GATE, scoped to progress.
 *
 * WHY THIS EXISTS. The pipeline has two automatic gates and one manual one:
 *   1. gen-from-template.py checks STYLE rows (no raw colour literals
 *      outside slots, no unresolvable var(), no missing dark value, no
 *      locked row switched off).
 *   2. the same script checks CONFIG rows against skeletonParams — the
 *      expressibility gate.
 *   3. the axis self-audit checks, BY HAND, that a config row whose cell
 *      lists 2+ values is discriminated by real CSS or a skeleton branch
 *      (ALERT-MATRIX.md finding 10).
 * BEHAVIOR rows are checked by NOTHING. docs/SELECT-MATRIX.md finding 16
 * records the consequence: behavior.dismiss was documented for all three
 * systems, the skeleton never implemented outside-click dismissal, and
 * every static screenshot, the generator and the axis audit all passed.
 *
 * PROGRESS IS THE FIFTH COMPONENT TO SHIP THIS GATE, and the first whose
 * behaviour is almost entirely ARIA. It has EIGHT behavior rows, four of
 * them locked/info, and not one of them is an event handler — a progress bar
 * is an OUTPUT. What it does have is: three systems that all agree on
 * role="progressbar" (the exact inverse of spinner, where the same three
 * produced img / status / progressbar) and then diverge on WHICH value
 * attributes they publish; determinacy INFERRED from the absence of a value
 * rather than selected by a prop, in both systems that have an element; a
 * label formatter whose exact string ("75 %", with a space; "— %" for the
 * unknown case) is character; and a buffer whose visibility test is truthy-
 * and-positive. None of that is visible in a screenshot and the generator
 * cannot see any of it.
 *
 * This script asserts, for every behavior row in progress.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/progress.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>`.
 * Any failure exits 1.
 *
 * TWO DELIBERATE EXTENSIONS to check-badge-behavior.mjs's contract, declared
 * rather than slipped in:
 *   - `symbol` may be a STRING or an ARRAY of strings, all of which must
 *     appear. Two rows here assert two separate halves of one behaviour
 *     (aria-valuenow is both OMITTED when indeterminate and ROUNDED when
 *     present; the buffer test is both a truthiness check and a > 0 check),
 *     and collapsing each pair into one fragile multi-line match would have
 *     proved less.
 *   - an entry may declare `forbidden`, a list of tokens that must NOT
 *     appear. behavior.non-interactive is a CONFIRMED ABSENCE in all three
 *     systems, so the only honest way to assert it is negatively; a marker
 *     constant would have been dead code that proved nothing. An entry with
 *     neither `symbol` nor `forbidden` fails, so the extension cannot be
 *     used to smuggle in a vacuous entry.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS. See the closing note the
 * script prints — dialog shipped TWO effects that passed this exact gate
 * and never executed.
 *
 * Run: node scripts/check-progress-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/progress.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a progress bar actually performs these
 * things: work out whether you know anything -> normalise what you know ->
 * publish it to assistive tech -> draw it as text -> draw the second,
 * pending value -> stay inert.
 * Every `symbol` must appear VERBATIM in skeleton/progress.tsx; every
 * `forbidden` token must NOT.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  // --- 1. do we know how far along we are? --------------------------
  "behavior.determinacy-detection": {
    order: 1,
    how: 'DETERMINACY IS INFERRED, NOT SELECTED — in both systems that have an element, which is why prop.determinacy is a CAPABILITY LIST and not an ordered enum with a default (lesson 3). Salt: `const isIndeterminate = value === undefined && bufferValue === undefined` — note that a BUFFER ALONE is enough to make it determinate. Radix: `const value = isValidValueNumber(valueProp, max) ? valueProp : null`, then getProgressState() returns \'indeterminate\' | \'loading\' | \'complete\'. AND THERE IS AN ASYMMETRY INSIDE SALT that the chassis has to reproduce: LinearProgress infers, CircularProgress CANNOT — it defaults `value = 0`, so a bare <CircularProgress /> is a determinate ring at 0%. The chassis therefore infers and then CLAMPS on the shape, which is also the mechanism that keeps the spinner boundary honest: no column turns structure.indeterminate-circular on, so an indeterminate circular progress is unreachable and `spinner` keeps sole ownership of that glyph.',
    symbol: [
      "const inferred = value === undefined && bufferValue === undefined",
      '(shapeMode !== "circular" || Boolean(config.indeterminateCircular))',
    ],
    where: "Progress(); gates the band, every aria-value* attribute, and the label string",
  },

  // --- 2. normalise it ----------------------------------------------
  "behavior.value-range": {
    order: 2,
    how: 'WHERE THE ARIA CONTRACTS ACTUALLY DIVERGE, and it is a three-way split rather than a missing default. Salt = "min-max": both `min` and `max` are real props, both are published, and the percentage is normalised over the WHOLE range — `((value - min) / (max - min)) * 100` — so min=20 max=40 value=35 publishes valuemin 20 / valuemax 40 / valuenow 35 and DISPLAYS "75 %". Its own e2e test asserts exactly that instance. shadcn = "max-only": Radix takes `max` (DEFAULT_MAX 100) but HAS NO min PROP AT ALL and hardcodes `aria-valuemin={0}`, so a non-zero floor is unreachable — an expressibility ceiling. M3 = "none": [R], a tokens-only clone has no element and no token implies a contract, so the chassis publishes the role and no values rather than inventing one.',
    symbol: 'const valueMin = range === "min-max" ? minValue : range === "max-only" ? 0 : undefined',
    where: "Progress(); consumed as aria-valuemin / aria-valuemax on the root",
  },

  // --- 3. publish it -------------------------------------------------
  "behavior.role": {
    order: 3,
    how: 'ALL THREE AGREE ON role="progressbar", AND THE UNANIMITY IS THE FINDING — it is the exact inverse of docs/SPINNER-MATRIX.md finding 1, where these same three systems answered "how do we tell an AT this is loading?" with role=img, role=status and role=progressbar. Salt hardcodes it on the root div of BOTH exports; Radix writes it on Primitive.div; M3 is [R]. It is also the counter-example to BADGE-MATRIX.md finding 2 (all three shipping zero ARIA) and is exactly why the brief\'s instruction to re-grep rather than assume was right: a component-by-component question, not a house style. Computed from config rather than hardcoded so the agreement is a value in the matrix.',
    symbol: "role={config.role}",
    where: "Progress(); the role attribute on the root",
  },
  "behavior.value-now": {
    order: 4,
    how: 'THREE HALVES, ALL SOURCED, ALL ASSERTED. (a) aria-valuenow is OMITTED WHEN THE VALUE IS UNKNOWN, and both systems state it twice — Salt writes `value === undefined ? undefined : Math.round(value)` and its e2e test asserts `should("not.have.attr", "aria-valuenow")` on the indeterminate story while asserting all three attributes on the determinate one; Radix writes `isNumber(value) ? value : undefined`. (b) SALT HAS TWO DIFFERENT NOTIONS OF "WE DO NOT KNOW" AND THEY ARE KEYED ON DIFFERENT CONDITIONS — the ARIA omission tests the VALUE ALONE, the visual indeterminacy tests the value AND the buffer. They disagree in exactly one case: `<LinearProgress bufferValue={65} />` renders a static 0% bar labelled "0 %" and yet publishes NO aria-valuenow. A chassis that keyed both off one flag would have published aria-valuenow="0" there and passed every other gate; this one was caught by rendering the case, not by reading the code. (c) SALT ROUNDS THE PUBLISHED VALUE AND RADIX DOES NOT, so value={35.6} announces 36 in one column and 35.6 in the other — carried through config.valueRange, so the rounding travels with the contract that has a `min`.',
    symbol: ["const valueKnown = value !== undefined", "const valueNow = !valueKnown", "Math.round(raw)"],
    where: "Progress(); the aria-valuenow attribute on the root",
  },
  "behavior.value-text": {
    order: 5,
    how: 'SHADCN ONLY, AND IT IS THE EXACT MIRROR OF THE VISIBLE LABEL. Radix writes `aria-valuetext={valueLabel}` from a `getValueLabel` prop defaulting to `${Math.round((value / max) * 100)}%` — so a shadcn progress ANNOUNCES a percentage it never DRAWS, while a Salt progress DRAWS one ("75 %", with a space) and never announces it, because neither Salt export writes aria-valuetext at all. Two systems solved the same problem in opposite channels and neither did both. M3 is [R] off. Kept as a switchable config row so the mirror is two cells in the matrix rather than a paragraph in a doc.',
    symbol: "config.valueText && valueKnown",
    where: "Progress(); the aria-valuetext attribute on the root",
  },

  // --- 4. draw it as text --------------------------------------------
  "behavior.label-formatting": {
    order: 6,
    how: 'SALT ONLY, and CONTENT FORMATTING IS CHARACTER (CLAUDE.md law 3), so the exact string is the row. Determinate: `${Math.round(progress)} %` — rounded, and WITH A SPACE BEFORE THE PERCENT SIGN, which is neither Radix\'s "66%" nor "66 percent". Indeterminate: the literal EM DASH string "— %" — a designed value for "we do not know yet", not a blank. And `progress` is the NORMALISED figure, not `value`, so with a non-zero min the label and aria-valuenow deliberately disagree. The em dash is written in the skeleton as a BACKSLASH ESCAPE rather than as a raw glyph, per docs/CARD-MATRIX.md\'s NUL-byte lesson — identical string at runtime, and nothing non-obvious in the bytes of a file every gate greps. shadcn and M3 have no label to format.',
    symbol: ['config.labelFormat === "percent-spaced"', '"\\u2014 %"'],
    where: 'Progress(); the text content of [data-slot="progress-label"]',
  },

  // --- 5. draw the second, pending value ------------------------------
  "behavior.buffer-visibility": {
    order: 7,
    how: 'SALT ONLY, and it is inference again rather than a prop. The linear form renders the buffer element only when `bufferValue && bufferValue > 0` — a TRUTHY test AND a positivity test, so `bufferValue={0}` renders nothing while STILL counting as determinate for the isIndeterminate check above. That is a genuine source edge and the two halves are asserted separately for that reason. In both shapes the buffer is excluded from the label and from every ARIA attribute — examples.mdx: "The buffer is a pending value so will not affect the progress label." — so it is a purely visual second track with no assistive representation at all. shadcn and M3 have no second value of any kind.',
    symbol: ["bufferValue !== undefined &&", "bufferValue > 0"],
    where: 'Progress(); gates [data-slot="progress-buffer"]',
  },

  // --- 6. stay inert ---------------------------------------------------
  "behavior.non-interactive": {
    order: 8,
    how: 'CONFIRMED ABSENCE IN ALL THREE, and the only honest way to assert an absence is negatively — hence the `forbidden` extension declared in this file\'s header. Grepped in source: no tabIndex, no onClick, no onKeyDown, no :hover, no :focus, no :focus-visible, no disabled prop and no :disabled selector anywhere in LinearProgress.{tsx,css}, CircularProgress.{tsx,css}, shadcn\'s progress.tsx, the Radix primitive, or any of the five M3 token files in EITHER edition — where the card and tab files both GAINED a focus-indicator family in `latest`. A progress bar is an OUTPUT. This is also the structural line against `slider`, which shares Salt\'s --salt-sentiment-neutral-track and --salt-size-bar tokens and is an INPUT with a focusable thumb, role="slider" and a keyboard contract: a shared foundation token is not a shared component.',
    forbidden: ["tabIndex", "onClick", "onKeyDown", "onKeyUp", "onPointerDown", "onMouseDown"],
    where: "Progress(); asserted by absence — the root publishes ARIA and data attributes only",
  },
}

/* ---------------------------------------------------------------------
 * THE DIALOG TRAP, checked mechanically — INVERTED FOR THIS COMPONENT.
 * docs/DIALOG-MATRIX.md's closing section: two behaviour rows were
 * implemented, cited, and passed this gate — and never ran, because their
 * useEffect read a ref to a node that renders one tick later and the
 * dependency array omitted the state gating that node. check-tabs- and
 * check-card-behavior.mjs answer that by listing every ref-reading effect
 * and asserting its dependency array.
 *
 * skeleton/progress.tsx has ZERO effects and ZERO refs. Every behaviour
 * above is a pure computation performed during render, and the ONE thing
 * that might have tempted a measurement — the fill percentage — is
 * deliberately an INLINE STYLE on the element that consumes it rather than
 * a measured width routed through a custom property (lesson 2, and the
 * SELECT-MATRIX.md frozen-width bug). Source does the same in both Salt and
 * shadcn, so there is nothing to measure and nothing to guard.
 *
 * An empty guard list would be vacuously true and would quietly stop
 * protecting anything the day someone added a measurement, so the block is
 * INVERTED, exactly as check-badge-behavior.mjs's is: it asserts the
 * skeleton STAYS effect-free and ref-free. Introducing one without adding a
 * guard entry here fails the gate — which matters more for progress than for
 * badge, because a percentage is precisely the kind of value someone would
 * later be tempted to measure from the DOM.
 * ------------------------------------------------------------------- */
const REF_EFFECT_GUARDS = []
const NO_EFFECT_TOKENS = ["useEffect", "useLayoutEffect", "useRef"]

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/progress.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`progress behaviour self-check — ${behaviorRows.length} behavior rows in progress.template.json`)
lines.push("")

if (behaviorRows.length === 0) {
  lines.push(
    "  NO BEHAVIOUR ROWS — progress would be a purely presentational bar and this gate would have nothing to prove.",
  )
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
  const symbols = entry.symbol === undefined ? [] : [].concat(entry.symbol)
  const forbidden = entry.forbidden ?? []
  if (symbols.length === 0 && forbidden.length === 0) {
    // the `forbidden` extension must not become a way to smuggle in an
    // entry that proves nothing at all
    problems.push("entry declares neither `symbol` nor `forbidden` and therefore asserts nothing")
  }
  for (const s of symbols) {
    if (!source.includes(s)) problems.push(`cited code \`${s}\` not found in ${SKELETON}`)
  }
  for (const f of forbidden) {
    if (source.includes(f)) {
      problems.push(
        `forbidden token \`${f}\` FOUND in ${SKELETON} — this row is a confirmed absence in all three systems; if a source now has it, the matrix cell has to change first.`,
      )
    }
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

// the brief's literal minimum, reported explicitly so it is visible that
// the wider check above subsumes it
const lockedInfo = behaviorRows.filter((r) => r.policy === "locked" && r.channel === "info")
lines.push("")
lines.push(
  `brief's minimum subset (policy=locked, channel=info): ${lockedInfo.length} rows — ${lockedInfo
    .map((r) => r.id)
    .join(", ")} — all present in the checklist: ${lockedInfo.every((r) => CHECKLIST[r.id]) ? "yes" : "NO"}`,
)

// checklist entries with no matching row would mean the checklist has
// drifted ahead of the template
for (const id of Object.keys(CHECKLIST)) {
  if (!behaviorRows.some((r) => r.id === id)) {
    failures.push(`checklist entry '${id}' has no matching behavior row in progress.template.json (stale checklist)`)
  }
}

// the dialog trap, checked mechanically — inverted, see the block comment
lines.push("")
lines.push("ref-reading effects and their gating state (docs/DIALOG-MATRIX.md closing correction):")
if (REF_EFFECT_GUARDS.length === 0) {
  const found = NO_EFFECT_TOKENS.filter((t) => source.includes(t))
  if (found.length) {
    failures.push(
      `ref-effect guard: ${SKELETON} now contains ${found.join(", ")} but REF_EFFECT_GUARDS is empty. Progress's behaviours are all pure render-time computations and its percentage is an INLINE style on the element that uses it, never a measurement; the moment that changes it must be listed here with its dependency array, or it can repeat the dialog failure — an effect that reads a ref to a conditionally-rendered node and omits that node's gate runs once against null and never again.`,
    )
    lines.push(`  FAIL an effect or ref was introduced without a guard entry: ${found.join(", ")}`)
  } else {
    lines.push("  ok   NONE — and the check is inverted rather than skipped.")
    lines.push(
      "         skeleton/progress.tsx contains no useEffect, no useLayoutEffect and no useRef: every behaviour above is a pure computation performed during render, and the fill percentage is written as an inline style on the element that consumes it rather than measured from the DOM (lesson 2). An empty guard list would be vacuously true, so this block instead asserts that the skeleton STAYS effect-free; adding one without declaring it here fails the gate.",
    )
  }
}
for (const guard of REF_EFFECT_GUARDS) {
  if (!source.includes(guard.deps)) {
    failures.push(
      `ref-effect guard: dependency array ${guard.deps} not found in ${SKELETON} — the ${guard.name} effect may no longer list its gating state (${guard.gate}).`,
    )
    lines.push(`  FAIL ${guard.name}`)
  } else {
    lines.push(`  ok   ${guard.name}`)
    lines.push(`         deps ${guard.deps}`)
  }
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and the ref-effect block holds.`,
)
lines.push("")
lines.push(
  "NOTE, AND IT IS THE SAME NOTE check-dialog-, check-tabs-, check-card- AND check-badge-behavior.mjs PRINT: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. Dialog shipped two behaviour effects that were correctly written, correctly cited, passed this exact gate, and never executed. A real conformance harness would drive the skeleton in a DOM and assert observable behaviour — that a Salt progress with NO value renders a 66% band travelling on a 1.8s loop, shows the literal \"\\u2014 %\", and carries NO aria-valuenow, while the SAME absent value in the shadcn column renders a motionless EMPTY bar that still reports data-state=\"indeterminate\"; that min=20 max=40 value=35 shows \"75 %\" and announces valuenow=35 in Salt and cannot be expressed at all in shadcn; that value=35.6 announces 36 in Salt and 35.6 in shadcn; that bufferValue={0} renders no buffer and yet suppresses the indeterminate band, while bufferValue={65} renders an OPAQUE hole with a 1px accent hairline under a solid fill; that an M3 bar at 100% shows a 4px primary-coloured stop dot with a 4px gap before it; that the three fill mechanisms differ at 0% (no box / a full-width box parked left / a full-width box collapsed with its radius squashed); and that NO column, in either shape, renders an indeterminate CIRCULAR progress — that glyph belongs to `spinner`, and the chassis clamps it. ONE ENVIRONMENT CAVEAT FOR WHOEVER DRIVES IT (docs/TABS-MATRIX.md's validation pass, repeated in check-card- and check-badge-behavior.mjs): in a hidden/background tab document.activeElement updates on a programmatic .focus() but the focus EVENT is suppressed. NOTHING IN THIS COMPONENT DEPENDS ON FOCUS ARRIVING — progress is non-interactive in all three systems and has no focus rule anywhere (behavior.non-interactive), so unlike badge and card there is no false-negative hazard here. The hazard that DOES apply is a different one: two rows are ANIMATIONS (style.indeterminate.duration / .easing), and a background tab may throttle or coalesce rAF, so the travelling band should be verified by reading the computed animation-name/-duration rather than by eye or by screenshot diff. Logged for the owner alongside docs/SELECT-MATRIX.md findings 13-16.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
