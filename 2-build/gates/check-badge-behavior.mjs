#!/usr/bin/env node
/* check-badge-behavior — the THIRD GATE, scoped to badge.
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
 * BADGE IS THE SMALLEST COMPONENT TO SHIP THIS GATE, and it is the first
 * whose behaviour is entirely about CONTENT FORMATTING and INFERENCE rather
 * than about keyboards. It has SIX behavior rows, two of them locked, and
 * not one of them is an event handler: no system gives a badge a role, a
 * tab stop, a handler or a disabled state. What it does have is a component
 * that DECIDES ITS OWN SHAPE from what you did not pass — Salt renders a dot
 * when there is no value and anchors itself when there is a child — and one
 * that CLAMPS a number but never a string. None of that is visible in a
 * screenshot, and the generator cannot see any of it either: a chassis that
 * silently rendered every badge as a pill would pass every other gate in the
 * repo.
 *
 * This script asserts, for every behavior row in badge.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/badge.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>`.
 * Any failure exits 1.
 *
 * The brief's minimum was "fail if a locked, channel:info behavior row has
 * no checklist entry". That subset is reported separately below, but the
 * check implemented here is deliberately wider: it covers every behavior
 * row of every policy and every channel.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS. See the closing note the
 * script prints — dialog shipped TWO effects that passed this exact gate
 * and never executed.
 *
 * Run: node scripts/check-badge-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/badge.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a badge actually performs these things:
 * decide what shape you are -> decide where you go -> produce your label
 * -> announce (or deliberately do not) -> stay inert.
 * `symbol` must appear VERBATIM in skeleton/badge.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  // --- 1. deciding which of two shapes to be ------------------------
  "behavior.dot-detection": {
    order: 1,
    how: 'Salt INFERS the dot form from the ABSENCE of a value — `const dotBadge = typeof value === "undefined"` — rather than from a prop, which is exactly why prop.content is listed dot-first (lesson 3: source default goes first). A bare <Badge /> is a dot. The chassis reproduces the inference, lets an explicit `content` prop override it, and CLAMPS the result to "label" in any column whose structure.dot is off, so shadcn can never reach a form it does not have. M3 is [R]: two unambiguous token families (unprefixed = 6px dot, large-* = 16px labelled) and no element in the clone to say how one is chosen.',
    symbol: 'value === undefined && children === undefined && supportsDot ? "dot" : "label"',
    where: "Badge(); published as data-content, which style.badge.dot and style.badge.anchor@dot select on",
  },

  // --- 2. deciding where to sit -------------------------------------
  "behavior.anchor-detection": {
    order: 2,
    how: 'Salt INFERS the anchored form from the PRESENCE of a child — `[withBaseName("topRight")]: children`. So two of its three modes are decided by what you pass rather than by what you ask for, and the source JSDoc confirms the default is the one most readers would not guess: "If a child is provided the Badge will render top right. By defualt renders inline." shadcn and M3 are off — shadcn has no positioning utility at all, and M3 keeps its anchoring geometry on the HOST (navigation-bar / navigation-rail, and there it is deprecated in favour of md.comp.badge.*).',
    symbol: 'host !== undefined && supportsAnchor ? "anchored" : "inline"',
    where: "Badge(); published as data-anchored on the pill and data-placement on the root",
  },

  // --- 3. producing the label ---------------------------------------
  "behavior.value-clamping": {
    order: 3,
    how: 'Salt only, and it has a sourced ASYMMETRY that a naive implementation would flatten: a NUMBER above `max` renders as `${max}+`, and a STRING is never clamped at any length. Both halves are source — Badge.tsx\'s ternary tests `typeof value === "number"` before comparing, and usage.mdx says "When you pass a string, the badge will not clamp the value". `max` defaults to 999. shadcn and M3 have no value prop at all (their labels are arbitrary children), so they carry no `max`, the guard falls through, and the label passes unchanged — the same code path serving a real cross-system divergence rather than a branch on the system name.',
    symbol: 'typeof value === "number" && typeof maxValue === "number" && value > maxValue',
    where: "Badge(); the clamped result feeds the [data-slot=\"badge-label\"] child",
  },

  // --- 4. announcing, or deliberately not ----------------------------
  "behavior.role": {
    order: 4,
    how: 'UNANIMOUS ABSENCE, and the unanimity is the point. Salt writes className, ref and {...rest} on two spans and nothing else; shadcn writes data-slot and data-variant and nothing else; M3 is [R] with no element to grep. Salt\'s accessibility.mdx pushes the whole contract onto the consumer ("ensure the focusable element has an aria-label or aria-labelledby attribute that describes the badge, such as \'9 notifications\'"). The chassis computes the role FROM CONFIG rather than hardcoding `undefined`, so that "no column turns it on" is a value in the matrix instead of an assumption buried in the component.',
    symbol: "const role: string | undefined = config.role || undefined",
    where: "Badge(); consumed as the role attribute on the pill",
  },
  "behavior.live-region": {
    order: 5,
    how: 'OFF IN ALL THREE COLUMNS, implemented anyway. For a component whose whole job is announcing a changing count, no system writing aria-live, aria-atomic or role="status" is surprising and load-bearing: a Salt badge whose number changes while nothing is focused announces nothing at all, and its accessibility.mdx only claims the badge is read when the user NAVIGATES to it. Carried as a capability the chassis has and every column leaves off, so the gap is a matrix cell rather than a silent omission — the same treatment TABS-MATRIX.md declared approximation 4 gave an M3 tab\'s aria-disabled.',
    symbol: 'config.liveRegion && config.liveRegion !== "off"',
    where: "Badge(); consumed as the aria-live attribute on the pill",
  },

  // --- 5. staying inert ---------------------------------------------
  "behavior.activation": {
    order: 6,
    how: 'No system binds a handler. Salt is inert by design and says so in prose ("Badges are independent of user action"; "To trigger an immediate action ... Instead, use Pill"). M3 is [R] inert, and unusually well evidenced for a tokens-only clone: _md-comp-badge.scss has no state-layer, focus-indicator, hover, pressed or disabled family in either edition, where the card and tab files carry several each. shadcn DELEGATES: `asChild` swaps the span for whatever the consumer supplies, and that is the same moment its [a&]:hover rules become reachable — which is why prop.interaction is a real axis and not a courtesy one. The chassis expresses it as an ELEMENT BRANCH, so a shadcn link badge really is an anchor and style.badge.hover\'s [data-interaction="link"] gate really has something to gate.',
    symbol: 'const Comp: "span" | "a" = interactionMode === "link" ? "a" : "span"',
    where: "Badge(); Comp is the pill element, and href is written only when Comp is an anchor",
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
 * skeleton/badge.tsx has ZERO ref-reading effects, and zero effects of any
 * kind: every behaviour above is a pure computation performed during render.
 * An empty guard list would therefore be vacuously true and would quietly
 * stop protecting anything the day someone adds a measurement. So the block
 * is inverted: it asserts that the skeleton still contains NO effect and NO
 * ref. If either appears without a matching guard entry being added here,
 * this gate fails and the author has to come back and declare it.
 * ------------------------------------------------------------------- */
