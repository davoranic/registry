#!/usr/bin/env node
/* check-tabs-behavior — the missing THIRD GATE, scoped to tabs.
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
 * Tabs is the most behaviour-dense component in the registry after dialog —
 * thirteen behavior rows covering a roving tabindex, two arrow-key regimes,
 * Home/End, wrapping, automatic-vs-manual activation, disabled skipping,
 * two pointer-commit orders, two ARIA wirings, conditional panel
 * focusability, hidden-vs-unmounted panels, focus scrolling and an overflow
 * menu — none of which a screenshot or the generator can see.
 *
 * This script asserts, for every behavior row in tabs.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/tabs.tsx
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
 * Run: node scripts/check-tabs-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/tabs.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a tab set actually performs these things:
 * announce -> take a tab stop -> navigate -> activate -> wire the panel ->
 * overflow.
 * `symbol` must appear VERBATIM in skeleton/tabs.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  // --- 1. what the parts announce themselves as ----------------------
  "behavior.role": {
    order: 1,
    how: 'role="tablist" on the strip AND on the vertical overflow list, role="tab" on every trigger, role="tabpanel" on every panel. In the wrapper shell the tab BOX additionally carries role="presentation", as Salt\'s Tab does, so the box is not announced twice.',
    symbol: 'role: "tab" as const',
    where: "the triggerProps object in renderTab(); tablist / tabpanel on their own elements",
  },
  "behavior.controls": {
    order: 2,
    how: "every trigger points at its panel with aria-controls, and only when panels are actually rendered — reproducing Salt's registry behaviour (aria-controls is undefined until a panel mounts) with a config gate rather than a Map.",
    symbol: '"aria-controls": config.panel ? panelId(item.value) : undefined',
    where: "the triggerProps object in renderTab()",
  },
  "behavior.labelled-by": {
    order: 3,
    how: "every panel is named by its tab through aria-labelledby, the mirror of behavior.controls. Both ids are derived from one baseId, which is Radix's mechanism; Salt's context registry produces the same attribute by a different route and is a DECLARED GAP.",
    symbol: "aria-labelledby={tabId(item.value)}",
    where: "the panel element in the return",
  },

  // --- 2. who holds the tab stop -------------------------------------
  "behavior.roving-tabindex": {
    order: 4,
    how: "exactly one tab is in the page tab order: the focus-visible one, else the selected one if it is in the strip, else the first navigable tab (Salt's own fallbackTabStop). Every other tab is tabIndex -1. Switching the row off would put every tab in the tab order.",
    symbol: "const isTabStop =",
    where: "Tabs(); consumed as tabIndex in triggerProps",
  },

  // --- 3. moving between tabs ----------------------------------------
  "behavior.arrow-keys": {
    order: 5,
    how: 'two regimes. "horizontal" (Salt, M3) binds ArrowLeft/ArrowRight whatever the orientation — Salt hard-codes exactly that map and gives Up/Down to the overflow menu instead. "orientation" (shadcn) follows the orientation prop, so a vertical shadcn tab list arrows on Up/Down.',
    symbol: 'config.arrowKeys === "orientation" && vertical',
    where: "onStripKeyDown()",
  },
  "behavior.home-end": {
    order: 6,
    how: "Home focuses the first navigable tab, End the last — gated on the row so a column that switches it off really loses the keys.",
    symbol: 'config.homeEnd && e.key === "Home"',
    where: "onStripKeyDown()",
  },
  "behavior.wrap": {
    order: 7,
    how: "arrowing past the last tab wraps to the first (modular arithmetic, Salt's useCollection({wrap:true}) and Radix's loop=true); with the row off it clamps at both ends instead.",
    symbol: "config.wrapNavigation",
    where: "moveFocus()",
  },
  "behavior.disabled-navigation": {
    order: 8,
    how: '"reachable" (Salt) writes aria-disabled, keeps the tab in the navigable list and in the roving order, and blocks activation separately. "skipped" (shadcn) writes the native disabled attribute AND filters the tab out of the navigable list, so arrows step over it.',
    symbol: 'const skipsDisabled = (config.disabledNavigation ?? "reachable") === "skipped"',
    where: "Tabs(); consumed by `navigable`, isTabStop() and triggerProps",
  },

  // --- 4. committing a selection -------------------------------------
  "behavior.activation-mode": {
    order: 9,
    how: '"automatic" (shadcn default, M3 [R]) commits on FOCUS, so arrowing swaps the panel on every step. "manual" (Salt) commits only on Enter/Space or a press. This is the headline divergence of the component and it is invisible in a screenshot.',
    symbol: 'if (mode === "automatic" && !disabled && !isSelected) commit(item.value)',
    where: "triggerProps.onFocus in renderTab()",
  },
  "behavior.pointer-activation": {
    order: 10,
    how: '"click" (Salt, M3) binds onClick. "mousedown" (shadcn/Radix) commits on mousedown with the left-button / ctrl-key guard AND focuses the trigger BEFORE changing the value, because the active tab\'s element can be removed before its blur fires (radix-ui/primitives#3600).',
    symbol: "const commitsOnMouseDown =",
    where: "Tabs(); branched in `pointerProps` inside renderTab()",
  },

  // --- 5. the panel --------------------------------------------------
  "behavior.panel-focusable": {
    order: 11,
    how: '"always" (shadcn) hard-codes tabIndex 0 on every panel. "conditional" (Salt, M3 [R]) makes the panel a tab stop only when it holds nothing focusable, measured with a querySelector over the tabbable set behind a MutationObserver on childList/subtree/attributes — Salt\'s own mechanism.',
    symbol: "const panelAlwaysFocusable =",
    where: "Tabs(); the panel-focusable effect and the panel element's tabIndex",
  },
  "behavior.panel-mounting": {
    order: 12,
    how: '"hidden" (Salt, M3 [R]) renders every panel and hides the inactive ones with the hidden attribute, so their state survives a tab change. "unmount" (shadcn/Radix Presence) renders only the selected one, destroying the rest.',
    symbol: "!panelsUnmount || item.value === selected",
    where: "the panels .filter() in the return",
  },
  "behavior.scroll-into-view": {
    order: 13,
    how: "Salt only: focusing a tab scrolls its BOX (the [data-slot=\"tab\"] ancestor, not the button) into view with block/inline 'nearest', while the arrow handler focuses with preventScroll so this is the only scroller.",
    symbol: 'box.scrollIntoView({ block: "nearest", inline: "nearest" })',
    where: "triggerProps.onFocus in renderTab()",
  },

  // --- 6. overflow ---------------------------------------------------
  "behavior.overflow-navigation": {
    order: 14,
    how: "Salt only, and a PARTIAL implementation with a declared gap. Implemented: the width measurement and collapse, the role=tab overflow button at tabIndex -1 with aria-expanded/aria-controls, a second VERTICAL role=tablist, ArrowUp/ArrowDown/Home/End inside it, Escape and Shift+Tab closing it and returning focus to the button, an outside pointerdown dismiss, and commit-then-close. NOT implemented (DECLARED GAP): the floating engine — no collision detection, no flip, no shift, no viewport clamp — and Salt's element-moving portal render mode.",
    symbol: "const onMenuKeyDown =",
    where: "Tabs(); with the measurement in measureOverflow() and the dismiss in the menuOpen effect",
  },
}

/* ---------------------------------------------------------------------
 * THE DIALOG TRAP, checked mechanically.
 * docs/DIALOG-MATRIX.md's closing section: two behaviour rows were
 * implemented, cited, and passed this gate — and never ran, because their
 * useEffect read a ref to a node that renders one tick later and the
 * dependency array omitted the state gating that node. This block asserts
 * that every ref-reading effect in the skeleton names its gate.
 * ------------------------------------------------------------------- */
