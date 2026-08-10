#!/usr/bin/env node
/* check-drawer-behavior — the twenty-fifth component to ship the third gate
 * (button, calendar, spinner, tooltip, alert, input, select, dialog, tabs,
 * card, badge, progress, chip, checkbox, switch, radio-group, slider,
 * toast, dropdown-menu, accordion, popover, combobox, toggle-group, table
 * came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows.
 * Nothing automatic checks BEHAVIOR rows. SELECT-MATRIX.md finding 16
 * records the consequence once already: a documented-but-unimplemented
 * dismissal.
 *
 * DRAWER-SPECIFIC RISK THIS GATE WAS WRITTEN TO CATCH: this component
 * reuses dialog.tsx's own proven mechanisms almost verbatim, which is
 * exactly the situation where a future edit to ONE of the two files could
 * silently drift the other out of sync (fix a bug in dialog.tsx, forget
 * drawer.tsx uses the identical pattern) without either template's own
 * generator noticing, since neither mechanism touches CSS. It also asserts
 * the ONE real, sourced difference this component's own build found and
 * fixed live in a browser: `tabbablesIn`'s own visibility filter must use
 * `getClientRects().length`, NOT `offsetParent !== null` — Salt's own
 * DrawerCloseButton.css genuinely uses `position: fixed` (reproduced
 * verbatim at style.close-button.position), and offsetParent is ALWAYS
 * null for a position:fixed element per spec, regardless of real
 * visibility. The dialog.tsx-derived filter this skeleton started from
 * silently sent initial focus to the panel itself instead of the close
 * button whenever the close button was the only tabbable target — found
 * only by driving a real DOM in Playwright, not by any static gate.
 *
 * This script asserts, for every behavior row in drawer.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/drawer.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>`.
 * Any failure exits 1.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see
 * harness/conformance.tsx's checkDrawer() for the real DOM-driven
 * assertions this gate cannot make: a right-anchored panel actually
 * sitting flush against the viewport's right edge at full height (not just
 * a CSS declaration), initial focus actually landing inside the panel
 * (specifically on the close button, the regression this gate's own
 * calibration below re-creates), Salt's own scroll genuinely staying
 * unlocked while shadcn/m3's own locks, and the drag handle genuinely
 * appearing at position=bottom and genuinely absent at position=right.
 *
 * CALIBRATION (CLAUDE.md rule 11): deliberately broken before being
 * trusted — the symbol for behavior.focus-trap was changed to a string not
 * present in the skeleton ("onPanelKeyDownXXX"), confirmed the gate went
 * red with the expected "cited code not found" message, then restored to
 * the real symbol below. Separately, the getClientRects() fix itself was
 * verified the OTHER way: reverting drawer.tsx's tabbablesIn to the
 * offsetParent-based filter it started from, re-running
 * harness/conformance.tsx's own checkDrawer() live in Playwright, and
 * confirming behavior.initial-focus went from PASS to FAIL for the salt
 * column specifically (the only column whose close button is
 * position:fixed) before restoring the fix — the same "break it to trust
 * it" discipline CLAUDE.md's Known-open work section describes for every
 * gate in this pipeline.
 *
 * Run: node 2-build/gates/check-drawer-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/drawer.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST. `symbol` must appear VERBATIM in skeleton/drawer.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  "behavior.role": { order: 1, how: "role=\"dialog\" in all three, byte-identical to Dialog.tsx's own literal.", symbol: 'role="dialog"', where: "Drawer(); the panel element" },
  "behavior.aria-modal": { order: 2, how: "Salt [S]: aria-modal=\"true\" on the FloatingComponent. shadcn/m3 [R] per APG.", symbol: "config.ariaModal ? true : undefined", where: "Drawer(); the panel element" },
  "behavior.background-suppression": { order: 3, how: "Salt [S]: outsideElementsInert:true (inert). shadcn/m3 [R]: aria-hidden. Byte-identical mechanism to dialog.tsx's own suppressBackground().", symbol: "function suppressBackground(panel: HTMLElement, mode: string)", where: "module scope, reused by an effect in Drawer()" },
  "behavior.focus-trap": { order: 4, how: "All three trap; the skeleton implements a real keydown-based Tab/Shift+Tab cycle, byte-identical to dialog.tsx's own onPanelKeyDown.", symbol: "const onPanelKeyDown = (e: React.KeyboardEvent)", where: "Drawer()" },
  "behavior.initial-focus": { order: 5, how: "Salt [S]: configurable (initialFocusIndex, default 0). shadcn/m3 [R]: first-tabbable. USES getClientRects().length, NOT offsetParent — see this file's own header comment for the real regression this fixed.", symbol: "el.getClientRects().length > 0", where: "tabbablesIn()" },
  "behavior.focus-return": { order: 6, how: "All three; document.activeElement is captured at open and restored on close.", symbol: "returnFocusRef.current = active instanceof HTMLElement ? active : null", where: "Drawer(); the initial-focus effect" },
  "behavior.dismiss-escape": { order: 7, how: "All three, on by default; a capture-phase document keydown listener.", symbol: 'if (e.key === "Escape")', where: "Drawer(); the dismiss-escape effect" },
  "behavior.dismiss-outside": { order: 8, how: "Salt [S]: COUPLED to Escape via the same disableDismiss/enabled flag (a real, sourced narrowing from dialog.tsx's own version of this row — see docs/DRAWER-MATRIX.md Finding 1). shadcn/m3 [R]: on by default.", symbol: "const onPointerDown = (e: PointerEvent)", where: "Drawer(); the dismiss-outside effect" },
  "behavior.scroll-lock": { order: 9, how: "Salt [S]: CONFIRMED ABSENT — Drawer.tsx never passes lockScroll (see docs/DRAWER-MATRIX.md Finding 4); this branch is simply a no-op for that column. shadcn/m3 [R]: on.", symbol: "if (!live || !config.scrollLock) return", where: "Drawer(); the scroll-lock effect" },
  "behavior.labelled-by": { order: 10, how: "All three; Salt's own mechanism [S] is real but MANUAL (no context channel, unlike Dialog) — the skeleton still generates and wires the id whenever a title renders, for every column.", symbol: "aria-labelledby={hasTitle ? titleId : undefined}", where: "Drawer(); the panel element" },
  "behavior.described-by": { order: 11, how: "shadcn/m3 [R]: on when a description is mounted. Salt [S]: off, no description part exists.", symbol: "aria-describedby={config.describedBy && hasDescription ? descriptionId : undefined}", where: "Drawer(); the panel element" },
  "behavior.exit-animation": { order: 12, how: "Salt [S]: a 300ms deferred unmount, identical to dialog.tsx's own. shadcn [R]: vaul's own asymmetric-duration animate-out. M3: off.", symbol: "const t = setTimeout(() => setMounted(false), exitDuration)", where: "Drawer(); the mounted effect" },
}

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/drawer.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`drawer behaviour self-check — ${behaviorRows.length} behavior rows in drawer.template.json`)
lines.push("")

if (behaviorRows.length === 0) {
  lines.push("  NO BEHAVIOUR ROWS — this gate would have nothing to prove.")
}

const ordered = [...behaviorRows].sort(
  (a, b) => (CHECKLIST[a.id]?.order ?? 999) - (CHECKLIST[b.id]?.order ?? 999),
)

// behavior.portal is a locked/info declared-gap row, the SAME shape
// dialog.template.json's own behavior.portal row uses — no code implements
// a portal (that is the point), so it is deliberately EXCLUDED from the
// checklist rather than given a fake symbol to search for. Recorded here so
// the "stale checklist" sweep below does not misreport it as forgotten.
const DECLARED_GAP_ROWS = new Set(["behavior.portal"])

for (const row of ordered) {
  if (DECLARED_GAP_ROWS.has(row.id)) {
    lines.push(`  gap  ${row.id}  [${row.policy}/${row.channel}]  DECLARED GAP — no implementation exists by design (see the template row's own note); intentionally not code-checked`)
    continue
  }
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
    failures.push(`checklist entry '${id}' has no matching behavior row in drawer.template.json (stale checklist)`)
  }
}
for (const id of DECLARED_GAP_ROWS) {
  if (!behaviorRows.some((r) => r.id === id)) {
    failures.push(`DECLARED_GAP_ROWS entry '${id}' has no matching behavior row in drawer.template.json (stale exclusion list)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: TWO — the background-suppression effect and the initial-focus/focus-return effect both read panelRef.current (the exit-animation effect reads no ref at all, only a timer). Both list `mounted` in their own dependency array (the dialog.tsx-proven pattern this skeleton copies verbatim), guarding against the exact 'stale null ref' class of bug DIALOG-MATRIX.md's own owner-validation pass found and fixed.",
)
const mountedGuardedEffects = [...source.matchAll(/\[live, mounted,/g)].length
lines.push(`  ${mountedGuardedEffects} effect(s) found with 'mounted' in their own dependency array; expected at least 2 (background-suppression, initial-focus/focus-return)`)
if (mountedGuardedEffects < 2) {
  failures.push(
    `ref-effect guard: only ${mountedGuardedEffects} effect(s) found guarding on 'mounted' — review whether a ref-reading effect lost its guard.`,
  )
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row (or is a declared gap), and every ref-reading effect is correctly dependency-gated.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. A real conformance harness drives the skeleton in a DOM and asserts observable behaviour — see harness/conformance.tsx's checkDrawer(), which this component's build ADDS TO rather than replaces this gate with: a right-anchored panel's real getBoundingClientRect() flush against the viewport edge at full height, initial focus genuinely landing inside the panel, Salt's own scroll genuinely staying unlocked while shadcn/m3's own genuinely locks, a real Tab-wrap inside the panel, a real Escape dismissal, and the drag handle genuinely present at position=bottom and genuinely absent at position=right — the SAME live-DOM discipline that caught this component's own real getClientRects()/offsetParent regression, which no static gate (this one included) could have found.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
