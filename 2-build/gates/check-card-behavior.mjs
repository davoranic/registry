#!/usr/bin/env node
/* check-card-behavior — the THIRD GATE, scoped to card.
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
 *
 * Card looks like a static surface and is not. It carries NINE behavior
 * rows, seven of them locked, covering a five-way role computation, a
 * four-branch tab stop, two different keyboard contracts inside ONE design
 * system (Enter+Space on an interactable card, Enter ONLY on a link card,
 * because an anchor is not a button), a JS pressed flag with a timing
 * guard, a disabled mechanism that disables the card's DESCENDANTS rather
 * than the card, radio-group arrow navigation that selects as it moves,
 * and the single most consequential row in the component: whether the
 * surface is a CONTAINER of focusable children or a CONTROL that must not
 * hold any. None of that is visible in a screenshot or to the generator.
 *
 * This script asserts, for every behavior row in card.template.json:
 *   (a) an entry exists in the CHECKLIST below;
 *   (b) the code the entry cites actually exists in skeleton/card.tsx
 *       (a literal source search, not a promise in a comment); and
 *   (c) for config-channel rows, the param is declared in skeletonParams
 *       AND the skeleton really reads `config.<param>`.
 * Any failure exits 1.
 *
 * The brief's minimum was "fail if a locked, channel:info behavior row has
 * no checklist entry". That subset is reported separately below, but the
 * check implemented here is deliberately wider: it covers every behavior
 * row of every policy and every channel.
 *
 * THIS IS A STOPGAP, NOT A CONFORMANCE HARNESS. See the closing note the
 * script prints — dialog shipped TWO effects that passed this exact gate
 * and never executed.
 *
 * Run: node scripts/check-card-behavior.mjs   (from registry/)
 */
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SKELETON = "skeleton/card.tsx"

/* ---------------------------------------------------------------------
 * THE CHECKLIST, in the order a card actually performs these things:
 * announce -> take a tab stop -> be activated -> show it -> refuse when
 * disabled -> declare what may live inside -> behave as a set.
 * `symbol` must appear VERBATIM in skeleton/card.tsx.
 * ------------------------------------------------------------------- */
