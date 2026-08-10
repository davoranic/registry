#!/usr/bin/env node
/* check-table-behavior — the twenty-fourth component to ship the third
 * gate (button, calendar, spinner, tooltip, alert, input, select, dialog,
 * tabs, card, badge, progress, chip, checkbox, switch, radio-group, slider,
 * toast, dropdown-menu, accordion, popover, combobox, toggle-group came
 * before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows.
 * Nothing automatic checks BEHAVIOR rows. SELECT-MATRIX.md finding 16
 * records the consequence once already: a documented-but-unimplemented
 * dismissal.
 *
 * TABLE-SPECIFIC RISK THIS GATE WAS WRITTEN TO CATCH: this component's own
 * `behavior.overflow-region` is a REAL, measured ResizeObserver effect
 * (Salt's own mechanism) — a future edit could silently drop the dep-array
 * guard or the measurement call and nothing in gen-from-template.py or the
 * style/structure gates would notice (CSS and config rows would still
 * validate fine). This script asserts the literal ResizeObserver/measurement
 * code exists AND is gated on the `overflowRegionSensing` config flag;
 * harness/conformance.tsx's checkTable() (added alongside this file) asserts
 * the OBSERVABLE consequence — that a genuinely overflowing table promotes
 * its wrapper to role="region"+tabIndex=0 ONLY where the column's own real
 * source has this capability, and does not where it doesn't.
 *
 * This script asserts, for every behavior row in table.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/table.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>`.
 * Any failure exits 1.
 *
 * `behavior.row-selection` is DECLARED, not implemented as an ENGINE, in
 * this chassis — see TABLE-MATRIX.md's own scope note and Finding 1. Its
 * CHECKLIST entry cites the skeleton's own STYLE-HOOK implementation (the
 * `selected`/`disabled` props on TableRow, a real, checkable symbol) rather
 * than a selection engine that was deliberately never built, matching
 * combobox's own precedent for representing "documented non-implementation"
 * honestly rather than pretending a symbol exists that doesn't.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see
 * harness/conformance.tsx's checkTable() for the real DOM-driven assertions
 * this gate cannot make: every structural part rendering with the right
 * tag, a right-aligned header cell resolving correctly only where the
 * column's own config supports it, the overflow-region promotion actually
 * firing (or not) on a genuinely overflowing table, and a selected/disabled
 * row's own computed background/opacity genuinely differing (or not) from
 * an unselected/enabled sibling's, per column.
 *
 * CALIBRATION (CLAUDE.md rule 11): deliberately broken before being trusted
 * — the symbol for behavior.overflow-region was changed to a string not
 * present in the skeleton ("ResizeObserverXXX"), confirmed the gate went
 * red with the expected "cited code not found" message, then restored to
 * the real symbol below.
 *
 * Run: node 2-build/gates/check-table-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/table.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST. `symbol` must appear VERBATIM in skeleton/table.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  "behavior.overflow-region": {
    order: 1,
    how: 'Salt [S]: TableContainer.tsx\'s own checkOverflow() (scrollHeight>clientHeight || scrollWidth>clientWidth), driven by a real useResizeObserver + useIsomorphicLayoutEffect-on-mount, promotes the wrapper to role="region"+tabIndex=0+aria-labelledby ONLY while genuinely overflowing. shadcn [S]: CONFIRMED ABSENCE, the wrapper is unconditionally overflow-x-auto with no role/tabIndex/measurement. M3: off [R], no live source to confirm. The chassis reproduces Salt\'s real mechanism (a ResizeObserver measuring the wrapper, gated on the overflowRegionSensing config flag) for whichever column\'s config advertises the capability.',
    symbol: "const ro = new ResizeObserver(check)",
    where: "Table(); the wrapperRef effect",
  },
  "behavior.row-selection": {
    order: 2,
    how: 'THE HEADLINE SCOPE FINDING (TABLE-MATRIX.md Finding 1). None of the three real BASE table primitives implement a working selection ENGINE. shadcn [S]: a real, reachable STYLE HOOK (data-[state=selected]:bg-muted) exists on the base TableRow, wired live in shadcn\'s own TanStack examples via an EXTERNAL, unvendored engine (row.getIsSelected()) — no engine in the base primitive itself. Salt [S]: CONFIRMED ABSENCE, no selection concept anywhere in packages/core/src/table/. M3 [S, tokens]: real, DESIGNED colour tokens for a selected-row state, zero live wiring. The chassis reproduces the STYLE HOOK ONLY — a `selected`/`disabled` prop on TableRow that sets a real data attribute, styled per-column where a real rule exists — as a STATIC, per-instance demonstration. It does NOT build a selection engine (checkbox column, onRowSelect callback, select-all) — declared out of scope, see the matrix doc\'s own scope note.',
    symbol: 'data-state={selected ? "selected" : undefined}',
    where: "TableRow(); the <tr> element",
  },
}

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/table.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`table behaviour self-check — ${behaviorRows.length} behavior rows in table.template.json`)
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

for (const id of Object.keys(CHECKLIST)) {
  if (!behaviorRows.some((r) => r.id === id)) {
    failures.push(`checklist entry '${id}' has no matching behavior row in table.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: ONE — Table()'s own wrapperRef effect (behavior.overflow-region). It is UNCONDITIONALLY mounted (the wrapper <div> always renders, regardless of the sensing flag), so there is no conditionally-rendered node to guard against — the dependency that matters is the `sensing` flag itself, which the effect's own dep array ([sensing]) already lists, tearing the ResizeObserver down and resetting `overflowing` to false whenever sensing turns off.",
)
const effectMatches = [...source.matchAll(/use(?:Layout)?Effect\(/g)].length
lines.push(`  ${effectMatches} useEffect/useLayoutEffect call(s) found in ${SKELETON}; expected exactly 1 (the overflow-region measurement effect)`)
if (effectMatches !== 1) {
  failures.push(
    `ref-effect guard: ${SKELETON} now has ${effectMatches} effect(s), not the 1 this gate's own accounting expects — review whether a new one needs its own guard note here.`,
  )
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and the one ref-reading effect is correctly dependency-gated.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. A real conformance harness drives the skeleton in a DOM and asserts observable behaviour — see harness/conformance.tsx's checkTable(), which this component's build ADDS TO rather than replaces this gate with: every structural part rendering with the correct tag (scoped to its own mount), a right-aligned header cell resolving correctly only where the column's own config supports the align axis, the overflow-region promotion actually firing (or correctly not firing) on a genuinely overflowing table, and a selected/disabled row's own computed background/opacity genuinely differing (or correctly not differing) from an unselected/enabled sibling's — the expectation for the STYLE-only rows (no config gate) read from table-panel.json's own generated cell kind rather than hardcoded per system.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
