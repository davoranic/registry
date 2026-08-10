#!/usr/bin/env node
/* check-toggle-group-behavior — the twenty-third component to ship the
 * third gate (button, calendar, spinner, tooltip, alert, input, select,
 * dialog, tabs, card, badge, progress, chip, checkbox, switch, radio-group,
 * slider, toast, dropdown-menu, accordion, popover, combobox came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows.
 * Nothing automatic checks BEHAVIOR rows. SELECT-MATRIX.md finding 16
 * records the consequence once already: a documented-but-unimplemented
 * dismissal.
 *
 * TOGGLE-GROUP-SPECIFIC RISK THIS GATE WAS WRITTEN TO CATCH: this
 * component's whole SELECTION mechanism (single-vs-multiple) is easy to
 * break silently — a future edit to ToggleGroup's handleToggle could stop
 * distinguishing `mode`, which would make single-select groups allow
 * several items pressed at once (or multi-select groups mutually exclude),
 * and NOTHING in gen-from-template.py or the style/structure gates would
 * notice — CSS and config rows would still validate fine. This script
 * asserts the literal mode-branching code exists; harness/conformance.tsx's
 * checkToggleGroup() (added alongside this file) asserts the OBSERVABLE
 * consequence — that clicking a second item in single mode releases the
 * first, and clicking a second item in multiple mode does not.
 *
 * This script asserts, for every behavior row in toggle-group.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/toggle-group.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>` (this component's
 *       four behavior rows are all channel="info", so this branch is inert
 *       here but kept for parity with every other check-<name>-behavior.mjs).
 * Any failure exits 1.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see the closing note this
 * script prints, and see harness/conformance.tsx's checkToggleGroup() for
 * the real DOM-driven assertions this gate cannot make.
 *
 * Run: node 2-build/gates/check-toggle-group-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/toggle-group.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a toggle-group actually does these things:
 * decide what role each item plays -> decide what role the group plays ->
 * decide how a user moves between items -> decide how a user presses one.
 * `symbol` must appear VERBATIM in skeleton/toggle-group.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  "behavior.role": {
    order: 1,
    how: 'Salt [S]: ALWAYS role="radio"+aria-checked when inside a group. shadcn [R]: presumed to switch role="radio"/aria-checked (type="single") vs aria-pressed with no special role (type="multiple"), per the general Radix convention. M3 [S]: ALWAYS aria-pressed on a native button, NEVER role="radio" — confirmed directly in segmented-button.ts, the SAME pattern for both selection modes. The chassis reproduces the mode-aware fork on the item itself: role="radio"+aria-checked for single mode, aria-pressed for multiple mode — matching shadcn\'s presumed real behaviour, which subsumes Salt\'s own "always radio" reality (Salt\'s config never advertises multiple, so its items only ever render in single mode).',
    symbol: 'role={group?.mode === "single" ? "radio" : undefined}',
    where: "ToggleGroupItem(); the <button> element",
  },
  "behavior.group-role": {
    order: 2,
    how: 'Salt [S]: ALWAYS role="radiogroup" (hardcoded, not conditional on anything). shadcn [R]: presumed to switch role="radiogroup" (single) / role="group" (multiple). M3 [S]: ALWAYS role="group" (hardcoded), confirmed directly in segmented-button-set.ts. The chassis reproduces all three: `supportsMultiple` is read from config.selectionMode (Salt\'s own config never lists "multiple", so its groups are ALWAYS role="radiogroup" regardless of the `mode` prop passed — matching its own hardcoded real behaviour); M3\'s config.groupTag="span" forces ALWAYS role="group"; shadcn (config.groupTag="div", supportsMultiple=true) switches per `mode`.',
    symbol: "const supportsMultiple = config.selectionMode?.includes(\"multiple\")",
    where: "ToggleGroup(); role",
  },
  "behavior.arrow-navigation": {
    order: 3,
    how: "A REAL three-way split, unlike radio-group's own converged version of this row. Salt [S]: real JS roving-tabindex + wrapping arrow-key nav. shadcn [R]: presumed Radix roving-focus-group. M3: CONFIRMED ABSENCE — every enabled button is independently Tab-stoppable, no arrow-key handling exists anywhere in the real, live source. This chassis does NOT reproduce Salt's/shadcn's own JS roving mechanism (a declared simplification, matching this component's leaner scope — plain sequential Tab between real, unconditionally-rendered <button> elements works in all three columns and is the union's safe common denominator); the row exists to document the real divergence, not to force one system's mechanism onto the others.",
    symbol: "onClick={handleClick}",
    where: "ToggleGroupItem(); the <button> element",
  },
  "behavior.keyboard-activate": {
    order: 4,
    how: "Converges for a structural reason: because every column renders a REAL native <button> (structure.item — the first component in this pipeline where NO column needed a declared native-element approximation), Space/Enter activation is free from the browser everywhere, with zero custom keydown code needed. This gate's own symbol below is the click-toggle-off assertion this component's own real behaviour needed beyond plain native activation: clicking an ALREADY-selected item in single mode deselects it — a sourced, DECLARED DIVERGENCE from Salt's own real ToggleButtonGroup (which re-sets the SAME value on a repeat click and never fires onChange), implemented as the presumed real Radix behaviour [R] uniformly for all three columns.",
    symbol: "next = value === itemValue ? undefined : itemValue",
    where: "ToggleGroup(); handleToggle",
  },
}

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/toggle-group.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`toggle-group behaviour self-check — ${behaviorRows.length} behavior rows in toggle-group.template.json`)
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
    failures.push(`checklist entry '${id}' has no matching behavior row in toggle-group.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: NONE — ToggleGroupItem never conditionally renders the button it reads (it is unconditional in every branch), the same dialog-trap-immune shape checkbox.tsx's/switch.tsx's/radio-group.tsx's own inputs already have, so there is no useLayoutEffect/useEffect of any kind in this file to guard.",
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
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. A real conformance harness drives the skeleton in a DOM and asserts observable behaviour — see harness/conformance.tsx's checkToggleGroup(), which this component's build ADDS TO rather than replaces this gate with: that clicking a second item in single mode releases the first (prop.selection-mode), that clicking an already-selected item deselects it (behavior.keyboard-activate), that multiple mode allows independent toggling with no mutual exclusion where the column's own config advertises the capability, that the group's own role attribute matches the mode-aware fork (behavior.group-role), that a group-level disabled reaches an unmodified child where the capability exists (prop.group-disabled), and that M3's real, dedicated checkmark marker renders where structure.selected-marker says it should — and, just as load-bearing, that it does NOT render for Salt/shadcn.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