const REF_EFFECT_GUARDS = []
const NO_EFFECT_TOKENS = ["useEffect", "useLayoutEffect", "useRef"]

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/badge.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`badge behaviour self-check — ${behaviorRows.length} behavior rows in badge.template.json`)
lines.push("")

if (behaviorRows.length === 0) {
  // The deliverable is explicit: if badge genuinely had no behaviour rows,
  // say so here rather than skipping the gate.
  lines.push(
    "  NO BEHAVIOUR ROWS — badge would be a purely presentational annotation and this gate would have nothing to prove.",
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
    failures.push(`checklist entry '${id}' has no matching behavior row in badge.template.json (stale checklist)`)
  }
}

// the dialog trap, checked mechanically — inverted, see the block comment
lines.push("")
lines.push("ref-reading effects and their gating state (docs/DIALOG-MATRIX.md closing correction):")
if (REF_EFFECT_GUARDS.length === 0) {
  const found = NO_EFFECT_TOKENS.filter((t) => source.includes(t))
  if (found.length) {
    failures.push(
      `ref-effect guard: ${SKELETON} now contains ${found.join(", ")} but REF_EFFECT_GUARDS is empty. Badge's behaviours are all pure render-time computations; the moment one becomes a measurement it must be listed here with its dependency array, or it can repeat the dialog failure — an effect that reads a ref to a conditionally-rendered node and omits that node's gate runs once against null and never again.`,
    )
    lines.push(`  FAIL an effect or ref was introduced without a guard entry: ${found.join(", ")}`)
  } else {
    lines.push("  ok   NONE — and the check is inverted rather than skipped.")
    lines.push(
      "         skeleton/badge.tsx contains no useEffect, no useLayoutEffect and no useRef: every behaviour above is a pure computation performed during render, so there is no ref-to-a-later-node hazard to guard. An empty guard list would be vacuously true, so this block instead asserts that the skeleton STAYS effect-free; adding one without declaring it here fails the gate.",
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
  "NOTE, AND IT IS THE SAME NOTE check-dialog-, check-tabs- AND check-card-behavior.mjs PRINT: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. Dialog shipped two behaviour effects that were correctly written, correctly cited, passed this exact gate, and never executed. A real conformance harness would drive the skeleton in a DOM and assert observable behaviour — that a Salt badge with no value renders as a DOT and one with a value renders as a pill; that value=1000 renders \"999+\" while value=\"VERYLONGSTRING\" renders in full and is NOT clamped; that value=200 with max=99 renders \"99+\"; that passing a host anchors the pill top-right and that the DOT form anchors at a different offset (half its own width, against the labelled form's full spacing-100); that a shadcn badge is a <span> with NO hover response until interaction=\"link\" makes it an <a>, at which point the fill darkens to 90%; that switching the shadcn variant to `ghost` leaves a transparent box that is invisible until hovered as a link; and that no badge in any column carries a role, a tabindex or an aria-live. ONE ENVIRONMENT CAVEAT FOR WHOEVER DRIVES IT (docs/TABS-MATRIX.md's validation pass, repeated in check-card-behavior.mjs): in a hidden/background tab document.activeElement updates on a programmatic .focus() but the focus EVENT is suppressed. Badge has no JS focus handling, so nothing here depends on a focus event arriving — but style.badge.focus in the shadcn column is a :focus-visible rule on an element that is only focusable under interaction=\"link\", so exercising it needs a real or synthetic focus on the anchor (a bubbling `focusin` after .focus()), or the environment manufactures a convincing false negative. That remains the outstanding half. Logged for the owner alongside docs/SELECT-MATRIX.md findings 13-16.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
