#!/usr/bin/env node
/* check-toast-behavior — the eighteenth component to ship the third gate
 * (button, calendar, spinner, tooltip, alert, input, select, dialog, tabs,
 * card, badge, progress, chip, checkbox, switch, radio-group, slider came
 * before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows. Nothing
 * automatic checks BEHAVIOR rows. SELECT-MATRIX.md finding 16 records the
 * consequence once already: a documented-but-unimplemented dismissal.
 *
 * TOAST-SPECIFIC RISK THIS GATE WAS WRITTEN TO CATCH: this is the pipeline's
 * FIRST genuinely TIME-based component. behavior.auto-dismiss and
 * behavior.pause-on-interaction are easy to break silently — a future edit
 * to Toast's arm()/clearTimer()/handlePointerEnter()/handlePointerLeave()
 * could stop re-arming the timer correctly, or stop computing the REMAINING
 * time on pause (re-arming the FULL duration instead, or never resuming at
 * all), and NOTHING in gen-from-template.py or the style/structure gates
 * would notice — CSS and config rows would still validate fine, and a
 * STATIC render would look identical whether the timer logic is right or
 * wrong. This script asserts the literal timer-arithmetic code exists;
 * harness/conformance.tsx's checkToast() (added alongside this file)
 * asserts the OBSERVABLE consequence — that a live toast is actually
 * removed by its own timer, and that hovering it actually delays removal
 * past its own nominal duration.
 *
 * This script asserts, for every behavior row in toast.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) EITHER the code the entry cites actually exists in
 *       skeleton/toast.tsx (a literal source search, not a promise in a
 *       comment), OR the entry is explicitly flagged `noImplementation`
 *       (behavior.swipe-dismiss — a DECLARED deferral, documented in
 *       toast.template.json's own row note as supplementary-evidence-only,
 *       not fabricated as implemented when it is not — see TOAST-MATRIX.md
 *       Findings); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>`.
 * Any failure exits 1.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see the closing note this
 * script prints, and see harness/conformance.tsx's checkToast() for the
 * real DOM-driven, TIME-DRIVEN assertions this gate cannot make.
 *
 * CALIBRATION (CLAUDE.md rule 11): this gate was deliberately broken before
 * being trusted — the symbol for behavior.auto-dismiss was changed to a
 * string not present in the skeleton ("window.setTimeoutXXX"), confirmed
 * the gate went red with the expected "cited code not found" message, then
 * restored to the real symbol below.
 *
 * Run: node 2-build/gates/check-toast-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/toast.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a toast actually does these things: decide
 * what role it announces -> decide whether it expires on its own -> decide
 * whether interacting with it pauses that expiry -> decide how removal is
 * ultimately triggered -> decide whether a gesture can remove it -> decide
 * how multiple toasts order themselves. `symbol` must appear VERBATIM in
 * skeleton/toast.tsx, unless `noImplementation` is set.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  "behavior.role": {
    order: 1,
    how: 'Salt [S] hardcodes role="alert" on every Toast, always. shadcn [R] (external package) and M3 [R] (no live component) are both treated as role="status" per the general APG convention. The chassis reproduces whichever role the column\'s own config declares, per-instance, on the item root.',
    symbol: 'role={config.role || undefined}',
    where: "Toast(); the toast-item root element",
  },
  "behavior.auto-dismiss": {
    order: 2,
    how: "Salt [S] is CONFIRMED OFF — no timer anywhere in Toast.tsx/ToastContent.tsx/ToastGroup.tsx, toasts are persistent by design (usage.mdx). shadcn/M3 are ON by real-world/spec convention but the exact default duration is an [R] boundary in both (external package / no timing token). The chassis implements a REAL internal setTimeout keyed on a `duration` prop — arm()/clearTimer() — with NO timer at all when duration is 0/undefined (reproducing Salt's own persistent posture for free when the column passes no duration).",
    symbol: "timerRef.current = window.setTimeout(() => {",
    where: "Toast(); the arm() callback",
  },
  "behavior.pause-on-interaction": {
    order: 3,
    how: "shadcn/M3 [R] — well-documented public convention (sonner + Material snackbar guidance) that hovering/focusing a toast should not let it expire mid-interaction; not independently confirmable in this clone at the implementation level. Salt: off (no timer to pause). The chassis implements REAL pause/resume arithmetic: handlePointerEnter() computes and stores the REMAINING time (not just 'stop'), handlePointerLeave() re-arms with exactly that remainder — not the full original duration.",
    symbol: "remainingRef.current = Math.max(remainingRef.current - elapsed, 0)",
    where: "Toast(); handlePointerEnter()",
  },
  "behavior.dismiss": {
    order: 4,
    how: "Shared invariant across all three systems: removal from the visible stack is ultimately a consumer-owned state change (Salt's own toast-group.stories.tsx demonstrates the exact useState/closeToast pattern this chassis reproduces). `onClose` is the ONE shared hook for both the manual (close-button/action) and automatic (timer) dismissal paths — the timer calls the identical callback a close-button click does.",
    symbol: "onCloseRef.current?.()",
    where: "Toast(); the arm() callback's setTimeout body",
  },
  "behavior.swipe-dismiss": {
    order: 5,
    how: "Salt: off, no gesture code anywhere (grepped, confirmed absent). shadcn: SUPPLEMENTARY-ONLY evidence (the 'base' style's real data-swipe-direction/data-ending-style contract) for a part canonical sonner's own external package implements but this clone cannot inspect. M3: [R], general convention, no token evidence. DECLARED DEFERRAL, not a silent gap (see toast.template.json's own row note and TOAST-MATRIX.md Findings): NOT implemented as physical pointer-dragging in this chassis. The close button and auto-dismiss timer are the two REAL, testable dismissal paths this build delivers instead.",
    noImplementation: true,
    where: "(intentionally absent — see 'how')",
  },
  "behavior.stacking-order": {
    order: 6,
    how: "Salt [S]: real, sourced newest-nearest-anchor ordering (toast-group.stories.tsx's own timestamp sort, reversed per corner). shadcn: SUPPLEMENTARY '--toast-index'-driven peek/scale stack [S-supplementary]; canonical sonner's own math is [R]. M3 [R]: typically one snackbar visible at a time, a genuinely different posture, not modelled as a config axis (no token). The chassis stacks via ordinary flex-column document flow — ToastGroup's own base CSS (`display: flex; flex-direction: column`) plus each newly-added entry being APPENDED to the end of the consumer's own array (see harness/toast-check.tsx's StackingDemo: `setEntries((cur) => [...cur, ...])`), a declared simplification of shadcn's own fancier index-transform visual (see structure.group).",
    symbol: 'flex-direction": "column"',
    file: "contract/templates/toast.template.json",
    where: "toast.template.json base block; [data-slot=\"toast-group\"]",
  },
}

// ---------------------------------------------------------------------

const templateRaw = readFileSync(join(ROOT, "contract/templates/toast.template.json"), "utf8")
const template = JSON.parse(templateRaw)
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`toast behaviour self-check — ${behaviorRows.length} behavior rows in toast.template.json`)
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
  if (entry.noImplementation) {
    // A DECLARED deferral, not a silent gap — see the entry's own `how`.
  } else {
    const haystack = entry.file === "contract/templates/toast.template.json" ? templateRaw : source
    const haystackName = entry.file ?? SKELETON
    if (!haystack.includes(entry.symbol)) {
      problems.push(`cited code \`${entry.symbol}\` not found in ${haystackName}`)
    }
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
    lines.push(`  ok   ${row.id}  [${tags}]${entry.noImplementation ? "  (declared deferral, no code expected)" : ""}`)
    lines.push(`         ${entry.how}`)
    lines.push(`         -> ${entry.file ?? SKELETON} :: ${entry.where}`)
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
    failures.push(`checklist entry '${id}' has no matching behavior row in toast.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: Toast() has ONE real effect — the auto-dismiss re-arm effect, keyed on `duration` only (NOT on `onClose`'s identity, which is absorbed via onCloseRef so a parent re-render never spuriously re-arms the timer). It reads no ref to a CONDITIONALLY rendered node (timerRef/remainingRef/startedAtRef/onCloseRef are all plain mutable refs, not DOM refs, and the item root itself is unconditionally rendered) — so the checkbox/radio-group dialog-trap class of bug (a ref-reading effect whose deps omit the state gating the ref's node) does not apply here by construction.",
)
const effectMatches = [...source.matchAll(/React\.useEffect\(/g)]
if (effectMatches.length !== 1) {
  failures.push(
    `expected exactly ONE React.useEffect in ${SKELETON} (the duration re-arm effect); found ${effectMatches.length} — this gate's "single, non-ref-reading effect" claim needs re-auditing`,
  )
  lines.push(`  FAIL expected exactly one useEffect, found ${effectMatches.length}`)
} else {
  lines.push("  ok   exactly one useEffect exists, and it reads no conditionally-rendered ref (confirmed by inspection)")
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} (or explicitly, honestly flagged as a declared deferral) and wired to its row, and the one effect this file has does not read a conditionally-rendered ref.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. A real conformance harness drives the skeleton in a DOM and asserts observable behaviour — see harness/conformance.tsx's checkToast(), which this component's build ADDS TO rather than replaces this gate with: that a live toast is REMOVED by its own timer after real elapsed time (behavior.auto-dismiss, the pipeline's first genuinely time-based assertion), that hovering it DELAYS that removal past its own nominal duration and moving away resumes it (behavior.pause-on-interaction), that a close-button click removes it immediately (behavior.dismiss), and that multiple toasts stack without overlapping, newest last (behavior.stacking-order). ONE ENVIRONMENT CAVEAT specific to THIS component, on top of every prior gate's usual hidden-tab caveats: conformance.tsx's own MessageChannel-based `tick()`/`settle()` helpers are NOT a substitute for real elapsed wall-clock time here — a setTimeout-driven behaviour needs the test to actually WAIT (a real await with a real ms delay, comfortably longer than the toast's own configured duration), not just yield a few scheduler ticks.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
