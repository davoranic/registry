#!/usr/bin/env node
/* check-chip-behavior — the THIRD GATE, scoped to chip.
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
 * CHIP HAS THE MOST BEHAVIOUR OF ANY COMPONENT SO FAR THAT IS NOT A
 * COMPOSITE — NINE rows, five of them locked — and, unlike badge, most of
 * them ARE event handlers. It is also the first component whose central
 * question is an ACCESSIBILITY FORK rather than a style one: is the delete
 * control a nested focusable inside a focusable? Salt says no and M3's spec
 * says yes, and neither answer is visible in a screenshot or in a token
 * table. A chassis that had rendered one trailing button for every column
 * would have passed the generator, the axis audit and every render, and
 * silently given every Salt pill a second tab stop it does not have.
 *
 * This script asserts, for every behavior row in chip.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/chip.tsx
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
 * Run: node scripts/check-chip-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/chip.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a chip actually performs these things:
 * decide what you ARE -> announce it -> take focus -> respond to keys ->
 * toggle -> be removed -> refuse when disabled -> show you were pressed ->
 * (do not) navigate as a group.
 * `symbol` must appear VERBATIM in skeleton/chip.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  // --- 1. announcing what you are -----------------------------------
  "behavior.role": {
    order: 1,
    how: 'THREE ANSWERS IN ONE SYSTEM, AND THE ARIA IS CONDITIONAL. An ACTION Salt pill writes NO ARIA at all and leans on native <button> semantics; a TOGGLE pill writes role="checkbox" + aria-checked, and ONLY inside a selectionVariant="multiple" group (Pill.tsx: `groupProps = insideSelectableGroup ? { "aria-checked": selected, role: "checkbox", value } : {}`); a Tag writes nothing whatsoever. There is no `radio` reading anywhere in Salt, because PillGroup\'s selectionVariant is only "none" | "multiple" — the design system has no single-select pill group. M3 is [R]: no element exists, and its selection is CHIP-scoped rather than group-scoped, so the chassis takes aria-pressed there instead of aria-checked. Computed from config and mode rather than hardcoded, so the divergence is a matrix cell instead of an assumption. BADGE TAUGHT US ALL THREE SYSTEMS CAN SHIP ZERO ARIA — verified here rather than assumed, and this time one column really does ship some.',
    symbol: 'const role = isToggle && groupScoped ? "checkbox" : undefined',
    where: "Chip(); consumed as role / aria-checked / aria-pressed on the root",
  },

  // --- 2. taking focus ----------------------------------------------
  "behavior.tab-stop": {
    order: 2,
    how: 'Salt gives EVERY pill a tab stop, INCLUDING every pill of a group — there is NO roving tabindex. Pill.tsx deliberately DISCARDS useButton\'s tabIndex (`const { tabIndex: _tabIndex, disabled: buttonDisabled, ...restButtonProps } = buttonProps`) with the source comment "we do not want to spread tab index in this case because the button element does not require tabindex=\'0\' attribute", so the native button\'s own tab stop is used. accessibility.mdx confirms the consequence: Tab reaches the FIRST pill of a group, Shift+Tab the LAST. Disabled pills leave the tab order through the NATIVE disabled attribute, not tabIndex=-1. A Tag is a <div> and is never focusable. The chassis expresses all of this through the ELEMENT BRANCH plus the native attribute rather than by writing a tabIndex, which is exactly what source does. THIS IS THE OPPOSITE OF THE SAME SYSTEM\'S CARD GROUP, a roving-tabindex radiogroup with arrow navigation.',
    symbol: 'const Comp = (isStatic ? "div" : "button") as "div" | "button"',
    where: "Chip(); the element branch, plus `disabled={Comp === \"button\" ? isDisabled : undefined}`",
  },

  // --- 3. responding to keys ----------------------------------------
  "behavior.keyboard-activation": {
    order: 3,
    how: 'TWO CONTRACTS IN ONE SYSTEM, AND THE FORK IS AN EXPLICIT preventDefault. An ACTION Salt pill is a native button: Enter and Space both activate. A TOGGLE pill activates on SPACE ONLY, because Pill.tsx\'s keydown handler contains `if (event.key === "Enter" && insideSelectableGroup) { /* Prevent selection on enter key for selectable pill. */ event.preventDefault(); return; }`. accessibility.mdx states both halves in two separate KeyboardControls blocks — "Enter / Space" for a Pill, "Space" alone for a pill within a selectable group. Modelling interaction as a boolean, or even as static/interactive, would have handed a selectable pill an Enter activation that source explicitly removes — the same trap CARD-MATRIX.md finding 4 found in the other direction, where an anchor activates on Enter and NOT on Space. M3 is [R] Enter+Space: no key contract can be sourced from a tokens-only clone, and that asymmetry is stated rather than smoothed.',
    symbol: 'if (event.key === "Enter" && isToggle) {',
    where: "Chip() onKeyDown; the Space branch sets spaceActive, which feeds combinedActive",
  },

  // --- 4. toggling ---------------------------------------------------
  "behavior.selection": {
    order: 4,
    how: 'SALT PUTS SELECTION ON THE GROUP AND M3 PUTS IT ON THE CHIP, and a boolean `selectable` flag would have erased the difference. Pill.tsx reads usePillGroup() and computes `insideSelectableGroup = pillGroupContext.selectionVariant === "multiple"`; a Pill outside a group — or inside one left at the default selectionVariant="none" — has no role, no aria-checked and no check icon, and passing it a `value` does nothing at all. PillGroup owns the controlled/uncontrolled `selected: string[]` and its `select` filters-or-concatenates, so every activation is a TOGGLE and there is no single-select mode anywhere (hence checkbox, never radio). M3 carries selected-/unselected- families on the chip itself and declares no chip-set token. The chassis takes selectionScope as CONFIG for exactly this reason, and DECLARES one API divergence: `selected` is not a Salt prop — Salt derives it internally from pillGroupContext.selected.includes(value) — so the chassis takes it as an instance prop and lets a ChipGroup drive it, the same props-based restatement card.tsx made for hasCardSection.',
    symbol: "const groupScoped = config.selectionScope === \"group\"",
    where: "Chip(); gates role/aria-checked/aria-pressed and structure.selection-check, and fireSelection() routes the toggle",
  },

  // --- 5. being removed ----------------------------------------------
  "behavior.delete-affordance": {
    order: 5,
    how: 'THE A11Y FORK, AND THE CHASSIS MEASURES IT RATHER THAN ASSERTING IT. Salt says DO NOT NEST: its documented closable pill is `<Pill onClick={() => removeColor(color)}>{color} <CloseIcon style={{ marginLeft: "auto" }} /></Pill>` — the glyph is a decorative CHILD of the button pushed right by a consumer inline style, there is no second tab stop and no second click target, and examples.mdx describes it as "adding a close icon on the right side of the pill". M3\'s filter and input chips carry a with-trailing-icon-* family with its own 8px trailing-space and its own per-state colours, and the published spec makes an input chip\'s trailing icon a remove BUTTON — a focusable inside a focusable, two tab stops per chip. That half is [R], because material-web is tokens-only. shadcn abstains: no component. So the chassis renders a real nested <button> ONLY where structure.trailing is on, stops its click from reaching the host, and publishes data-has-nested-focusable from a real DOM measurement, so the fork is inspectable rather than merely documented. Same resolution card.tsx reached for nested-interactive.',
    symbol: "setHasNestedFocusable(focusables.length > 0)",
    where: "Chip(); the measuring effect, published as data-has-nested-focusable; the trailing <button> stopPropagation-s so it cannot also activate its host",
  },
  "behavior.delete-keys": {
    order: 6,
    how: 'OFF IN ALL THREE COLUMNS, IMPLEMENTED ANYWAY — the same treatment badge.template.json gave behavior.live-region, and for the same reason: for a component whose canonical use includes dismissal, the unanimous absence of a Delete/Backspace contract is surprising and load-bearing. Salt DOES have one and it is in the wrong component: PillInput.tsx lines 225 and 253 bind `event.key === "Backspace" && lastPill` and `event.key === "Delete" || event.key === "Backspace"`, and lab/tokenized-input binds the same — but that is the chip-INSIDE-A-FIELD pattern, excluded by the brief\'s own structural reason and placed by docs/COMPONENTS.md line 45 on the `input-group` row. A grep of packages/core/src/pill and /tag finds neither key. M3 cannot source a key contract from a tokens-only clone, and shadcn has no component. So a standalone chip in this registry is removable by Enter/Space (Salt) or by clicking a nested control (M3) and by NO keyboard shortcut in any column. The capability exists here so the gap is a matrix cell rather than a silent omission.',
    symbol: "deleteKeys.length > 0 && deleteKeys.includes(event.key) && onDelete",
    where: "Chip() onKeyDown, ahead of the Enter/Space branches; config.deleteKeys is undefined in every column, so the branch never fires today",
  },

  // --- 6. refusing ----------------------------------------------------
  "behavior.disabled-handling": {
    order: 7,
    how: 'Salt writes the NATIVE disabled attribute and ORs the group\'s disabled into the pill\'s own — `const disabled = pillGroupContext.disabled || buttonDisabled` — where useButton returns `disabled: disabled && !focusableWhenDisabled` and `tabIndex: -1` (Pill never passes focusableWhenDisabled, so it is always the real attribute). NOTE THE DIVERGENCE INSIDE ONE DESIGN SYSTEM: an InteractableCard uses aria-disabled and STAYS focusable; a Pill uses the native attribute and LEAVES the tab order. Pill.tsx additionally guards its own pointer handler separately (`handlePointerDown` returns early `if (disabledProp)`), because that handler is bound outside useButton and the native attribute would not stop the state update — reproduced here for the same reason. A Salt Tag has no disabled state at all, so the chassis CLAMPS the flag off under interaction="static" rather than inventing one. M3: [S] two opacities (0.38 content / 0.12 stroke), [R] mechanism.',
    symbol: "const isDisabled = Boolean(disabled) && !isStatic",
    where: "Chip(); written as the native `disabled` attribute on the button branch and as data-disabled for the CSS, and every handler returns early on it",
  },

  // --- 7. showing you were pressed ------------------------------------
  "behavior.pressed-flag": {
    order: 8,
    how: 'TWO INDEPENDENT PRESSED FLAGS, COMBINED DIFFERENTLY DEPENDING ON WHETHER THE PILL IS SELECTABLE. Pill.tsx holds `pressActive` (set on pointerdown, cleared by a WINDOW-level pointerup/pointercancel listener registered in a useEffect, so a pointer released outside the pill still clears it) and `spaceActive` (set on Space keydown, cleared on Space keyup) alongside useButton\'s own `active`, then computes `combinedActive = insideSelectableGroup ? pressActive || spaceActive : pressActive || active`. A selectable pill deliberately DROPS useButton\'s `active` so that Enter — which the browser reports as both a key and a click — cannot flash it. useButton\'s own source comments name the same two browser quirks card.salt.json recorded: "the browser treats [Enter] as both key and click events on a Button", and "Firefox Button where Space key is pressed but button fails to be in active state". For M3 the same flag stands in for a RIPPLE the tokens-only clone cannot supply: the pressed state-layer opacity is [S] (0.1 in `latest`), the trigger is [R], exactly as card.m3.json declared.',
    symbol: "const combinedActive = isToggle ? pressActive || spaceActive : pressActive",
    where: "Chip(); published as data-active, which style.chip.pressed and style.state-layer.opacity@pressed select on",
  },

  // --- 8. (not) navigating as a group ---------------------------------
  "behavior.group-navigation": {
    order: 9,
    how: 'OFF IN EVERY COLUMN, IMPLEMENTED ANYWAY, and the Salt cell is a genuine confirmed absence rather than a missing feature. PillGroup.tsx binds NO keydown handler of any kind: it is a context provider around a <fieldset> stripped of every native fieldset style (`border: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: spacing-50`). Because every pill keeps its own tab stop, navigation inside a Salt pill group is Tab and Shift+Tab, and accessibility.mdx documents exactly that and nothing else. M3 declares no chip-set token in any of its four files or four wrappers, so there is nothing to navigate between. The capability is carried so the contrast with the SAME design system\'s InteractableCardGroup — arrow-navigated, roving tabindex, selection-follows-focus — is a matrix cell rather than an unrecorded surprise.',
    symbol: "const groupNavigation = Boolean(config.groupNavigation)",
    where: "ChipGroup(); the arrow handler is attached only when the capability is on, and no column turns it on",
  },
}

/* ---------------------------------------------------------------------
 * THE DIALOG TRAP, checked mechanically.
 * docs/DIALOG-MATRIX.md's closing section: two behaviour rows were
 * implemented, cited, and passed this gate — and never ran, because their
 * useEffect read a ref to a node that renders one tick later and the
 * dependency array omitted the state gating that node. check-tabs-,
 * check-card- and (invertedly) check-badge-behavior.mjs answer that by
 * listing every ref-reading effect and asserting its dependency array.
 *
 * Chip has ONE ref-reading effect and it is exactly the hazard's shape: it
 * queries the chip's subtree for focusables, and the node it is looking for
 * — the trailing remove <button> — is CONDITIONALLY RENDERED. Its deps must
 * therefore list every piece of state that decides whether that node exists.
 * ------------------------------------------------------------------- */
const REF_EFFECT_GUARDS = [
  {
    name: "nested-focusable measurement (behavior.delete-affordance)",
    gate:
      "showTrailing (the trailing remove button only exists when structure.trailing is on AND an onDelete is supplied), interactionMode (which swaps the ROOT between <div> and <button>, i.e. between not-focusable and focusable), and isDisabled (which removes the trailing button from the tab order)",
    deps: "}, [showTrailing, interactionMode, isDisabled])",
  },
]
/* The second effect — the window-level pointerup/pointercancel listener that
 * clears the pressed flag — reads NO ref and touches no conditionally
 * rendered node, so it is deliberately not listed here. It is asserted
 * through behavior.pressed-flag's own symbol instead. */
const EFFECT_COUNT_EXPECTED = 2

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/chip.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`chip behaviour self-check — ${behaviorRows.length} behavior rows in chip.template.json`)
lines.push("")

if (behaviorRows.length === 0) {
  lines.push(
    "  NO BEHAVIOUR ROWS — chip would be a purely presentational label and this gate would have nothing to prove.",
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
    failures.push(`checklist entry '${id}' has no matching behavior row in chip.template.json (stale checklist)`)
  }
}

// the dialog trap, checked mechanically
lines.push("")
lines.push("ref-reading effects and their gating state (docs/DIALOG-MATRIX.md closing correction):")
for (const guard of REF_EFFECT_GUARDS) {
  if (!source.includes(guard.deps)) {
    failures.push(
      `ref-effect guard: dependency array ${guard.deps} not found in ${SKELETON} — the ${guard.name} effect may no longer list its gating state (${guard.gate}).`,
    )
    lines.push(`  FAIL ${guard.name}`)
  } else {
    lines.push(`  ok   ${guard.name}`)
    lines.push(`         deps ${guard.deps}`)
    lines.push(`         gate ${guard.gate}`)
  }
}

/* Badge's INVERTED block, kept in its positive form: an effect that appears
 * without a guard entry must be declared. Counting them is crude but it is
 * the only mechanical way to notice a THIRD effect being added silently. */
const effectCount = (source.match(/React\.useEffect\(/g) ?? []).length
if (effectCount !== EFFECT_COUNT_EXPECTED) {
  failures.push(
    `ref-effect guard: ${SKELETON} now contains ${effectCount} React.useEffect call(s), expected ${EFFECT_COUNT_EXPECTED}. Every effect that reads a ref must be listed in REF_EFFECT_GUARDS with the state gating the node it reads; every effect that does not must be justified in the comment beneath that list. An unaccounted effect can repeat the dialog failure — one that reads a ref to a conditionally-rendered node and omits that node's gate runs once against null and never again.`,
  )
  lines.push(`  FAIL effect count is ${effectCount}, expected ${EFFECT_COUNT_EXPECTED}`)
} else {
  lines.push(`  ok   effect count ${effectCount} — the ${REF_EFFECT_GUARDS.length} guarded one above, plus the`)
  lines.push(
    "         window-level pointerup/pointercancel listener that clears the pressed flag, which reads no ref and touches no conditionally-rendered node and is therefore deliberately unguarded.",
  )
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and the ref-effect block holds.`,
)
lines.push("")
lines.push(
  "NOTE, AND IT IS THE SAME NOTE check-dialog-, check-tabs-, check-card- AND check-badge-behavior.mjs PRINT: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. Dialog shipped two behaviour effects that were correctly written, correctly cited, passed this exact gate, and never executed. A real conformance harness would drive the skeleton in a DOM and assert observable behaviour — that a Salt ACTION pill activates on BOTH Enter and Space while a Salt TOGGLE pill activates on Space and NOT on Enter, and that the Enter keydown is preventDefault-ed rather than merely ignored; that a Salt pill OUTSIDE a group has no role and no aria-checked even when a value is passed, and gains role=\"checkbox\" the moment it is inside one; that a Salt pill group has one tab stop PER PILL and no arrow-key response at all, where the same system's InteractableCardGroup has exactly one tab stop and full arrow navigation; that a Salt static chip is a <div> with no tabindex while a Salt action chip is a <button>; that a selected Salt pill's computed background, colour and border-color are BYTE-IDENTICAL to an unselected one while an M3 selected chip moves all three plus its border-width to 0; that an M3 elevated chip has a box-shadow and NO border where an M3 flat chip has a border and NO box-shadow; that an M3 disabled chip's stroke sits at 12% while its label sits at 38%; that clicking the nested trailing button removes the chip WITHOUT also firing the host's activation; and that data-has-nested-focusable is present on an M3 deletable chip and absent on a Salt one. ONE ENVIRONMENT CAVEAT FOR WHOEVER DRIVES IT (docs/TABS-MATRIX.md's validation pass, repeated in check-card- and check-badge-behavior.mjs): in a hidden/background tab document.activeElement updates on a programmatic .focus() but the focus EVENT is suppressed. Chip has no JS focus handling, so nothing here depends on a focus event arriving — but style.chip.focus is a :focus-visible rule in BOTH live columns, and :focus-visible does not match a programmatic .focus() on a mouse-driven document at all, so the focus ring must be exercised with a real keyboard Tab or asserted from the stylesheet rather than from getComputedStyle. That remains the outstanding half. Logged for the owner alongside docs/SELECT-MATRIX.md findings 13-16.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