const CHECKLIST = {
  // --- 1. what the surface announces itself as -----------------------
  "behavior.role": {
    order: 1,
    how: 'FIVE answers across three systems. A static card takes NO role at all (Salt\'s Card, and every shadcn card). A button card takes role="button" standalone and swaps to role="radio" (single-select group) or role="checkbox" (multi-select group), writing aria-checked only for those two readings. A link card is a real <a href> and takes the platform\'s own role. M3 is [R] — a tokens-only clone has no element to grep.',
    symbol: "const role: string | undefined =",
    where: "Card(); consumed in commonProps, together with aria-checked",
  },

  // --- 2. who holds the tab stop -------------------------------------
  "behavior.tab-stop": {
    order: 2,
    how: "Salt's four-branch computation, reproduced in full: -1 when disabled; 0 on EVERY card of a multi-select group (checkbox semantics, Tab walks the set); roving in a single-select group, where the stop is the selected card or — while the group still has no value — the FIRST card (radio semantics, Tab enters once); 0 standalone. A static card is never in the tab order at all.",
    symbol: "const tabIndex: number | undefined =",
    where: "Card(); consumed in commonProps",
  },

  // --- 3. committing an activation -----------------------------------
  "behavior.keyboard-activation": {
    order: 3,
    how: 'TWO CONTRACTS INSIDE ONE DESIGN SYSTEM, and this is the row a boolean "interactive" flag would have destroyed. An interactable card binds Enter AND Space, preventDefaults both, and fires from KEYDOWN (Salt\'s useInteractableCard does exactly that). A link card binds NOTHING — it is a native anchor, so Enter navigates and SPACE DOES NOT ACTIVATE IT. The guard is therefore on interaction === "button", not on interactive.',
    symbol: 'if (interaction === "button" && (e.key === "Enter" || e.key === " "))',
    where: "handleKeyDown() in Card()",
  },
  "behavior.pointer-activation": {
    order: 4,
    how: "onClick, and bound only when it is allowed to fire: a disabled card gets `undefined` rather than a handler that returns early, reproducing Salt's `onClick: !disabled ? handleClick : undefined`. In a group the same activation also commits the group's value.",
    symbol: "const handleClick = disabled || !interactive ? undefined : () => activate()",
    where: "Card(); consumed in commonProps",
  },

  // --- 4. showing the press ------------------------------------------
  "behavior.active-flag": {
    order: 5,
    how: "Salt's useInteractableCard pressed flag, reproduced including its timing guard: a setTimeout(...,0) that refuses to clear `active` while a key is still down, because Enter fires as BOTH a key event and a click, and because Firefox does not enter :active on Space. The flag is published as data-active so the pressed STYLE rows can select on it — a :active pseudo-class never survives a keyboard activation.",
    symbol: 'if (keyIsDown !== "Enter" && keyIsDown !== " " && active) setActive(false)',
    where: "the active-flag effect in Card(); published as data-active in commonProps",
  },

  // --- 5. refusing ---------------------------------------------------
  "behavior.disabled-handling": {
    order: 6,
    how: "aria-disabled, NOT the native attribute, exactly as Salt writes it — plus tabIndex -1, plus withholding the click handler entirely, plus the CSS row that kills pointer-events on the card's SECTIONS rather than on the card (so a disabled Salt card still shows its not-allowed cursor while nothing inside it can be clicked). The ARIA is written even in a column with no disabled styling, per docs/TABS-MATRIX.md declared approximation 4.",
    symbol: '"aria-disabled": disabled ? true : undefined',
    where: "commonProps in Card(); the tab stop and the withheld handler are rows 2 and 4",
  },

  // --- 6. what may live inside ---------------------------------------
  "behavior.nested-interactive": {
    order: 7,
    how: 'THE GENUINE A11Y FORK, and it is published as a data attribute rather than described in a comment so that it can be asserted: "container" (a static card may hold focusable children), "tolerated" (an interactable card is a control that Salt nevertheless allows to embed them for visual affordance), "forbidden" (a link card is a control whose own usage doc says it "shouldn\'t contain actionable components"). The chassis also MEASURES whether focusable descendants are actually present and publishes data-has-focusable, so a link card carrying one is visible in the DOM instead of merely discouraged in prose.',
    symbol: "const nestedInteractive =",
    where: "Card(); published as data-nested-interactive, paired with the data-has-focusable measurement",
  },

  // --- 7. behaving as a set ------------------------------------------
  "behavior.group-navigation": {
    order: 8,
    how: "Salt only. Space always selects the focused card. In SINGLE-select mode only, ArrowDown/ArrowRight advance and ArrowUp/ArrowLeft retreat with wrap-around modular arithmetic, and each arrow SELECTS AND THEN FOCUSES — radio-group semantics, with no manual mode, which is the opposite conclusion to the one Salt's own TabList reaches for arrow keys. In MULTI-select mode there is no arrow handling at all.",
    symbol: "const onGroupKeyDown =",
    where: "CardGroup(); bound as onKeyDown on the group element",
  },
  "behavior.selection": {
    order: 9,
    how: "Salt only. The group owns the value and a card only mirrors it into aria-checked: multi-select toggles membership in an array, single-select replaces the value and fires the change only when it actually changed. The tab-stop regime reads the same state, which is why a single-select group has exactly one tab stop and a multi-select group has one per card.",
    symbol: "if (!config.selection || v === undefined) return",
    where: "select() in CardGroup(); read back through group.isSelected() in Card()",
  },
}

/* ---------------------------------------------------------------------
 * THE DIALOG TRAP, checked mechanically.
 * docs/DIALOG-MATRIX.md's closing section: two behaviour rows were
 * implemented, cited, and passed this gate — and never ran, because their
 * useEffect read a ref to a node that renders one tick later and the
 * dependency array omitted the state gating that node. This block asserts
 * that every ref-reading effect in the skeleton names its gate.
 * ------------------------------------------------------------------- */
