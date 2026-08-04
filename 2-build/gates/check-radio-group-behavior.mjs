#!/usr/bin/env node
/* check-radio-group-behavior — the sixteenth component to ship the third
 * gate (button, calendar, spinner, tooltip, alert, input, select, dialog,
 * tabs, card, badge, progress, chip, checkbox, switch came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows. Nothing
 * automatic checks BEHAVIOR rows. SELECT-MATRIX.md finding 16 records the
 * consequence once already: a documented-but-unimplemented dismissal.
 *
 * RADIO-GROUP-SPECIFIC RISK THIS GATE WAS WRITTEN TO CATCH: this component's
 * whole SELECTION mechanism (behavior.selection-model) is easy to break
 * silently — a future edit to RadioGroup's handleChange or RadioItem's own
 * isChecked derivation could stop comparing against the group's shared
 * `value` (e.g. hardcoding a local boolean per item), which would make
 * every item independently toggleable rather than mutually exclusive, and
 * NOTHING in gen-from-template.py or the style/structure gates would notice
 * — CSS and config rows would still validate fine. This script asserts the
 * literal group-value-comparison code exists; harness/conformance.tsx's
 * checkRadioGroup() (added alongside this file) asserts the OBSERVABLE
 * consequence — that selecting one item actually deselects its sibling.
 *
 * This script asserts, for every behavior row in radio-group.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/radio-group.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>` (none of this
 *       component's ten behavior rows are config-channel, so this branch is
 *       inert here but kept for parity with every other
 *       check-<name>-behavior.mjs).
 * Any failure exits 1.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see the closing note this
 * script prints, and see harness/conformance.tsx's checkRadioGroup() for the
 * real DOM-driven assertions this gate cannot make.
 *
 * Run: node 2-build/gates/check-radio-group-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/radio-group.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a radio-group actually does these things:
 * decide whether you need a wrapper -> decide what each item is -> decide
 * who can reach an item -> decide how the group stays mutually exclusive ->
 * decide who can click you -> stop responding -> refuse to change ->
 * participate in a form. `symbol` must appear VERBATIM in
 * skeleton/radio-group.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  "behavior.role": {
    order: 1,
    how: 'Salt [S] gets role=radio IMPLICITLY and for free — a real native `<input type="radio">` is the whole mechanism, no explicit role attribute needed. shadcn/Radix is [R], the Item documented as a `<button role="radio">` per the linked docs. M3 [S] is the genuinely different one: role is set purely via `ElementInternals` in JS (`this[internals].role = \'radio\'`), never touching a rendered attribute — the FIRST M3 column in this pipeline to use that mechanism rather than either a native element or an explicit HTML attribute. The chassis reproduces the free-role mechanism uniformly for all three by always rendering a real native input with type="radio" (a declared approximation for M3, whose real source has none at all — see structure.native-input).',
    symbol: 'type="radio"',
    where: "RadioItem(); the input's <input> element",
  },
  "behavior.group-role": {
    order: 2,
    how: 'Salt [S]: explicit role="radiogroup" on the <fieldset>. shadcn [R]: presumed role="radiogroup" on the Root per the linked docs. M3: **off** — CONFIRMED ABSENCE, no group entity exists at all to carry the role (structure.group="name-scoped"). The chassis reproduces this exactly: role="radiogroup" is written for the fieldset-radiogroup and div-radiogroup branches, and OMITTED ENTIRELY for the name-scoped (M3) branch — not defaulted to some other value, genuinely absent.',
    symbol: 'role="radiogroup"',
    where: "RadioGroup(); the fieldset-radiogroup and div-radiogroup branches",
  },
  "behavior.keyboard-select": {
    order: 3,
    how: "Salt [S]: Space activates the focused, not-yet-checked radio — native <input type=\"radio\"> semantics, no keydown override. shadcn [R]: a native <button> (per the linked docs) answers Space via the browser's own default-activation semantics. M3 [S]: radio.ts's own handleKeydown explicitly listens for Space and calls this.click() — the SAME native input semantics this chassis's declared union already reproduces for all three by rendering a real input whose own native Space handling does the whole job, with no extra keydown code needed in the chassis at all.",
    symbol: "onChange={handleChange}",
    where: "RadioItem(); the input's <input> element",
  },
  "behavior.arrow-navigation": {
    order: 4,
    how: "THE HEADLINE ROW: Salt [S] is native (same-name sibling inputs, free browser behaviour). shadcn [R] is presumed JS roving-tabindex per Radix's own convention. M3 [S] is EXPLICIT JS (SingleSelectionController.handleKeyDown), built — per its own doc comment — SPECIFICALLY to imitate native <input type=\"radio\"> selection. This chassis reproduces all three OBSERVABLY for free: because every column renders a real native <input type=\"radio\"> sharing one `name` per group, the BROWSER's own native arrow-key/Tab semantics apply identically with zero custom keydown code in this file — the `name` wiring below is the whole mechanism.",
    symbol: "name={group?.name}",
    where: "RadioItem(); the input's <input> element",
  },
  "behavior.selection-model": {
    order: 5,
    how: "Salt [S] and shadcn [R] both compare a GROUP-held string `value` against each item's own `value` prop — a single shared source of truth. M3 [S] instead gives each radio its OWN independent boolean and imperatively unchecks siblings. This chassis implements the Salt/shadcn (group-value) model as its ONE internal engine for all three columns — a declared simplification whose OBSERVABLE outcome (exactly one item checked) matches every real system, even though M3's own real implementation arrives there by a structurally different route. See harness/conformance.tsx's checkRadioGroup() for the DOM-driven proof that clicking an unselected item deselects its sibling.",
    symbol: "group?.onChange(value)",
    where: "RadioItem(); handleChange",
  },
  "behavior.disabled-handling": {
    order: 6,
    how: "Salt [S]: a THREE-way merge (group, ancestor form-field, own prop) — this chassis reproduces the two-way part it can see directly (group + own prop), the ancestor form-field being outside this component's scope (see slot.composes). shadcn [S/R]: native disabled, confirmed directly on the Item in radio-group-disabled.tsx; group-level forwarding is [R]. M3 [S]: native ?disabled PLUS disabled siblings are skipped by arrow-key navigation (SingleSelectionController.handleKeyDown's own `if (nextSibling.hasAttribute('disabled'))` guard) — not reproduced as separate JS here since the chassis's native input semantics already make a disabled item unfocusable/unclickable, the same observable outcome.",
    symbol: "const isDisabled = Boolean(disabled) || Boolean(group?.disabled)",
    where: "RadioItem(); isDisabled",
  },
  "behavior.readonly": {
    order: 7,
    how: 'Salt ONLY, reachable at BOTH item and group level: the native HTML readonly IDL attribute has no effect on type="radio" inputs [R, spec fact], so Salt\'s own handleChange does its OWN early return — reproduced as the identical early-return shape, the SAME mechanism checkbox.tsx\'s/switch.tsx\'s own handleChange guards use. shadcn/M3: OFF, confirmed absence — the chassis still implements the capability so the gap is a matrix cell, not a silent omission.',
    symbol: "if (isReadOnly) return",
    where: "RadioItem(); handleChange",
  },
  "behavior.label-click-target": {
    order: 8,
    how: 'Identical three-way shape to checkbox/switch: Salt: the WHOLE label (dot and text) is one native click target, because structure.shell="label-wrap" makes the root a real <label> [S]. shadcn: only the dot/button toggles; the consumer\'s own separate <Label htmlFor> extends the target, outside this component [S/R]. M3 explicitly ANTICIPATES an ancestor <label> and redirects that click to its internal element (radio.ts constructor, form-label-activation.js) — not reproduced as a click LISTENER here (native <label>-wrapping already does the redirect for free when shell="label-wrap"), but the ROOT ELEMENT CHOICE that makes Salt\'s case real is.',
    symbol: '(config.shell === "label-wrap" ? "label" : "span")',
    where: "RadioItem(); the Root element",
  },
  "behavior.form-participation": {
    order: 9,
    how: "Salt [S] inherits native form participation for free because its own input IS the real form control. shadcn/Radix [R]: a hidden native bubble input per the linked docs. M3 [S]: a full form-associated custom element with its OWN radio-SPECIFIC, group-aware RadioValidator (looping every sibling sharing a name, unlike checkbox's/switch's own M3 columns, which both reused CheckboxValidator verbatim for a single element). The chassis's form-relevant attributes — name, value, and the native checked/required — are what any of the three actually submit.",
    symbol: "value={value}",
    where: "RadioItem(); the input's <input> element",
  },
  "behavior.validation": {
    order: 10,
    how: 'Salt [S]: `validationStatus` computed PER ITEM and SUPPRESSED when THAT item is disabled — `!isDisabled && group?.validation && group.validation !== "off" ? group.validation : undefined`, the identical per-item-disabled-suppresses-validation mechanism checkbox\'s own Salt column used. shadcn [S]: aria-invalid a bare boolean the consumer sets directly (not computed by this chassis at all, matching the real clone\'s own literal-prop shape). M3: **off** — CONFIRMED ABSENCE, no error/warning token family anywhere in _md-comp-radio-button.scss, the second sighting of this exact finding after switch\'s own M3 column.',
    symbol: "const validationMode = !isDisabled",
    where: "RadioItem(); validationMode",
  },
}

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/radio-group.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`radio-group behaviour self-check — ${behaviorRows.length} behavior rows in radio-group.template.json`)
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
    failures.push(`checklist entry '${id}' has no matching behavior row in radio-group.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: NONE — RadioItem never conditionally renders the input it reads (it is unconditional in every branch of every column, the same dialog-trap-immune shape checkbox.tsx's/switch.tsx's own inputs already have), so there is no useLayoutEffect/useEffect of any kind in this file to guard.",
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
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. A real conformance harness drives the skeleton in a DOM and asserts observable behaviour — see harness/conformance.tsx's checkRadioGroup(), which this component's build ADDS TO rather than replaces this gate with: that clicking an unselected item in a live three-item group actually deselects the previously-selected sibling (behavior.selection-model, the real TRANSITION, not two static mounts); that a disabled group/item does not respond to a click (behavior.disabled-handling); and that a read-only Salt group does not respond to a click (behavior.readonly). ONE ENVIRONMENT CAVEAT, repeated from every prior component's gate: this page runs in a hidden tab, where focus EVENTS are suppressed though document.activeElement still updates on a programmatic .focus() — anything asserting on a focus EVENT arriving needs a synthetic bubbling focusin, not a bare .focus() call.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
