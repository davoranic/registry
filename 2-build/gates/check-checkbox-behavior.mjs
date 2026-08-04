#!/usr/bin/env node
/* check-checkbox-behavior — the SEVENTH component to ship the third gate
 * (badge, card, chip, dialog, progress, tabs came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows. Nothing
 * automatic checks BEHAVIOR rows. docs/SELECT-MATRIX.md finding 16 records
 * the consequence once already: a documented-but-unimplemented dismissal.
 *
 * CHECKBOX IS THE FIRST COMPONENT IN THIS PIPELINE WHOSE CHASSIS RENDERS A
 * REAL, ALWAYS-PRESENT, NATIVE <input>, AND THE FIRST WHOSE SKELETON HAS A
 * REF-READING EFFECT (indeterminate has no HTML attribute form, only an IDL
 * property, so it must be synced imperatively). That makes the DIALOG TRAP
 * directly relevant here for the first time since badge/chip's own gates —
 * this script's REF_EFFECT_GUARDS block is POPULATED, not vacuous, and it
 * checks a real dependency array rather than merely asserting the absence of
 * any effect at all.
 *
 * This script asserts, for every behavior row in checkbox.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/checkbox.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>` (none of checkbox's
 *       nine behavior rows are config-channel, so this branch is inert here
 *       but kept for parity with every other check-<name>-behavior.mjs).
 * Any failure exits 1.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see the closing note this
 * script prints, and see harness/conformance.tsx for the real DOM-driven
 * assertions this gate cannot make (added alongside this file, not
 * replacing it).
 *
 * Run: node 2-build/gates/check-checkbox-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/checkbox.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a checkbox actually does these things:
 * decide what you are -> decide who can reach you -> resolve an ambiguous
 * state -> group with your siblings -> tell the truth about validity ->
 * stop responding -> refuse to change -> participate in a form.
 * `symbol` must appear VERBATIM in skeleton/checkbox.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  "behavior.role": {
    order: 1,
    how: 'Salt [S] and M3 [S] get role=checkbox IMPLICITLY and for free — a real native `<input type="checkbox">` is the whole mechanism, no explicit `role` or `aria-checked` attribute needed for the checked/unchecked cases (M3 writes an explicit aria-checked="mixed" ONLY for indeterminate, because native semantics have no other way to expose "mixed" — checkbox_test.ts asserts exactly that toggle). shadcn/Radix is [R], reasoned from shadcn\'s own `has-[[aria-checked=true]]` selector in checkbox-demo.tsx plus the linked Radix docs; not independently confirmable without primitives/ cloned. The chassis reproduces the free-role mechanism by always rendering a real native input rather than a simulated one.',
    symbol: 'type="checkbox"',
    where: "Checkbox(); the box's native <input>",
  },
  "behavior.keyboard-activation": {
    order: 2,
    how: "SPACE ONLY, in all three, and none of them override it — the opposite of chip's action pills (Enter+Space). Salt's accessibility.mdx says so in words; M3 and shadcn both rely on the same native semantics [S for Salt/M3, R for shadcn per the linked docs]. The chassis binds NO keydown handler of its own anywhere — the native input's own onChange, fired by the browser's own Space handling, is the entire mechanism.",
    symbol: "onChange={handleChange}",
    where: "Checkbox(); the box's native <input>",
  },
  "behavior.label-click-target": {
    order: 3,
    how: 'Salt: the WHOLE label (box and text) is one native click target, because structure.shell="label-wrap" makes the root a real <label> [S]. shadcn: only the box toggles; the consumer\'s own separate <Label htmlFor> extends the target, outside this component [S/R]. M3 explicitly ANTICIPATES an ancestor <label> a consumer might supply and redirects that click to its internal input (checkbox.ts constructor, form-label-activation.js) — not reproduced as a click LISTENER here (native <label>-wrapping already does the redirect for free in the DOM when shell="label-wrap"), but the ROOT ELEMENT CHOICE that makes Salt\'s case real is.',
    symbol: '(config.shell === "label-wrap" ? "label" : "span")',
    where: "Checkbox(); the Root element",
  },
  "behavior.tri-state": {
    order: 4,
    how: "checked / unchecked / indeterminate, and a user interaction always resolves indeterminate to checked and clears it — NATIVE `<input type=\"checkbox\">` behaviour, inherited for free by Salt and M3 because both build on a real input [S]; shadcn/Radix's OWN data-table example (payments.tsx) proves the same round-trip through a plain boolean onCheckedChange even from an indeterminate header checkbox [S]. `indeterminate` has NO HTML ATTRIBUTE form, only an IDL/DOM PROPERTY one, so React cannot set it via JSX — it is synced imperatively in a useLayoutEffect, the same thing Salt's own useIsomorphicLayoutEffect does. See the REF_EFFECT_GUARDS block below: this is the one ref-reading effect in this skeleton.",
    symbol: "inputRef.current.indeterminate = isIndeterminate",
    where: "Checkbox(); a useLayoutEffect keyed on [isIndeterminate]",
  },
  "behavior.group-navigation": {
    order: 5,
    how: "Salt: NO roving tabindex — CONFIRMED ABSENCE, useCheckboxGroup.ts/CheckboxGroupContext.ts bind no keydown handler of any kind; every checkbox keeps its own tab stop, Tab/Shift+Tab only [S]. shadcn/M3: OFF, no group construct to navigate. The chassis reproduces the absence literally: CheckboxGroup renders a plain <fieldset> with NO keydown binding anywhere in this file.",
    symbol: '<fieldset data-slot="checkbox-group"',
    where: "CheckboxGroup()",
  },
  "behavior.validation": {
    order: 6,
    how: 'THE MECHANISM, not the colour. Salt computes validationStatus in JS and SUPPRESSES it when disabled: `const validationStatus = !disabled ? (...) : undefined` [S] — a disabled+error Salt checkbox never shows the error tone, by source logic, not CSS specificity. Reproduced exactly, and applied uniformly across all three columns (the config never asked for a per-column branch, and doing it always is the honest superset rather than a Salt-only special case buried in JS).',
    symbol: '!isDisabled && rawValidation && rawValidation !== "off" ? rawValidation : undefined',
    where: "Checkbox(); validationMode, published as data-validation",
  },
  "behavior.disabled-handling": {
    order: 7,
    how: "Salt: the native disabled attribute, ORed with the group's (`checkboxGroup?.disabled || formFieldDisabled || disabledProp`) [S]. shadcn: native disabled [S]. M3: native ?disabled, reflected property, PLUS an explicit transition suppression around the disabled boundary to avoid a FOUC (`animation-duration: 0s; transition-duration: 0s` on .disabled/.prev-disabled) [S] — the transition half is a style row (style.box.transition's note), not reproduced as JS here since it is pure CSS. The OR-merge with the group is reproduced literally.",
    symbol: "Boolean(disabled ?? false) || Boolean(group?.disabled)",
    where: "Checkbox(); isDisabled",
  },
  "behavior.readonly": {
    order: 8,
    how: 'Salt ONLY, and the sourced nuance is real: the native HTML `readonly` IDL attribute has NO EFFECT on type="checkbox" per the WHATWG HTML spec [R, spec fact], so Salt\'s own handleChange does its OWN early return rather than relying on the browser — `if (event.nativeEvent.defaultPrevented || readOnly) { return }` [S]. Reproduced as the identical early-return shape; the controlled `checked` prop then snaps the DOM back on the next render regardless of what the browser momentarily allowed. shadcn/M3: OFF, confirmed absence — the chassis still implements the capability (isReadOnly folds in group?.readOnly too) so the gap is a matrix cell, not a silent omission.',
    symbol: "if (isReadOnly) return",
    where: "Checkbox(); handleChange",
  },
  "behavior.form-participation": {
    order: 9,
    how: "M3 is the most explicit: a full form-associated custom element (getFormValue/getFormState/formResetCallback/formStateRestoreCallback) plus a CheckboxValidator that lazily creates a SECOND, invisible, real native input purely to borrow the browser's own constraint-validation engine [S]. Salt inherits native form participation for free because its own input IS the real form control [S]. shadcn/Radix: [R], a hidden native bubble input per the linked docs, not independently confirmable here. The chassis's form-relevant attributes — name (folding in the group's, the same merge CheckboxGroupContext performs) and the native checked/required — are what any of the three actually submit.",
    symbol: "name={effectiveName}",
    where: "Checkbox(); the box's native <input>",
  },
}

/* ---------------------------------------------------------------------
 * THE DIALOG TRAP, checked mechanically, POPULATED THIS TIME (contrast
 * badge's/chip's inverted-empty form). skeleton/checkbox.tsx has EXACTLY
 * ONE ref-reading effect: the useLayoutEffect that syncs
 * `inputRef.current.indeterminate`. The node it reads (the <input>) is NEVER
 * conditionally rendered anywhere in this file — it exists in every branch,
 * every column, every render — so there is no "renders one tick later" gap
 * for the dialog defect's shape to hide in. This block asserts the effect's
 * dependency array is still exactly what it should be; if a future edit adds
 * a SECOND ref-reading effect without adding a matching entry here, the
 * NO_EFFECT_TOKENS sweep below would not catch it (unlike badge/chip's
 * inverted empty-list check) — the tokens sweep here instead confirms this
 * file still contains USE_LAYOUT_EFFECT so the guard entry has not gone
 * stale by the effect being removed out from under it.
 * ------------------------------------------------------------------- */