const REF_EFFECT_GUARDS = [
  {
    name: "group element collection (reads groupRef, queries its card children)",
    deps: "[children]",
    gate: "children — the cards ARE the nodes it queries, so one added, removed or disabled must re-run the query or the arrow ring and the roving tab stop both go stale. Salt's own effect has the same single dependency and its own comment saying why.",
  },
  {
    name: "focusable-descendant measurement (reads rootRef, queries the sections)",
    deps: "[interaction, sectioned, config.header, content, footer, action, title, description]",
    gate: "the props that decide which section nodes are rendered at all, plus interaction — which swaps the element the ref points at from a <div> to an <a>. A card that grows a footer, or turns into a link, mounts different nodes one render later; an effect omitting them would answer once against the old tree and never again.",
  },
]

// ---------------------------------------------------------------------

const template = JSON.parse(readFileSync(join(ROOT, "contract/templates/card.template.json"), "utf8"))
const source = readFileSync(join(ROOT, SKELETON), "utf8")

const behaviorRows = template.rows.filter((r) => r.piece === "behavior")
const failures = []
const lines = []

lines.push(`card behaviour self-check — ${behaviorRows.length} behavior rows in card.template.json`)
lines.push("")

if (behaviorRows.length === 0) {
  // The deliverable is explicit: if card genuinely had no behaviour rows
  // beyond static ones, say so here rather than skipping the gate.
  lines.push(
    "  NO BEHAVIOUR ROWS — card would be a purely static surface and this gate would have nothing to prove.",
  )
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
    failures.push(`checklist entry '${id}' has no matching behavior row in card.template.json (stale checklist)`)
  }
}

// the dialog trap, checked mechanically
lines.push("")
lines.push("ref-reading effects and their gating state (docs/DIALOG-MATRIX.md closing correction):")
for (const guard of REF_EFFECT_GUARDS) {
  if (!source.includes(guard.deps)) {
    failures.push(
      `ref-effect guard: dependency array ${guard.deps} not found in ${SKELETON} — the ${guard.name} effect may no longer list its gating state (${guard.gate}). An effect that reads a ref to a conditionally-rendered node and omits that node's gate runs once against null and never again.`,
    )
    lines.push(`  FAIL ${guard.name}`)
    lines.push(`         expected deps ${guard.deps} — NOT FOUND`)
  } else {
    lines.push(`  ok   ${guard.name}`)
    lines.push(`         deps ${guard.deps}`)
    lines.push(`         gate: ${guard.gate}`)
  }
}

lines.push("")
lines.push(
  failures.length
    ? `FAIL — ${failures.length} problem(s):\n  ${failures.join("\n  ")}`
    : `OK — every behavior row is implemented in ${SKELETON} and wired to its row, and every ref-reading effect names its gating state.`,
)
lines.push("")
lines.push(
  "NOTE, AND IT IS THE SAME NOTE check-dialog-behavior.mjs AND check-tabs-behavior.mjs PRINT: this gate proves the code EXISTS and is bound to its row. It does NOT prove the code RUNS, and it does not prove the code is CORRECT. Dialog shipped two behaviour effects that were correctly written, correctly cited, passed this exact gate, and never executed — a useEffect read a ref to a node that renders one tick later and the dependency array omitted the gating state. The ref-effect block above is a direct response to that failure, but it only checks that a dependency array LOOKS right; it cannot observe a render. A real conformance harness would drive the skeleton in a DOM and assert observable behaviour — that a link card activates on Enter and NOT on Space while an interactable card activates on both, that a single-select group has exactly one tab stop and a multi-select group has one per card, that arrowing a single-select group selects as it moves and arrowing a multi-select group does nothing, that a disabled card has no click handler and cannot be reached by arrow keys, and that the pressed flag clears. ONE ENVIRONMENT CAVEAT FOR WHOEVER DRIVES IT (docs/TABS-MATRIX.md's validation pass): in a hidden/background tab document.activeElement updates on a programmatic .focus() but the focus EVENT is suppressed, so this component's focus-visible ring — and therefore style.surface.focus and style.state-layer.opacity@focus in every column — must be exercised with a synthetic bubbling `focusin`, or the environment manufactures a convincing false negative. That remains the outstanding half. Logged for the owner alongside docs/SELECT-MATRIX.md findings 13-16.",
)

console.log(lines.join("\n"))
process.exit(failures.length ? 1 : 0)