const REF_EFFECT_GUARDS = [
  {
    name: "overflow measurement (reads listRef / tabElsRef / overflowButtonRef)",
    deps: "[overflowOn, measureOverflow, items, visibleCount, menuOpen]",
    gate: "visibleCount / menuOpen — they decide which tabs are rendered in the strip",
  },
  {
    name: "slide-indicator measurement (reads indicatorRef / the selected tab element)",
    deps: "[motion, positionSlider, visibleCount, activeEmphasis, activeAppearance, activeOrientation]",
    gate: "visibleCount (a collapsed tab has no strip element) and, via positionSlider's own closure, selected",
  },
  {
    name: "panel-focusable measurement (reads panelElsRef)",
    deps: "[panelAlwaysFocusable, config.panel, selected, panelsUnmount]",
    gate: "selected — it decides which panel exists at all under panelMounting = \"unmount\"",
  },
  {
    name: "overflow-menu open + dismiss (reads menuRef / overflowButtonRef)",
    deps: "[menuOpen]",
    gate: "menuOpen — the menu does not exist until it is true",
  },
]

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/tabs.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`tabs behaviour self-check — ${behaviorRows.length} behavior rows in tabs.template.json`)
lines.push("")

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
    failures.push(`checklist entry '${id}' has no matching behavior row in tabs.template.json (stale checklist)`)
  }
}

// the dialog trap, checked mechanically
lines.push("")
lines.push("ref-reading effects and their gating state (docs/DIALOG-MATRIX.md closing correction):")
for (const guard of REF_EFFECT_GUARDS) {
  if (!source.includes(guard.deps)) {
    failures.push(
      `ref-effect guard: dependency array ${guard.deps} not found in ${SKELETON} — the ${guard.name} effect may no longer list its gating state (${guard.gate}). An effect that reads a ref to a conditionally-rendered node and omits that node's gate runs once against null and never again.`,
    )
    lines.push(`  FAIL ${guard.name}`)
    lines.push(`         expected deps ${guard.deps} — NOT FOUND`)
  } else {
    lines.push(`  ok   ${guard.name}`)
    lines.push(`         deps ${guard.deps}`)
    lines.push(`         gate: ${guard.gate}`)
  }
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and every ref-reading effect names its gating state.`,
)
lines.push("")
lines.push(
  "NOTE, AND IT IS THE SAME NOTE check-dialog-behavior.mjs PRINTS: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. Dialog shipped two behaviour effects that were correctly written, correctly cited, passed this exact gate, and never executed — a useEffect read a ref to a node that renders one tick later and the dependency array omitted the gating state. The ref-effect block above is a direct response to that failure, but it only checks that a dependency array LOOKS right; it cannot observe a render. A real conformance harness would drive the skeleton in a DOM and assert observable behaviour — arrow keys move focus and (in automatic mode only) the panel, a disabled tab is stepped over or landed on per the column, Home/End reach the ends, the panel is a tab stop only when it should be, and the overflow menu opens, navigates, commits and closes. That remains the outstanding half. Logged for the owner alongside docs/SELECT-MATRIX.md findings 13-16.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