const REF_EFFECT_GUARDS = [
  {
    name: "indeterminate-sync",
    deps: "[isIndeterminate]",
    gate:
      "the <input> this effect reads via inputRef is unconditionally rendered in every branch of every column — there is no state that gates its existence, so [isIndeterminate] is the correct and complete dependency array, not an incomplete one omitting a mount-gating flag the way dialog's did",
  },
]

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/checkbox.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`checkbox behaviour self-check — ${behaviorRows.length} behavior rows in checkbox.template.json`)
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
    .join(", ")} — all present in the checklist: ${lockedInfo.every((r) => CHECKLIST[r.id]) ? "yes" : "NO"}`,
)

for (const id of Object.keys(CHECKLIST)) {
  if (!behaviorRows.some((r) => r.id === id)) {
    failures.push(`checklist entry '${id}' has no matching behavior row in checkbox.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push("ref-reading effects and their gating state (docs/DIALOG-MATRIX.md closing correction):")
const hasLayoutEffect = source.includes("useLayoutEffect")
if (!hasLayoutEffect) {
  failures.push(
    `ref-effect guard: ${SKELETON} no longer contains useLayoutEffect but REF_EFFECT_GUARDS lists '${REF_EFFECT_GUARDS[0]?.name}' — either the effect was removed (update this gate) or renamed to something the gate can no longer find.`,
  )
  lines.push("  FAIL expected useLayoutEffect not found — guard entry is stale")
} else {
  for (const guard of REF_EFFECT_GUARDS) {
    if (!source.includes(guard.deps)) {
      failures.push(
        `ref-effect guard: dependency array ${guard.deps} not found in ${SKELETON} — the ${guard.name} effect may no longer list its gating state (${guard.gate}).`,
      )
      lines.push(`  FAIL ${guard.name}`)
    } else {
      lines.push(`  ok   ${guard.name}`)
      lines.push(`         deps ${guard.deps}`)
      lines.push(`         ${guard.gate}`)
    }
  }
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and the ref-effect guard holds.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. A real conformance harness drives the skeleton in a DOM and asserts observable behaviour — see harness/conformance.tsx, which this component's build ADDS TO rather than replaces this gate with: that a checkbox mounted indeterminate and then clicked/spaced resolves to checked and clears indeterminate (behavior.tri-state, the actual TRANSITION, not just three static mounts); that Space toggles a focused checkbox and Enter does nothing (behavior.keyboard-activation); that a disabled+error checkbox shows NO error styling while an enabled+error one does (behavior.validation's suppression); and that a CheckboxGroup's disabled/validation props reach an unmodified child through context (behavior.disabled-handling's OR-merge) without every child needing its own props set. ONE ENVIRONMENT CAVEAT, repeated from every prior component's gate (docs/TABS-MATRIX.md's validation pass): this page runs in a hidden tab, where focus EVENTS are suppressed though document.activeElement still updates on a programmatic .focus() — anything asserting on a focus EVENT arriving needs a synthetic bubbling focusin, not a bare .focus() call.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
