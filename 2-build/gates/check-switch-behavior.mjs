#!/usr/bin/env node
/* check-switch-behavior — the fifteenth component to ship the third gate
 * (badge, card, chip, dialog, progress, tabs, checkbox came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows. Nothing
 * automatic checks BEHAVIOR rows. SELECT-MATRIX.md finding 16 records the
 * consequence once already: a documented-but-unimplemented dismissal.
 *
 * SWITCH-SPECIFIC RISK THIS GATE WAS WRITTEN TO CATCH: behavior.keyboard-
 * activation is the ONE genuinely per-system-different behaviour row in this
 * matrix (Salt/shadcn enterActivates=false, M3 enterActivates=true) — it
 * would be very easy for a future edit to the skeleton's handleKeyDown to
 * silently stop reading config.enterActivates (e.g. hardcoding `true` or
 * removing the guard), which would make M3's real, sourced Enter-key
 * addition (see switch.template.json's keyboard-enter-addition citation)
 * either vanish or bleed into Salt/shadcn where it does not belong. This
 * script asserts BOTH that the literal `config.enterActivates` read exists
 * AND that `enterActivates` is declared in template.skeletonParams — the
 * config-channel branch every check-<name>-behavior.mjs performs, but this
 * is the FIRST component where that branch is genuinely load-bearing for a
 * real per-system behavioural fork rather than a formality.
 *
 * This script asserts, for every behavior row in switch.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/switch.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>`.
 * Any failure exits 1.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see the closing note this
 * script prints, and see harness/conformance.tsx's checkSwitch() for the
 * real DOM-driven assertions this gate cannot make (added alongside this
 * file, not replacing it).
 *
 * Run: node 2-build/gates/check-switch-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/switch.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a switch actually does these things: decide
 * what you are -> decide how you can be reached -> decide who can click you
 * -> stop responding -> refuse to change -> participate in a form.
 * `symbol` must appear VERBATIM in skeleton/switch.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  "behavior.role": {
    order: 1,
    how: 'UNLIKE CHECKBOX, role="switch" is never free — there is no native HTML switch input type, so Salt [S] and M3 [S] both write it EXPLICITLY on their native `<input type="checkbox">` (Salt\'s own biome-ignore comment says so: "aria-checked is not needed when input and checked is used"). shadcn/Radix [R]: the Root is a `<button role="switch">` per the linked docs, which must maintain aria-checked in JS since a button has no native `checked` property to read it from — not independently confirmable without primitives/ cloned. The chassis reproduces the free-checked-from-role mechanism identically for all three by always rendering a real native input with an explicit role="switch".',
    symbol: 'role="switch"',
    where: "Switch(); the input's <input> element",
  },
  "behavior.keyboard-activation": {
    order: 2,
    how: "THE HEADLINE DIVERGENCE FROM CHECKBOX: Salt [S] is Space-only (native, no override); M3 [S] EXPLICITLY ADDS Enter via a guarded keydown-to-click delegation, citing the APG switch pattern in its own source comment; shadcn/Radix [R] is left at enterActivates=false in this chassis, a DECLARED SIMPLIFICATION (not a claim that real Radix lacks Enter — its button-based Root plausibly answers Enter natively, but this chassis approximates it with a native input, which has no Enter semantics of its own, so inventing one would fabricate unconfirmable behaviour). The chassis reproduces M3's own guard shape (`!this.disabled`) as `!isDisabled`.",
    symbol: "config.enterActivates && event.key",
    where: "Switch(); handleKeyDown, bound via onKeyDown on the input",
  },
  "behavior.label-click-target": {
    order: 3,
    how: 'Identical three-way shape to checkbox: Salt: the WHOLE label (track/thumb and text) is one native click target, because structure.shell="label-wrap" makes the root a real <label> [S]. shadcn: only the track/root toggles; the consumer\'s own separate <Label htmlFor> extends the target, outside this component [S/R]. M3 explicitly ANTICIPATES an ancestor <label> a consumer might supply and redirects that click to its internal input (switch.ts constructor, form-label-activation.js) — not reproduced as a click LISTENER here (native <label>-wrapping already does the redirect for free in the DOM when shell="label-wrap"), but the ROOT ELEMENT CHOICE that makes Salt\'s case real is.',
    symbol: '(config.shell === "label-wrap" ? "label" : "span")',
    where: "Switch(); the Root element",
  },
  "behavior.disabled-handling": {
    order: 4,
    how: "Salt: the native disabled attribute [S]. shadcn: native disabled [S]. M3: native ?disabled, reflected property, PLUS a transition suppression around the disabled boundary that is pure CSS (style.track.disabled/.disabled/.disabled — not reproduced as JS here since it emits no behaviour, only style) [S]. Read straight off the `disabled` prop, the identical shape checkbox.tsx's own isDisabled used — with NO group merge this time, since switch has no group construct anywhere (a real, sourced absence, not an oversight).",
    symbol: "const isDisabled = Boolean(disabled ?? false)",
    where: "Switch(); isDisabled",
  },
  "behavior.readonly": {
    order: 5,
    how: 'Salt ONLY, and the mechanism is IDENTICAL to checkbox\'s: the native HTML readonly IDL attribute has no effect on type="checkbox" per the WHATWG HTML spec [R, spec fact], so Salt\'s own handleChange does its OWN early return — `if (event.nativeEvent.defaultPrevented || readOnly) { return }` [S]. Reproduced as the identical early-return shape; the controlled `checked` prop then snaps the DOM back on the next render regardless of what the browser momentarily allowed. shadcn/M3: OFF, confirmed absence — the chassis still implements the capability so the gap is a matrix cell, not a silent omission.',
    symbol: "if (isReadOnly) return",
    where: "Switch(); handleChange",
  },
  "behavior.form-participation": {
    order: 6,
    how: "M3 is the most explicit: a full form-associated custom element (getFormValue/getFormState/formResetCallback/formStateRestoreCallback) plus a REUSED CheckboxValidator instance [S] — the same validator class checkbox's own M3 column already documented. Salt inherits native form participation for free because its own input IS the real form control [S]. shadcn/Radix: [R], a hidden native bubble input per the linked docs, not independently confirmable here. The chassis's form-relevant attributes — name and the native checked/required — are what any of the three actually submit.",
    symbol: "name={name}",
    where: "Switch(); the input's <input> element",
  },
}

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/switch.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`switch behaviour self-check — ${behaviorRows.length} behavior rows in switch.template.json`)
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
    .join(", ") || "(none — behavior.keyboard-activation is locked but channel=config here, a genuine, deliberate difference from checkbox's identically-named but channel=info row)"} — all present in the checklist: ${lockedInfo.every((r) => CHECKLIST[r.id]) ? "yes" : "n/a"}`,
)

for (const id of Object.keys(CHECKLIST)) {
  if (!behaviorRows.some((r) => r.id === id)) {
    failures.push(`checklist entry '${id}' has no matching behavior row in switch.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push("ref-reading effects: NONE — switch has no indeterminate state (prop.checked-shape is a plain boolean everywhere), so unlike checkbox this skeleton has no useLayoutEffect and no ref-reading effect of any kind. The input is unconditionally rendered in every branch of every column, so there is no dialog-trap-shaped hazard to guard here at all — confirmed by absence, not merely unclaimed.")
const hasLayoutEffect = source.includes("useLayoutEffect(") || source.includes("useEffect(")
if (hasLayoutEffect) {
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
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. A real conformance harness drives the skeleton in a DOM and asserts observable behaviour — see harness/conformance.tsx's checkSwitch(), which this component's build ADDS TO rather than replaces this gate with: that a switch mounted off and clicked resolves to on (state.checked, the actual TRANSITION, not just two static mounts); that Enter toggles M3 but not Salt/shadcn (behavior.keyboard-activation's real per-system fork — the reason this gate exists in the first place); that a disabled switch does not toggle on click (behavior.disabled-handling); and that a read-only Salt switch does not toggle on click (behavior.readonly). ONE ENVIRONMENT CAVEAT, repeated from every prior component's gate: this page runs in a hidden tab, where focus EVENTS are suppressed though document.activeElement still updates on a programmatic .focus() — anything asserting on a focus EVENT arriving needs a synthetic bubbling focusin, not a bare .focus() call.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
