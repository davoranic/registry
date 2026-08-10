#!/usr/bin/env node
/* check-popover-behavior — the twenty-first component to ship the third gate
 * (button, calendar, spinner, tooltip, alert, input, select, dialog, tabs,
 * card, badge, progress, chip, checkbox, switch, radio-group, slider,
 * toast, dropdown-menu, accordion came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows.
 * Nothing automatic checks BEHAVIOR rows — SELECT-MATRIX.md finding 16
 * recorded the consequence once already (a documented-but-unimplemented
 * dismissal). This script asserts, for every behavior row in
 * popover.template.json: (a) an entry exists in the CHECKLIST below; (b) the
 * code the entry cites actually exists in skeleton/popover.tsx (a literal
 * source search, not a promise in a comment); (c) for config-channel rows,
 * the param is declared in skeletonParams AND the skeleton really reads
 * `config.<param>`.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see harness/conformance.tsx's
 * checkPopover()/checkPopoverModalFocusTrap()/checkPopoverDismiss() for the
 * real DOM-driven assertions this gate cannot make (a real click actually
 * opening the popup, a real outside pointerdown actually closing it, a real
 * Tab cycling INSIDE Salt's trapped panel versus escaping shadcn's own
 * non-modal one — the sharpest finding this component produced).
 *
 * CALIBRATION (CLAUDE.md rule 11): deliberately broken before being trusted
 * — the symbol for behavior.dismiss-escape was changed to a string not
 * present in the skeleton ("Escapee"), confirmed the gate went red with the
 * expected "cited code not found" message, then restored to the real
 * symbol below.
 *
 * Run: node 2-build/gates/check-popover-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/popover.tsx"

const CHECKLIST = {
  "behavior.trigger-interaction": {
    order: 1,
    how: "Click on the (cloned) trigger toggles the popup's own open state.",
    symbol: "setOpen(!open)",
    where: "Popover(); the cloned trigger's onClick",
  },
  "behavior.role": {
    order: 2,
    how: "The popup renders role=\"dialog\" — a real, independently-confirmed CONVERGENCE with shadcn's own Radix convention (Salt [S] Overlay.tsx's own useRole; shadcn [R] Radix's documented default).",
    symbol: 'role="dialog"',
    where: "Popover(); the popup <div>",
  },
  "behavior.modal-focus-trap": {
    order: 3,
    how: "THE sharpest finding this component produced. When config.modalFocusTrap is on (Salt), the rest of the page is marked inert (suppressBackground, the same ancestor-walk technique dialog.tsx's own suppressBackground() already proved) AND Tab/Shift+Tab cycle within the popup's own tabbable list. When off (shadcn), neither runs — Tab is free to leave, the page stays fully interactive.",
    symbol: "if (!live || !config.modalFocusTrap) return",
    where: "Popover(); the background-suppression effect",
  },
  "behavior.initial-focus": {
    order: 4,
    how: "On open, real DOM focus moves onto the popup itself (tabIndex=-1 + .focus()) — matching Salt's own FloatingFocusManager default (initialFocus=0, the floating element) and shadcn's own documented convention (focus moves onto the content).",
    symbol: "popup.focus()",
    where: "Popover(); the initial-focus effect",
  },
  "behavior.dismiss-outside": {
    order: 5,
    how: "A real document-level pointerdown listener (capture phase) closes the popup when the press lands outside the trigger, the anchor (when config.anchor is on), AND the popup itself — the SAME proven pattern dropdown-menu.tsx/select.tsx already carry.",
    symbol: 'document.addEventListener("pointerdown", onPointerDown, true)',
    where: "Popover(); the dismiss-outside effect",
  },
  "behavior.dismiss-escape": {
    order: 6,
    how: "Escape closes the popup and returns focus to the trigger (via the initial-focus effect's own cleanup function).",
    symbol: 'if (e.key === "Escape") {',
    where: "onPopupKeyDown()",
  },
  "behavior.focus-return": {
    order: 7,
    how: "Closing the popup (by any path — Escape, outside click, or the close button) returns real DOM focus to whatever had focus before it opened, via the initial-focus effect's own cleanup function.",
    symbol: "returnFocusRef.current?.focus()",
    where: "Popover(); the initial-focus effect's cleanup",
  },
  "behavior.close-button-action": {
    order: 8,
    how: "Salt's own real OverlayPanelCloseButton requires the CONSUMER to wire onClick by hand (confirmed: no useOverlayContext() call in the source file). This chassis, as the union component that already owns its own open state, completes that real, confirmed gap by wiring its own built-in close button directly to its internal close() function — a deliberate, labelled registry completion (see POPOVER-MATRIX.md Finding 3), not a silent liberty.",
    symbol: "onClick={close}",
    where: "Popover(); the close-button <button>",
  },
  "behavior.positioning-engine": {
    order: 9,
    how: "DECLARED GAP, the same shape TOOLTIP-MATRIX.md's own behavior.positioning-engine row already established: a fixed-offset getBoundingClientRect() calculation, not any of the three real engines (Salt's @floating-ui/react middleware, shadcn's external Radix Popper, M3 unsourced).",
    symbol: "const OFFSET = 8",
    where: "module scope, consumed by recompute()",
  },
}

// ---------------------------------------------------------------------

const templateRaw = readFileSync(join(ROOT, "contract/templates/popover.template.json"), "utf8")
const template = JSON.parse(templateRaw)
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`popover behaviour self-check — ${behaviorRows.length} behavior rows in popover.template.json`)
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
    failures.push(`checklist entry '${id}' has no matching behavior row in popover.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: skeleton/popover.tsx has FOUR effects (one useLayoutEffect for positioning, three useEffect for initial-focus/focus-return, modal-focus-trap background-suppression, and dismiss-outside). EVERY one reads a ref (popupRef, and the trigger/anchor refs inside the dismiss-outside listener's own callback) gated on a conditionally-rendered node's own existence: the positioning effect and the initial-focus effect both depend on `[open]`/`[live]` respectively — the exact state that gates `popupRef.current`'s existence (the checkbox/dialog 'stale null ref' class of bug this pipeline keeps re-finding when that rule is skipped) — and the modal-focus-trap effect additionally depends on `config.modalFocusTrap` so it neither runs nor leaves stale `inert` attributes when that capability is off. The dismiss-outside effect's own callback reads triggerRef/anchorRef/popupRef FRESH on every pointerdown (not captured once at effect-setup time), the same ref-safe-by-construction shape dropdown-menu.tsx's own equivalent listener already established.",
)
const effectMatches = [...source.matchAll(/React\.use(?:Layout)?Effect\(/g)]
if (effectMatches.length !== 4) {
  failures.push(
    `expected exactly FOUR effects in ${SKELETON}; found ${effectMatches.length} — this gate's ref-reading claim needs re-auditing`,
  )
  lines.push(`  FAIL expected exactly four effects, found ${effectMatches.length}`)
} else {
  lines.push("  ok   exactly four effects exist, and all four are audited above")
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and all four effects this file has are ref-safe.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS. See harness/conformance.tsx's checkPopover()/checkPopoverModalFocusTrap()/checkPopoverDismiss() for the real DOM-driven assertions: a real click actually opening the popup (not an already-open mount, the DIALOG-MATRIX.md lesson), a real outside pointerdown actually closing it, a real Escape closing it and returning focus to the trigger, and — the sharpest one — a real Tab keypress cycling BACK INSIDE Salt's own trapped panel while the SAME Tab keypress genuinely LEAVES shadcn's own non-modal one and lands on a control outside it.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
