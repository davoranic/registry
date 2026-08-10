#!/usr/bin/env node
/* check-combobox-behavior — the twenty-second component to ship the third
 * gate (button, calendar, spinner, tooltip, alert, input, select, dialog,
 * tabs, card, badge, progress, chip, checkbox, switch, radio-group, slider,
 * toast, dropdown-menu, accordion, popover came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows.
 * Nothing automatic checks BEHAVIOR rows — SELECT-MATRIX.md finding 16
 * recorded the consequence once already (a documented-but-unimplemented
 * dismissal). This script asserts, for every behavior row in
 * combobox.template.json: (a) an entry exists in the CHECKLIST below; (b)
 * the code the entry cites actually exists in skeleton/combobox.tsx (a
 * literal source search, not a promise in a comment); (c) for config-channel
 * rows, the param is declared in skeletonParams AND the skeleton really
 * reads `config.<param>`.
 *
 * Three rows are DECLARED, not implemented, in this chassis
 * (behavior.status-inheritance — a separate `field` component's context
 * channel; behavior.multiselect — declared out of scope; behavior.
 * positioning-engine — a declared gap, no real floating-position engine).
 * Their CHECKLIST entries cite the skeleton's own header comment, which
 * states the decision explicitly, rather than a runtime symbol that does
 * not exist — the gate would otherwise have no honest way to represent
 * "this is a documented non-implementation" versus "this is missing".
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see harness/conformance.tsx's
 * checkCombobox()/checkComboboxParts() for the real DOM-driven assertions
 * this gate cannot make: real focus staying on the input through open +
 * arrow-key navigation (behavior.focus-model, the sharpest thing this
 * component needs to prove), a real typed query actually filtering the
 * rendered option count, a real Enter actually committing the highlighted
 * option's label into the input's own value, a real outside pointerdown
 * actually closing the popup, and — per column — a real empty-state message
 * appearing (or a confirmed absence) and a real clear-button click actually
 * emptying the field.
 *
 * CALIBRATION (CLAUDE.md rule 11): deliberately broken before being trusted
 * — the symbol for behavior.dismiss-escape was changed to a string not
 * present in the skeleton ("Escapee"), confirmed the gate went red with the
 * expected "cited code not found" message, then restored to the real
 * symbol below.
 *
 * Run: node 2-build/gates/check-combobox-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/combobox.tsx"

const CHECKLIST = {
  "behavior.open-trigger": {
    order: 1,
    how: "Focusing the input opens the popup (when the column can open at all); ArrowDown/ArrowUp from closed also open it.",
    symbol: 'if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp"))',
    where: "onKeyDown()",
  },
  "behavior.filter": {
    order: 2,
    how: "The rendered option list is filtered against the typed query before any other logic runs (highlighting, grouping, empty-state).",
    symbol: "const filtered = flat.filter((o) => matches(o.label, query))",
    where: "Combobox()",
  },
  "behavior.registry-filter-default": {
    order: 3,
    how: "REGISTRY DEFAULT: case-insensitive substring match, the literal algorithm Salt's own real combo-box.stories.tsx uses when filtering externally (see COMBOBOX-MATRIX.md Finding 2) — applied uniformly so the render is checkable across all three columns.",
    symbol: "return label.toLowerCase().includes(query.trim().toLowerCase())",
    where: "matches()",
  },
  "behavior.focus-model": {
    order: 4,
    how: "VIRTUAL focus — real DOM focus never leaves the <input>. Options, the toggle button and the clear button are all tabIndex={-1}; the highlighted option is tracked via aria-activedescendant, not a DOM focus move — the sharpest structural fact this component's own build prompt flagged as easy to get wrong.",
    symbol: 'aria-activedescendant={isOpen && active ? `${id ?? "combobox"}-opt-${active}` : undefined}',
    where: "Combobox(); the <input>",
  },
  "behavior.pointer-activates-option": {
    order: 5,
    how: "Moving the pointer over an option makes it ACTIVE/highlighted, config-gated so M3's separate hover/focus state layers stay both reachable.",
    symbol: 'if (activateOnHover) { setActive(o.value); setFocusVisible(false) }',
    where: "renderOption(); the option's onMouseOver",
  },
  "behavior.enter-commits": {
    order: 6,
    how: "Enter commits the currently active/highlighted option: its label replaces the typed query, it becomes the selected value, and the popup closes.",
    symbol: 'else if (e.key === "Enter") {',
    where: "onKeyDown()",
  },
  "behavior.dismiss-escape": {
    order: 7,
    how: "Escape closes the popup.",
    symbol: 'else if (e.key === "Escape") {',
    where: "onKeyDown()",
  },
  "behavior.dismiss-outside": {
    order: 8,
    how: "A real document-level capture-phase pointerdown listener closes the popup when the press lands outside both the trigger field and the popup — the SAME proven pattern select.tsx/popover.tsx/dropdown-menu.tsx already carry.",
    symbol: 'document.addEventListener("pointerdown", onPointerDown, true)',
    where: "Combobox(); the dismiss-outside effect",
  },
  "behavior.status-inheritance": {
    order: 9,
    how: "DECLARED COMPOSITION with the separate `field` component (Salt's own form-field context channel) — NOT implemented in this chassis, the same treatment select.tsx already gives its own equivalent row. The skeleton's own header comment states this explicitly.",
    symbol: "(a) the `field` wrapper",
    where: "file header comment, the DECLARED COMPOSITIONS paragraph",
  },
  "behavior.empty-readonly-marker": {
    order: 10,
    how: "Salt's own emptyReadOnlyMarker: an empty read-only control shows a registry-default marker instead of nothing.",
    symbol: "const showAsEmptyReadOnly = isReadOnly && emptyMarker !== undefined && query === \"\"",
    where: "Combobox()",
  },
  "behavior.readonly-suppresses-popup": {
    order: 11,
    how: "Where the column has a readOnly capability at all, it suppresses opening (canOpen), suppresses typing (handleChange's own early return), AND flips the trigger's own role attribute from combobox to textbox — see COMBOBOX-MATRIX.md Finding 6.",
    symbol: 'role={isReadOnly && hasReadOnly ? "textbox" : "combobox"}',
    where: "Combobox(); the <input>",
  },
  "behavior.multiselect": {
    order: 12,
    how: "DECLARED OUT OF SCOPE, recorded rather than dropped — a real, first-class API surface in BOTH live systems for this component (Salt's pills, shadcn's chips), still not modelled here. The skeleton's own header comment states this explicitly.",
    symbol: "MULTISELECT (pills/chips) is DECLARED OUT OF SCOPE",
    where: "file header comment",
  },
  "behavior.positioning-engine": {
    order: 13,
    how: "DECLARED GAP, the same shape select.tsx's own row records. Neither Salt's real @floating-ui/react middleware stack nor shadcn's real base-ui Positioner is reimplemented; only the trigger's own measured width is published, for the popup's min-width row to read.",
    symbol: '["--combobox-trigger-width" as string]: triggerWidth ? `${triggerWidth}px` : undefined,',
    where: "Combobox(); the popup's own inline style",
  },
}

// ---------------------------------------------------------------------

const templateRaw = readFileSync(join(ROOT, "contract/templates/combobox.template.json"), "utf8")
const template = JSON.parse(templateRaw)
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`combobox behaviour self-check — ${behaviorRows.length} behavior rows in combobox.template.json`)
lines.push("")

const ordered = [...behaviorRows].sort(
  (a, b) => (CHECKLIST[a.id]?.order ?? 999) - (CHECKLIST[b.id]?.order ?? 999),
)

for (const row of ordered) {
  const entry = CHECKLIST[row.id]
  const tags = [row.policy, row.channel].join("/")
  if (!entry) {
    failures.push(`${row.id} (${tags}): NO CHECKLIST ENTRY`)
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

for (const id of Object.keys(CHECKLIST)) {
  if (!behaviorRows.some((r) => r.id === id)) {
    failures.push(`checklist entry '${id}' has no matching behavior row in combobox.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: skeleton/combobox.tsx has TWO effects (a dismiss-outside pointerdown listener and a useLayoutEffect measuring the trigger's own width). The dismiss-outside effect is gated on `[isOpen, forceOpen]` and reads triggerRef/popupRef FRESH inside its own callback on every pointerdown (not captured once at effect-setup time), the same ref-safe-by-construction shape dropdown-menu.tsx's/popover.tsx's own equivalent listeners already establish — no conditionally-rendered node's ref is read from a stale closure.",
)
const effectMatches = [...source.matchAll(/React\.use(?:Layout)?Effect\(/g)]
if (effectMatches.length !== 2) {
  failures.push(
    `expected exactly TWO effects in ${SKELETON}; found ${effectMatches.length} — this gate's ref-reading claim needs re-auditing`,
  )
  lines.push(`  FAIL expected exactly two effects, found ${effectMatches.length}`)
} else {
  lines.push("  ok   exactly two effects exist, and both are audited above")
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented (or, where declared, explicitly documented as not implemented) in ${SKELETON} and wired to its row, and both effects this file has are ref-safe.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS. See harness/conformance.tsx's checkCombobox()/checkComboboxParts() for the real DOM-driven assertions — most importantly that real DOM focus genuinely stays on the input through a full open + filter + arrow-navigate + commit cycle, not merely that the aria-activedescendant wiring exists in source.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
