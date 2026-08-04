#!/usr/bin/env node
/* check-dialog-behavior — the missing THIRD GATE, scoped to dialog only.
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
 * The owner found it by trying to close a popup.
 *
 * Dialog is the most behaviour-dense component in the registry so far, so
 * this script asserts, for every behavior row in dialog.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/dialog.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>`.
 * Any failure exits 1.
 *
 * The brief's minimum was "fail if a locked, channel:info behavior row has
 * no checklist entry". That subset is reported separately below, but the
 * check implemented here is deliberately wider: it covers every behavior
 * row of every policy and every channel, because the row that broke on
 * select was a locked INFO row and the rows most likely to break on dialog
 * are switchable CONFIG ones.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS. It proves the code exists
 * and is wired to the row; it does NOT prove the code is correct. A real
 * third gate would drive the skeleton in a DOM and assert observable
 * behaviour (focus lands here, Escape closes, the body stops scrolling).
 * Logged for the owner as such.
 *
 * Run: node scripts/check-dialog-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/dialog.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a dialog actually performs these things:
 * open -> suppress -> lock -> focus -> operate -> dismiss -> restore.
 * `symbol` must appear VERBATIM in skeleton/dialog.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  // --- 1. what the panel announces itself as -------------------------
  "behavior.role": {
    order: 1,
    how: "role=\"dialog\" written directly on the panel element.",
    symbol: 'role="dialog"',
    where: "Dialog() return, the [data-slot=\"dialog-panel\"] div",
  },
  "behavior.aria-modal": {
    order: 2,
    how: "aria-modal is emitted ONLY when the column turns it on. Salt sets it (Dialog.tsx:154); Radix deliberately does not and aria-hides siblings instead; M3 [R] sets it per APG.",
    symbol: "aria-modal={config.ariaModal ? true : undefined}",
    where: "Dialog() return, the panel div",
  },
  "behavior.labelled-by": {
    order: 3,
    how: "the title element gets a generated id and the panel points at it, but only when a title is actually rendered — mirroring Radix's titlePresent gate and Salt's DialogContext id channel.",
    symbol: "aria-labelledby={hasTitle ? titleId : undefined}",
    where: "Dialog() return, the panel div",
  },
  "behavior.described-by": {
    order: 4,
    how: "aria-describedby is wired to the description id only when the column turns the row on AND a description is rendered. Salt's cell is false (a confirmed absence); shadcn's and M3's are true.",
    symbol: "aria-describedby={config.describedBy && hasDescription ? descriptionId : undefined}",
    where: "Dialog() return, the panel div",
  },

  // --- 2. what happens to everything else ----------------------------
  "behavior.background-suppression": {
    order: 5,
    how: "an ancestor walk from the panel outward marking every sibling at every level — the same traversal aria-hidden's hideOthers performs — writing `inert` for Salt or `aria-hidden` for shadcn/M3, and restoring exactly what it changed.",
    symbol: "function suppressBackground",
    where: "module scope; called from the effect gated on `live`",
  },
  "behavior.scroll-lock": {
    order: 6,
    how: "Salt's usePreventScroll standard path: documentElement.style.overflow = 'hidden' plus a paddingRight equal to the vanished scrollbar's width, ref-counted across nested dialogs. Applied INLINE on documentElement, never through a theme-scoped custom property (SELECT-MATRIX.md finding 14).",
    symbol: "function lockPageScroll",
    where: "module scope; effect gated on `live && config.scrollLock`",
  },

  // --- 3. focus ------------------------------------------------------
  "behavior.initial-focus": {
    order: 7,
    how: "the first tabbable inside the panel takes focus, unless the column says `configurable` (Salt) and the instance supplies an ordinal, in which case that index does. Falls back to the panel itself when nothing is tabbable.",
    symbol: 'config.initialFocus === "configurable"',
    where: "the initial-focus/focus-return effect",
  },
  "behavior.focus-trap": {
    order: 8,
    how: "a Tab/Shift+Tab keydown handler on the panel that cycles the tabbable list and WRAPS at both ends — the loop both live systems document (Salt accessibility.mdx; Radix FocusScope `loop`).",
    symbol: "const onPanelKeyDown",
    where: "Dialog(); bound as onKeyDown on the panel div",
  },
  "behavior.focus-return": {
    order: 9,
    how: "document.activeElement is captured when the dialog goes live and re-focused in the effect's cleanup, matching shadcn's explicit triggerRef.focus() and Salt's FloatingFocusManager returnFocus default.",
    symbol: "returnFocusRef.current?.focus()",
    where: "cleanup of the initial-focus/focus-return effect",
  },

  // --- 4. operating the body ----------------------------------------
  "behavior.scroll-region-focusable": {
    order: 10,
    how: "when the body actually overflows, the inner scroller receives role=region, tabIndex=0 and aria-labelledby — the three attributes Salt's DialogContent spreads via overflowProps. Overflow is measured with a ResizeObserver plus a scroll handler, using source's own `> 1` bottom tolerance.",
    symbol: "config.scrollRegionFocusable && overflowing",
    where: "the `body` expression, contentScroller branch",
  },

  // --- 5. leaving ----------------------------------------------------
  "behavior.dismiss-escape": {
    order: 11,
    how: "a CAPTURE-phase keydown listener on the document, so a keypress inside the panel still closes even if a child stops propagation.",
    symbol: "config.dismissOnEscape",
    where: "the escape-dismiss effect",
  },
  "behavior.dismiss-outside": {
    order: 12,
    how: "a CAPTURE-phase pointerdown (not click — the event both real implementations dismiss on) that closes when the press lands outside the panel, with Radix's own right-click / ctrl+left guard. Suspended while the harness pins the dialog open.",
    symbol: 'document.addEventListener("pointerdown", onPointerDown, true)',
    where: "the outside-dismiss effect",
  },
  "behavior.exit-animation": {
    order: 13,
    how: "when the column turns it on, unmount is deferred by exitDuration so the closed-state animation can play (Salt's own 300ms setTimeout; Radix's Presence). When off (M3, which has no motion token) unmount is immediate.",
    symbol: "setTimeout(() => setMounted(false), exitDuration)",
    where: "the mount/unmount effect",
  },

  // --- 6. declared gaps ----------------------------------------------
  "behavior.portal": {
    order: 14,
    how: "DECLARED GAP, deliberately NOT implemented. Salt portals through floating-ui's FloatingPortal (re-applying a SaltProvider inside it); shadcn through Radix's DialogPortal. This skeleton renders the scrim and panel in place as position:fixed siblings under a display:contents root so they stay inside the harness's [data-theme] scope. The gap is stated in the skeleton header and in the template row.",
    symbol: "NO PORTAL",
    where: "skeleton header comment, declared gap (a)",
  },
}

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/dialog.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`dialog behaviour self-check — ${behaviorRows.length} behavior rows in dialog.template.json`)
lines.push("")

const ordered = [...behaviorRows].sort(
  (a, b) => (CHECKLIST[a.id]?.order ?? 999) - (CHECKLIST[b.id]?.order ?? 999),
)

for (const row of ordered) {
  const entry = CHECKLIST[row.id]
  const tags = [row.policy, row.channel].join("/")
  if (!entry) {
    failures.push(`${row.id} (${tags}): NO CHECKLIST ENTRY — a documented behavior with no stated implementation is exactly the SELECT-MATRIX.md finding-16 failure.`)
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
    failures.push(`checklist entry '${id}' has no matching behavior row in dialog.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row.`,
)
lines.push(
  "NOTE: this gate proves the code EXISTS and is bound to the row. It does not prove the code is CORRECT — a real conformance harness would drive the skeleton in a DOM. Logged for the owner as the remaining half of the missing third gate.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
