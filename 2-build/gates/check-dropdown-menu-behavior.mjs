#!/usr/bin/env node
/* check-dropdown-menu-behavior — the nineteenth component to ship the third
 * gate (button, calendar, spinner, tooltip, alert, input, select, dialog,
 * tabs, card, badge, progress, chip, checkbox, switch, radio-group, slider,
 * toast came before).
 *
 * WHY THIS EXISTS. gen-from-template.py checks STYLE and CONFIG rows.
 * Nothing automatic checks BEHAVIOR rows — SELECT-MATRIX.md finding 16
 * recorded the consequence once already (a documented-but-unimplemented
 * dismissal). This script asserts, for every behavior row in
 * dropdown-menu.template.json: (a) an entry exists in the CHECKLIST below;
 * (b) the code the entry cites actually exists in skeleton/dropdown-menu.tsx
 * (a literal source search, not a promise in a comment); (c) for
 * config-channel rows, the param is declared in skeletonParams AND the
 * skeleton really reads `config.<param>`.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS — see harness/conformance.tsx's
 * checkDropdownMenu() for the real DOM-driven assertions this gate cannot
 * make (a real ArrowDown actually moving the active item, a real ArrowRight
 * actually mounting the submenu popup with non-overlapping geometry, a real
 * outside pointerdown actually closing the whole stack).
 *
 * CALIBRATION (CLAUDE.md rule 11): deliberately broken before being trusted
 * — the symbol for behavior.dismiss-escape was changed to a string not
 * present in the skeleton ("Escapee"), confirmed the gate went red with the
 * expected "cited code not found" message, then restored to the real
 * symbol below.
 *
 * Run: node 2-build/gates/check-dropdown-menu-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/dropdown-menu.tsx"

const CHECKLIST = {
  "behavior.role": {
    order: 1,
    how: "All three columns render role=\"menu\" on the popup (Salt [S] useRole, shadcn [R] external package/APG, M3 [S] internals.role). A real three-way convergence, not one system's convention leaking — see DROPDOWN-MENU-MATRIX.md §2.",
    symbol: 'role="menu"',
    where: "the root popup and submenu-popup <div> elements",
  },
  "behavior.item-role": {
    order: 2,
    how: "Every item and submenu-trigger renders role=\"menuitem\", matching all three systems.",
    symbol: 'role: "menuitem" as const',
    where: "ItemRow(); commonProps",
  },
  "behavior.trigger-interaction": {
    order: 3,
    how: "Click toggles the root popup open/closed on the trigger button.",
    symbol: "setOpen((v) => {",
    where: "DropdownMenu(); the trigger's onClick",
  },
  "behavior.arrow-navigation": {
    order: 4,
    how: "ArrowUp/ArrowDown move the active item within whichever pool (root or open submenu) is currently active — moveActive() clamps and skips disabled items exactly like Salt's keydownHandlers.ts / M3's menu.ts's own NAVIGABLE_KEYs.",
    symbol: "function moveActive(delta: number)",
    where: "DropdownMenu(); called from onPopupKeyDown on ArrowDown/ArrowUp",
  },
  "behavior.home-end": {
    order: 5,
    how: "Home/End jump to the first/last ENABLED item in the active pool — real, gated on structural presence (all three columns are 'on' for this row, see the matrix), not merely documented.",
    symbol: 'if (e.key === "Home") {',
    where: "onPopupKeyDown()",
  },
  "behavior.typeahead": {
    order: 6,
    how: "Salt [S] is CONFIRMED OFF (no typeahead code anywhere in core/menu or lab/cascading-menu); shadcn/M3 are on. The chassis implements a REAL character-buffer/500ms-reset typeahead, gated on config.typeahead so Salt's own real absence renders as a real absence, not a silent grant.",
    symbol: "function typeaheadKey(k: string) {",
    where: "DropdownMenu()",
  },
  "behavior.item-activation": {
    order: 7,
    how: "Enter/Space (and click) fire the active item's onSelect and close the WHOLE stack (closeAll(), not just the innermost layer) — matching all three systems' own 'activating deep in a submenu closes everything' convention.",
    symbol: 'if (e.key === "Enter" || e.key === " ") {',
    where: "onPopupKeyDown()",
  },
  "behavior.disabled-item": {
    order: 8,
    how: "Disabled items are excluded from both the flattened activatable pool's landing targets (moveActive's disabled-skip loop) and from activation (commit() is never called for a disabled node; the item's own onClick guards on `!disabled` too).",
    symbol: "(flatSubmenu[next] as MenuItemModel).disabled",
    where: "moveActive()",
  },
  "behavior.submenu-open": {
    order: 9,
    how: "ArrowRight (on a submenu-trigger), click, or hover-after-delay all open the submenu and move its own active index to its first enabled item — real, matching Salt's keydownHandlers.ts ArrowRight + safePolygon hover and M3's sub-menu.ts hoverOpenDelay.",
    symbol: "function openSubmenu(value: string, focusFirst?: boolean) {",
    where: "DropdownMenu()",
  },
  "behavior.submenu-close": {
    order: 10,
    how: "ArrowLeft or Escape (while a submenu is open) closes ONLY the submenu, not the whole stack — matching Salt's keydownHandlers.ts ArrowLeft/Escape and M3's sub-menu.ts's own onCloseSubmenu, both of which act on the innermost layer first.",
    symbol: "function closeSubmenu() {",
    where: "DropdownMenu()",
  },
  "behavior.dismiss-outside": {
    order: 11,
    how: "A real document-level pointerdown listener (capture phase) closes the whole stack when the press lands outside the trigger, the root popup, AND the submenu popup — attached/detached on open state, the same declared floating-position-engine gap select.tsx's own equivalent listener carries.",
    symbol: 'document.addEventListener("pointerdown", onPointerDown, true)',
    where: "DropdownMenu(); the dismiss-outside effect",
  },
  "behavior.dismiss-escape": {
    order: 12,
    how: "Escape closes the INNERMOST open layer first (the submenu, if one is open) and only closes the whole stack (returning focus to the trigger) on a second Escape once no submenu remains open.",
    symbol: 'if (e.key === "Escape") {',
    where: "onPopupKeyDown()",
  },
  "behavior.focus-return": {
    order: 13,
    how: "Activating an item (commit()) returns real DOM focus to the trigger button after closing — a requestAnimationFrame-deferred .focus() call, matching Salt's own MenuPanel focusManagerProps.returnFocus convention at the root-menu level.",
    symbol: "triggerRef.current?.focus()",
    where: "commit()",
  },
}

// ---------------------------------------------------------------------

const templateRaw = readFileSync(join(ROOT, "contract/templates/dropdown-menu.template.json"), "utf8")
const template = JSON.parse(templateRaw)
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`dropdown-menu behaviour self-check — ${behaviorRows.length} behavior rows in dropdown-menu.template.json`)
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
    failures.push(`checklist entry '${id}' has no matching behavior row in dropdown-menu.template.json (stale checklist)`)
  }
}

lines.push("")
lines.push(
  "ref-reading effects: skeleton/dropdown-menu.tsx has exactly TWO effects. (1) the popup-width measurement (React.useLayoutEffect) reads popupRef.current, which is null whenever the popup is NOT mounted — its dep array is [isOpen], the exact state gating that ref's existence (rule 9). (2) the outside-pointerdown listener (React.useEffect) does NOT read any ref at effect-SETUP time — it attaches a document-level listener whose callback reads the refs fresh each time it FIRES, not once at attach time — so the dialog/checkbox class of bug (a stale ref captured once against a null node) does not apply to it by construction; its own dep array [open, forceOpen] still correctly re-attaches/detaches the listener as the popup's open state changes.",
)
const effectMatches = [...source.matchAll(/React\.use(?:Layout)?Effect\(/g)]
if (effectMatches.length !== 2) {
  failures.push(
    `expected exactly TWO effects (useEffect + useLayoutEffect) in ${SKELETON}; found ${effectMatches.length} — this gate's ref-reading claim needs re-auditing`,
  )
  lines.push(`  FAIL expected exactly two effects, found ${effectMatches.length}`)
} else {
  lines.push("  ok   exactly two effects exist, and both are audited above")
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and both effects this file has are ref-safe.`,
)
lines.push("")
lines.push(
  "NOTE, the same note every check-<name>-behavior.mjs prints: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS. See harness/conformance.tsx's checkDropdownMenu() for the real DOM-driven assertions: a real ArrowDown click sequence actually moving `data-active` between items, a real ArrowRight actually mounting the submenu popup with non-overlapping getBoundingClientRect geometry against the root popup, a real outside pointerdown actually removing both popups from the DOM, and a real Escape closing the submenu FIRST before the root (behavior.dismiss-escape's own innermost-first claim, the TABS-MATRIX.md finding-15 class of test-sequencing risk this pipeline now checks for explicitly on every new component).",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
