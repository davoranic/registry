#!/usr/bin/env node
/* check-accordion-behavior — the twentieth component to ship the third gate
 * (button, calendar, spinner, tooltip, alert, input, select, dialog, tabs,
 * card, badge, progress, chip, checkbox, switch, radio-group, slider,
 * toast, dropdown-menu came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows.
 * Nothing automatic checks BEHAVIOR rows — SELECT-MATRIX.md finding 16
 * recorded the consequence once already (a documented-but-unimplemented
 * dismissal). This script asserts, for every behavior row in
 * accordion.template.json: (a) an entry exists in the CHECKLIST below;
 * (b) the code the entry cites actually exists in skeleton/accordion.tsx (a
 * literal source search, not a promise in a comment); (c) for config-channel
 * rows, the param is declared in skeletonParams AND the skeleton really
 * reads `config.<param>`.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see harness/conformance.tsx's
 * checkAccordion()/checkAccordionCollapsible()/checkAccordionArrowNav() for
 * the real DOM-driven assertions this gate cannot make (a real click actually
 * expanding a collapsed panel, a real ArrowDown actually moving focus and
 * skipping a disabled trigger, Salt's own real independent-per-item toggling
 * versus shadcn's real single-mode exclusivity).
 *
 * CALIBRATION (CLAUDE.md rule 11): deliberately broken before being trusted
 * — the symbol for behavior.disabled-item was changed to a string not
 * present in the skeleton ("if (disabledItem) return"), confirmed the gate
 * went red with the expected "cited code not found" message, then restored
 * to the real symbol below.
 *
 * Run: node 2-build/gates/check-accordion-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/accordion.tsx"

const CHECKLIST = {
  "behavior.role": {
    order: 1,
    how: "The content panel renders role=\"region\" (Salt [S] AccordionPanel.tsx; shadcn [R], the documented APG accordion pattern Radix's own docs cite).",
    symbol: 'role="region"',
    where: "Accordion(); the content <div>",
  },
  "behavior.expand-toggle": {
    order: 2,
    how: "Click (and native Enter/Space, for free on a real <button>) on a trigger toggles its own item's membership in the expanded set.",
    symbol: "onClick={() => toggle(item.value, item.disabled)}",
    where: "Accordion(); the trigger <button>",
  },
  "behavior.exclusive-expand": {
    order: 3,
    how: "shadcn: on when config.type is present AND the type prop is \"single\" — opening one item REPLACES the expanded set. Salt: CONFIRMED OFF, config.type is always undefined for that column so this branch never runs — every item toggles independently instead (real, faithful reproduction of AccordionGroup's own lack of state, not a fallback default) — see ACCORDION-MATRIX.md Finding 2.",
    symbol: "if (singleMode) {",
    where: "toggle()",
  },
  "behavior.collapsible-to-none": {
    order: 4,
    how: "In single mode, closing the only open item is only allowed when BOTH config.collapsible (the column's own capability) AND the collapsible prop (the consumer's own choice) are true — otherwise the click is a no-op and the item stays open, matching shadcn's own real collapsible=false behaviour.",
    symbol: "canCollapseToNone",
    where: "toggle()",
  },
  "behavior.arrow-navigation": {
    order: 5,
    how: "ArrowUp/ArrowDown move real DOM focus between sibling triggers within the group, skipping disabled ones — gated entirely on config.arrowNav. Salt: CONFIRMED OFF (config.arrowNav is undefined for that column, grepped directly — no keydown handler of any kind exists in packages/core/src/accordion/ beyond the native button's own Enter/Space) — see ACCORDION-MATRIX.md Finding 3.",
    symbol: "function onTriggerKeyDown(e: React.KeyboardEvent, index: number) {",
    where: "Accordion()",
  },
  "behavior.home-end": {
    order: 6,
    how: "Home/End jump to the first/last ENABLED trigger — the same roving-focus mechanism as arrow-navigation, gated by the same config.arrowNav flag.",
    symbol: 'e.key === "Home"',
    where: "onTriggerKeyDown()",
  },
  "behavior.disabled-item": {
    order: 7,
    how: "A disabled item's trigger both carries the native `disabled` HTML attribute (which alone suppresses click/keyboard activation in every real browser) AND toggle() itself guards defensively on the disabled flag — belt and suspenders, matching Salt's/shadcn's own real 'disabled means inert' contract.",
    symbol: "if (disabled) return",
    where: "toggle()",
  },
}

// ---------------------------------------------------------------------

const templateRaw = readFileSync(join(ROOT, "contract/templates/accordion.template.json"), "utf8")
const template = JSON.parse(templateRaw)
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`accordion behaviour self-check — ${behaviorRows.length} behavior rows in accordion.template.json`)
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
    failures.push(`checklist entry '${id}' has no matching behavior row in accordion.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: skeleton/accordion.tsx has ZERO useEffect/useLayoutEffect hooks — a genuine first for this pipeline's behaviour gates, and by construction immune to the dialog/checkbox class of bug (a stale ref captured once against a null node) this note exists to rule out for every other component. All roving-focus DOM queries (onTriggerKeyDown) run synchronously inside an EVENT HANDLER, not an effect, reading groupRef.current fresh on every keystroke — there is no mount-order/dependency-array question to get wrong here at all.",
)
const effectMatches = [...source.matchAll(/React\.use(?:Layout)?Effect\(/g)]
if (effectMatches.length !== 0) {
  failures.push(
    `expected ZERO effects in ${SKELETON}; found ${effectMatches.length} — this gate's ref-safety claim needs re-auditing`,
  )
  lines.push(`  FAIL expected zero effects, found ${effectMatches.length}`)
} else {
  lines.push("  ok   zero effects exist, confirmed by source scan")
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and the file needs no ref-reading effects at all.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS. See harness/conformance.tsx's checkAccordion()/checkAccordionCollapsible()/checkAccordionArrowNav() for the real DOM-driven assertions: a real click actually expanding a collapsed panel (not an already-open mount, the DIALOG-MATRIX.md lesson), a disabled trigger's click being correctly ignored, shadcn's real single-mode exclusivity closing a sibling versus Salt's real independent-per-item persistence (a per-column DIVERGENCE the test asserts explicitly rather than assuming one shared answer), and a real ArrowDown/Home moving focus while skipping a disabled trigger.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
