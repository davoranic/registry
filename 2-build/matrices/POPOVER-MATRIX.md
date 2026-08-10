# Popover — component template matrix

Component 21 of the pipeline (button, calendar, spinner, tooltip, alert,
input, select, dialog, tabs, card, badge, progress, chip, checkbox, switch,
radio-group, slider, toast, dropdown-menu, accordion came before). Canonical
id `popover`, matching `1-intro/content/04-component-map.md`'s Overlays row:
`| popover | ✓ | ✓ overlay | — (menu/tooltip cover this) |` — shadcn and
Salt both have it, M3 does not.

## 0 · Scope

**What "popover" means, and why it is a THIRD, separate component from
`dropdown-menu` and `tooltip` rather than a variant of either** — the
question this scope note exists to answer:

- **vs. `tooltip`**: a tooltip is non-interactive (its content cannot be
  focused or clicked through), opens on HOVER/FOCUS, and dismisses the
  instant the trigger loses hover/focus. A popover opens on CLICK, holds
  content that is fully interactive (forms, buttons, checkboxes — Salt's
  own `overlay.stories.tsx` nests a real `Tooltip`, a real `CheckboxGroup`,
  and a real `Button` inside an `Overlay`), and stays open until explicitly
  dismissed (Escape, an outside click, or its own close control). TOOLTIP-
  MATRIX.md's own scope note draws exactly this line in its final sentence
  without a component to put on the other side of it; this is that
  component.
- **vs. `dropdown-menu`**: a dropdown-menu holds a FIXED list of ACTION
  items (`role="menuitem"`, arrow-key roving focus between them, Enter/
  Space activates and closes the whole stack). A popover holds ARBITRARY
  consumer content with no item-list semantics at all — `role="dialog"`,
  not `role="menu"`; no roving focus; nothing to "activate". Confirmed from
  both real sources: Salt's `Overlay` composes `useRole(context, { role:
  "dialog" })`, never `"menu"`; shadcn's canonical `Popover` accepts
  arbitrary `children` (its own demo nests `Label`/`Input` form controls,
  not a list of clickable rows).

**What "popover" means per system**, confirmed by reading each clone, not
assumed from the prompt's secondhand summary:

- **shadcn**: `apps/v4/registry/new-york-v4/ui/popover.tsx` — SIX exported
  parts (`Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`,
  `PopoverHeader`, `PopoverTitle`, `PopoverDescription`), every one a thin
  `data-slot`-tagging wrapper around `radix-ui`'s `Popover` primitive.
  **`radix-ui` is an external, unvendored npm dependency**
  (`apps/v4/package.json:80`, `"radix-ui": "^1.4.3"`, no `node_modules/
  radix-ui` anywhere under `3-source/`) — the same external-package
  boundary DROPDOWN-MENU-MATRIX.md/ACCORDION-MATRIX.md/TOAST-MATRIX.md
  already recorded for their own shadcn columns. This column is genuinely
  RICHER in structure than dropdown-menu's or tooltip's own shadcn columns:
  it ships dedicated `PopoverHeader`/`PopoverTitle`/`PopoverDescription`
  sub-components — the same family shadcn's own `Dialog` has — a
  structural family neither of those two prior components' shadcn columns
  needed. Every STYLE cell is real, sourced from the wrapper's own literal
  `className` strings; every BEHAVIOR cell is `[R]` unless independently
  confirmable from the wrapper file itself, matching the established
  citation convention for this external-package boundary.
- **Salt**: `packages/core/src/overlay/` — SEVEN real, live files
  (`Overlay`, `OverlayContext`, `OverlayTrigger`, `OverlayPanel`,
  `OverlayHeader`, `OverlayPanelContent`, `OverlayPanelCloseButton`), read
  in full, not assumed from the directory listing. Confirmed relationship:
  **`Overlay` is a headless context PROVIDER** (owns `openState` via
  `useControlled`, composes `useFloatingUI` + floating-ui's own
  `useClick`/`useDismiss`/`useRole`, and hands the result down through
  `OverlayContext`) — it renders no DOM of its own, only `children`.
  **`OverlayTrigger` clones its child** and merges the reference props onto
  it (the exact technique tooltip.tsx already reproduces for its own
  trigger). **`OverlayPanel` is the actual floating DOM node** — `role`
  comes from `Overlay`'s own `useRole` (see Finding 2), it always renders a
  `FloatingArrow`, and it passes `focusManagerProps` to floating-ui's
  `FloatingFocusManager`. **`OverlayHeader`/`OverlayPanelContent`/
  `OverlayPanelCloseButton`** are three further real, OPT-IN composed
  parts, each independently confirmed present or absent by reading its own
  file, not inferred from the folder name.
- **M3**: a CONFIRMED, TOTAL ABSENCE — the same shape ACCORDION-MATRIX.md's
  own M3 column established, not an edition gap (alert/progress/spinner's
  shape, where SOME tokens survive a version pin but not all) and not a
  tokens-only component (toast/snackbar's shape, where a real token family
  exists with no live component to read). Checked two ways per CLAUDE.md
  rule 7 ("grep returning nothing is not evidence of absence"): (1)
  `grep -rli "popover"` across the WHOLE clone returns exactly TWO files,
  both documentation ASSETS for the MENU component's own usage guidance —
  `docs/components/images/menu/usage-popover.webp` and `docs/components/
  figures/menu/usage-popover.html` — neither a component nor a token file;
  (2) a `find -maxdepth 1 -type d` top-level directory listing of the whole
  clone (button, catalog, checkbox, chips, color, dialog, divider,
  elevation, fab, field, focus, icon, iconbutton, internal, labs, list,
  menu, migrations, progress, radio, ripple, sass, scripts, select, slider,
  switch, tabs, testing, textfield, tokens, types, typography) shows no
  popover-, flyout-, or bubble-shaped entry among them. `04-component-map.md`'s
  own note ("menu/tooltip cover this") is a USE-CASE justification for why
  M3 designers apparently don't need a dedicated popover pattern, not a
  token family this template could cite — it gives this column nothing to
  point to beyond the same confirmed absence. See Finding 1 for what that
  forces on every row's policy.

**IN SCOPE**: trigger (clones consumer content), an optional separate
anchor (shadcn only), the popup itself, an optional arrow, an optional
header region (title + description + actions), an optional dedicated close
button, an optional dedicated scrollable content wrapper, and — the
sharpest structural finding this component produced — an optional MODAL
focus trap (Finding 2).

**OUT OF SCOPE, with a structural reason**: `hover-card`
(`04-component-map.md`'s own separate row, "✓ | — | ✓ rich-tooltip
(closest)") — a hover-triggered, non-interactive-until-hovered preview
card, closer in trigger mechanics to tooltip than to this click-triggered,
fully-interactive component; a future component in its own right, not
folded in here. Salt's `Toggletip` (TOOLTIP-MATRIX.md already excluded it
from `tooltip`'s own scope for the identical reason: click-activated,
persists until dismissed) is likewise NOT folded into `popover` — grepped
specifically before excluding: `Toggletip`'s own real API
(`ToggletipTrigger`/`ToggletipPanel`) is a materially smaller surface than
`Overlay`'s own (no header/content-wrapper/close-button family at all,
confirmed by reading `packages/core/src/toggletip/` far enough to check the
boundary), closer in scope to a small annotation bubble than to this
component's real header+content+close-button richness — a future
component, not a retrofit target for this one.

## 1 · Structure

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `structure.trigger` | switchable | on — `OverlayTrigger`, clones the consumer's child and merges floating-ui's own reference props onto it [S] | on — `PopoverTrigger`, wraps/clones its child via Radix (`asChild`) [S] | off |
| `structure.anchor` | switchable | **off** — CONFIRMED ABSENT, `OverlayTrigger` IS both the reference and the trigger in one; no separate anchor concept exists anywhere in `packages/core/src/overlay/` [S, confirmed absent] | on — `PopoverAnchor`, a real, dedicated exported part [S] | off |
| `structure.popup` | switchable | on — `OverlayPanel`, `role="dialog"` (via `Overlay`'s own `useRole`) [S] | on — `PopoverContent`, portalled [S] | off |
| `structure.arrow` | switchable | on — `OverlayPanel.tsx` renders `FloatingArrow` UNCONDITIONALLY, not opt-in the way tooltip's Salt column gates it with `hideArrow` [S] | **off** — CONFIRMED ABSENT, grepped `popover.tsx` and every example/demo file under `examples/{aria,base,radix}/popover-*.tsx`: no `PopoverPrimitive.Arrow` anywhere [S, confirmed absent] | off |
| `structure.header` | switchable | on — `OverlayHeader`, real, opt-in composed part [S] | on — `PopoverHeader`, real, exported part [S] | off |
| `structure.title` | switchable | on — `OverlayHeader`'s own `header` prop, rendered as `<H2 styleAs="h4">` [S] | on — `PopoverTitle` [S] | off |
| `structure.description` | switchable | on — `OverlayHeader`'s own `description` prop [S] | on — `PopoverDescription` [S] | off |
| `structure.header-actions` | switchable | on — `OverlayHeader`'s own `actions` prop, a real, dedicated `actionsContainer` div [S] | **off** — CONFIRMED ABSENT, `PopoverHeader`'s own className carries no trailing/actions slot of any kind, unlike shadcn's own `DialogHeader` [S, confirmed absent] | off |
| `structure.close-button` | switchable | on — `OverlayPanelCloseButton`, a real, dedicated, opt-in composed `Button` [S] | **off** — CONFIRMED ABSENT, no `PopoverClose`-equivalent part is exported or composed anywhere, a real, structural CONTRAST with shadcn's OWN `Dialog` (which DOES export `DialogClose`) [S, confirmed absent — see Finding 3] | off |
| `structure.content` | switchable | on — `OverlayPanelContent`, a real part with its own scroll-shadow state classes [S] | **off** — CONFIRMED ABSENT, `PopoverContent` IS the content container itself, no separate inner wrapper [S, confirmed absent] | off |

**`check-anatomy.mjs` reports `popover 10 parts · 0 shared · 5 system-unique`**
(`only salt: arrow, header-actions, close-button, content`; `only shadcn:
anchor`) — the same "0 shared" SHAPE accordion's own anatomy result had,
for the same reason: M3 supplies zero parts to share with anyone (see
Finding 1). This is a genuine first for a component where BOTH real
systems (not just one) contribute system-unique parts on top of that —
Salt owns four, shadcn owns one — a real, asymmetric divergence, not a
retrofit signal.

## 2 · Behavior

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `behavior.trigger-interaction` | switchable | click — `useClick(context)` [S] | click [R] — Radix Trigger's own documented default | off |
| `behavior.role` | switchable | `role="dialog"` — `Overlay.tsx`'s own `useRole(context, { role: "dialog" })` [S] | `role="dialog"` [R] — Radix's own documented convention for `Popover.Content`. A real CONVERGENCE, see Finding 4 | off |
| `behavior.modal-focus-trap` | switchable | **on** — `OverlayPanel.tsx` passes `focusManagerProps={{ context, outsideElementsInert: true }}`, `FloatingFocusManager`'s own default `modal: true` not overridden [S] | **off** — Radix's own documented `Popover.Root` `modal` prop defaults to `false` [R] | off |
| `behavior.initial-focus` | switchable | panel itself, `FloatingFocusManager`'s own default `initialFocus=0` [S] | content root, Radix's own documented convention [R] | off |
| `behavior.dismiss-outside` | switchable | `useDismiss(context)`, floating-ui's own default `outsidePress: true` [S] | Radix's `DismissableLayer` [R] | off |
| `behavior.dismiss-escape` | switchable | `useDismiss(context)`'s own default `escapeKey: true` [S] | [R] | off |
| `behavior.focus-return` | switchable | `FloatingFocusManager`'s own default `returnFocus: true` [S] | [R], general APG/Radix convention | off |
| `behavior.close-button-action` | switchable | **off** as an AUTOMATIC wiring — CONFIRMED, `OverlayPanelCloseButton.tsx` has no `useOverlayContext()` call, every real usage wires `onClick` BY HAND [S, confirmed] — see Finding 3 | off, no close-button part to wire | off |
| `behavior.positioning-engine` | switchable | `@floating-ui/react`: `offset(11)`, `flip()`, `shift({limiter:limitShift()})`, `arrow()` [S] | Radix's own `Popper` primitive (external, unvendored) [R] | [R], not sourced |

**`behavior.role`'s `role="dialog"` on the identical string in both real
columns is a genuine CONVERGENCE**, per rule 7 ("an unexplained convergence
is the shape rule 1 forbids", explained here so it is not one) — see
Finding 4.

## 3 · Prop

| row | policy | note |
|---|---|---|
| `prop.placement` | switchable | Salt: `Overlay`'s own `placement?: "top"\|"bottom"\|"left"\|"right"`, default `"top"` [S] — the SAME 4-cardinal-only scope trim tooltip's own `prop.placement` row already used. shadcn: real, Radix's own `side` prop, `top\|right\|bottom\|left`, default `"bottom"` [S for the prop's existence; R for the literal default]. M3: off. |
| `prop.align` | switchable | shadcn only: `PopoverContent`'s own `align` prop, explicitly destructured with default `"center"` [S] — a real cross-axis concept Salt's own 4-directional `placement` has no equivalent for. Salt: off, no align/cross-axis concept anywhere in `packages/core/src/overlay/` [S, confirmed absent]. M3: off. |

## 4 · Slot

| row | note |
|---|---|
| `slot.trigger` | Consumer-owned anchor element in both real systems — Salt clones `children`; shadcn wraps/clones via Radix `asChild`. |
| `slot.title-text` | Consumer-owned heading text, where `structure.title` is on. |
| `slot.description-text` | Consumer-owned supporting text, where `structure.description` is on. |
| `slot.content` | Consumer-owned body content, ARBITRARY in both real systems — the whole reason this is a separate component from dropdown-menu's fixed action-item list. Salt's own stories nest `StackLayout`/`Checkbox`/`CheckboxGroup`/`Button` composites; shadcn's own demo nests `Label`/`Input` form controls. |
| `slot.composes` | The close button's own icon composes a future registry icon-set component; rendered as a neutral placeholder glyph here. |

## 5 · State

| row | policy | note |
|---|---|---|
| `state.closed-open` | switchable | The panel's own mounted/unmounted visual state — the only state this component's root recognises, the same invariant tooltip's own `state.closed-open` row records. |
| `state.focus-trap-active` | switchable | Only meaningful where `behavior.modal-focus-trap` is on. Salt: Tab/Shift+Tab cycle WITHIN the panel, wrapping at both ends, rest of page inert. shadcn: Tab is free to leave the panel and reach the rest of the (still-interactive) page. |

## 6 · Style — see the generated `Resolved values` block below for every
cell. Selected findings:

### Findings

1. **M3's total absence forces every row in this template to be
   `policy: "switchable"` — the same first ACCORDION-MATRIX.md's own
   Finding 1 established, now confirmed on a SECOND component.**
   `gen-from-template.py` fails the build on any `locked` row that is
   `off` for any column. Every prior component (before accordion) had at
   least one column supplying SOME real value for the component's most
   basic parts, so those rows could honestly be `locked`. Popover cannot,
   for the identical reason accordion could not: M3 is `off` on every
   single row, so nothing in this template could be `locked` without
   instantly failing the generator the moment M3's column is read.
   Consequently this template also uses ZERO `policy: "default"` rows —
   inventing a REGISTRY DEFAULT value for a system that has no popover
   CONCEPT at all would mean fabricating structure/style for M3, exactly
   what rule 1 forbids. `switchable` is the only policy this component's
   true shape permits, on BOTH components where M3 turned out to be
   totally absent so far.
2. **THE SHARPEST FINDING this component produced: Salt's real `Overlay`
   is NOT a lightweight non-modal popup the way shadcn's canonical
   Popover is — it is a real focus-trapping, page-inerting overlay.**
   `Overlay.tsx`'s own `useRole(context, { role: "dialog" })` was the
   first hint (see Finding 4); reading `OverlayPanel.tsx` in full confirms
   it structurally: `focusManagerProps={{ context, outsideElementsInert:
   true }}` is passed to floating-ui's `FloatingFocusManager`, and that
   component's OWN default `modal` option is `true` — Salt's file does
   not override it, so the default applies. `outsideElementsInert: true`
   is passed EXPLICITLY (not merely relying on the modal default), a real,
   deliberate emphasis in the source, not an accident of not specifying
   `modal: false`. The practical effect: opening a Salt `Overlay` traps
   Tab focus inside the panel (wrapping at both ends) and marks the rest
   of the page `inert` (unreachable to pointer, keyboard, and the
   accessibility tree) — functionally identical to a non-full-screen
   MODAL DIALOG, not a "click elsewhere to dismiss and keep working" popup.
   shadcn's canonical `Popover`, by contrast, composes Radix's `Popover`
   primitive whose own documented `modal` prop defaults to `false`: no
   focus trap, no background suppression, the rest of the page stays
   fully interactive and reachable by Tab while the popover is open. This
   is modelled as `behavior.modal-focus-trap`, a real, config-gated
   STRUCTURAL divergence (`skeleton/popover.tsx` reuses dialog.tsx's own
   proven `suppressBackground()`/Tab-wrap mechanisms, gated on
   `config.modalFocusTrap`), not a style deviation — the same seriousness
   TOOLTIP-MATRIX.md's own arrow-shape finding gave a purely visual
   divergence, here applied to a BEHAVIOURAL one.
3. **Salt's own real close button requires the CONSUMER to wire it by
   hand — CONFIRMED by reading the file, not assumed from the name.**
   `OverlayPanelCloseButton.tsx` is a plain styled `Button` with no
   `useOverlayContext()` call and no built-in `onClick` handler of its
   own. Every real usage in `overlay.stories.tsx` (`CloseButton`,
   `LongContent`, `WithActions`) wires `onClick={() => setOpen(false)}`
   BY HAND at the call site — the component itself does nothing when
   clicked unless the consumer adds that wiring. This chassis, as the
   union component that already owns its own open state (unlike Salt's
   `Overlay`, which is a headless context provider with no rendering of
   its own), completes this real, confirmed gap by wiring its own
   built-in close button directly to its internal `close()` function — a
   deliberate, LABELLED registry completion (`behavior.close-button-
   action`'s own row note states this explicitly), not a silent liberty.
   This is also the sharpest reason `structure.close-button` is a real,
   structural CONTRAST between shadcn's Popover and shadcn's OWN Dialog:
   `Dialog` exports a `DialogClose` part; `Popover` exports nothing
   equivalent at all, confirmed by reading `popover.tsx` in full.
4. **`behavior.role`'s `role="dialog"` convergence is a genuine, but
   DIFFERENT, three-way-role finding from the two this pipeline has
   already recorded** (spinner's three-way SPLIT, tooltip's three-way
   `role="tooltip"` AGREEMENT). Here it is a TWO-way agreement (M3 has no
   role to contribute at all) on a role NEITHER of dropdown-menu's
   (`"menu"`) nor tooltip's (`"tooltip"`) own convergence used — `"dialog"`,
   the ARIA role a popover-shaped floating panel with interactive,
   arbitrary content actually calls for per both systems' own independent
   choices (Salt: a literal `useRole` call; shadcn: Radix's own
   documented convention for exactly this component). Worth recording
   precisely because it demonstrates the convergence pattern generalises
   past the two roles this pipeline had already seen, not because the
   SAME role recurred.
5. **shadcn's popup root sets NO font-size utility of any kind — a real,
   sourced CONTRAST with both dropdown-menu's and tooltip's own shadcn
   root text sizing.** `PopoverContent`'s own className string (`z-50
   w-72 ... rounded-md border bg-popover p-4 text-popover-foreground
   shadow-md outline-hidden ...`) has no `text-sm`/`text-xs`/any size
   utility — every prior shadcn column's own root/item text in this
   pipeline set SOME explicit size class. Children choose their own type
   entirely (the demo's own paragraph sets `text-sm` itself). Modelled as
   `style.popup.font` CONFIRMED OFF for shadcn, not silently defaulted to
   a plausible-looking size.
6. **A genuine, structural width contrast: Salt's popup is CONTENT-SIZED,
   shadcn's is a FIXED default.** `OverlayPanel.css`'s own literal `width:
   max-content` gives Salt's popup no cap of any kind — it grows and
   shrinks with its content. shadcn's `PopoverContent` carries `w-72` =
   288px, a FIXED width applied regardless of content (though real demo
   files DO override it per-instance with e.g. `className="w-80"`,
   confirming it is a real, overridable DEFAULT, not a hard cap). Modelled
   as `style.popup.width`, two structurally different sizing STRATEGIES,
   not one value with a numeric delta.
7. **Salt's padding lives on a DIFFERENT part than shadcn's — relocated,
   not missing.** Salt's `OverlayPanel.css` (the popup ROOT) sets NO
   padding of its own; the real padding (`spacing-100`, by density) lives
   one level down, on `OverlayPanelContent` (`structure.content`, opt-in).
   shadcn has no separate content wrapper at all (`structure.content` is
   confirmed off for that column — see structure row), so its real `p-4`
   padding lands DIRECTLY on the popup root instead. `style.popup.padding`
   is therefore CONFIRMED OFF for Salt (not a gap — the value is real,
   just one part further down, see `style.content.padding`) while
   `style.content.padding` is CONFIRMED OFF for shadcn (the part it would
   live on does not exist for that column). Neither column is missing a
   value; each column's real value sits on a different part of the same
   template.
8. **Salt genuinely animates the popup's entrance; the plain tooltip's
   Salt column genuinely does not — a real, sourced CONTRAST between two
   Salt columns this pipeline has now built, not a contradiction.**
   `OverlayPanelContent.css`'s own `animation: var(--salt-animation-fade-
   in-center)` resolves to a real, TOKENIZED `fade-in-center 300ms ease-
   in-out` (`foundations/animation.css`'s own `--salt-animation-duration`
   -> `--salt-duration-perceptible` = 300ms). TOOLTIP-MATRIX.md's own
   Finding 3 recorded the OPPOSITE for the plain tooltip: `Tooltip.css`
   defines ZERO `animation`/`transition` rules at all, an honest literal
   `0s`. Both are real, both are [S], and the difference is exactly what
   it looks like — two DIFFERENT Salt components, sourced independently,
   landing on genuinely different answers to "does this floating panel
   animate open".
9. **Orchestrator live-verification found a REAL geometry bug: `structure.
   close-button`'s icon (`CloseGlyph`) rendered as a giant, unconstrained
   black X filling most of the popup — the exact "structure row with no
   size" trap CLAUDE.md's own drift-taxonomy names, the same class of
   defect this pipeline has hit before.** Root cause:
   `[data-slot="popover-close-button"]` in the template's `base` block
   only ever carried `position/right/top/z-index` — no `display`, no
   explicit box model, and critically no sizing rule for the `<svg
   width="100%" height="100%">` inside it. With no definite containing
   block for those percentage dimensions, the browser fell back to the
   CSS default replaced-element intrinsic size, rendering the icon at
   roughly the popup's own full size instead of a small glyph — confirmed
   visually (a full-page screenshot showed the close icon as a large
   black shape overlapping the popup's own header/body content). Unlike
   ACCORDION-MATRIX.md Finding 9 (a padding/box-sizing floor), this was a
   plain missing-rule gap, and it existed because popover's own template
   never added the equivalent of `dialog.template.json`'s own
   `[data-slot="dialog-close"] svg { width: 1em; height: 1em }` plus
   `[data-slot="dialog-close"] { display: inline-flex; align-items:
   center; justify-content: center; ... }` base rules — dialog's close
   button already solved this exact problem and popover's own build never
   copied the pattern. Fixed by adding the equivalent base rules to
   `popover-close-button`/`popover-close-button svg`. Re-verified live:
   the close button now renders as a small, correctly centred glyph in
   the popup's top-right corner, matching Salt's own cited `top:0;
   right:0` placement, with no other regression. Worth noting for future
   gate work: `check-structure.py`'s own "structure without size" pass
   (gate B, already documented in CLAUDE.md as high-false-positive) did
   NOT flag this — a genuine miss in the opposite direction (a false
   negative), not just its usual false positives; it is not, and was
   never claimed to be, a substitute for a real render.
10. **Orchestrator live-verification found and fixed a real
    `behavior.focus-return` bug: closing the popup left real DOM focus on
    `<body>` instead of the trigger, in all three columns.** Root cause,
    confirmed by isolated reproduction: the skeleton's own
    `behavior.focus-return` mechanism faithfully mirrors floating-ui's
    real `FloatingFocusManager`'s `returnFocus: true` default (restore
    whatever had focus immediately before open, cited [S] in this doc's
    own row) — but that captured "previous focus" is only meaningful if
    something other than `<body>` actually held it at that moment. A
    plain `element.click()` DOM-API call (used both by this project's own
    `harness/conformance.tsx` test and by Safari's real, well-documented
    mouse-click-doesn't-focus-buttons quirk) does NOT move real focus onto
    the clicked element the way an actual user click or a keyboard
    Enter/Space activation does — confirmed directly: `document.
    activeElement` after a bare `button.click()` in a fresh Chromium page
    stayed `<body>`, not the button. So `returnFocusRef.current` was
    capturing `<body>` and later calling `.focus()` on it, a no-op, which
    left focus stranded wherever the popup's own DOM removal had already
    auto-blurred it to (`<body>`, the browser's own behavior when a
    focused node is unmounted). Fixed in `skeleton/popover.tsx`'s
    initial-focus effect by falling back to `triggerRef.current` whenever
    the captured "previous" active element is `<body>` (or not an
    `HTMLElement`) — this preserves the cited library semantic for the
    common case (a real click or keyboard activation DOES focus the
    trigger first, so the fallback is a no-op then) while fixing both the
    test-harness artifact and the real Safari edge case it happens to
    share a shape with. Re-verified live: focus now correctly returns to
    the trigger after Escape in all three columns; conformance went from
    221/224 to 224/224.

Both findings 9 and 10 were caught ONLY by driving the built harness in a
real browser — neither gate (`check-structure.py`'s size check, nor the
building agent's own static code review, which explicitly flagged its own
lack of browser access as a known limitation) could have found either one.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/popover.template.json` against every system, read from `columns/popover.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 5 light, 5 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `popup-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | **no** |
| `popup-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `popup-border` | rgba(0, 0, 0, 0.3) | rgba(255, 255, 255, 0.3) | yes |
| `popup-shadow` | 0 6px 10px 0 rgba(0,0,0,0.2) | 0 6px 10px 0 rgba(0,0,0,0.55) | yes |
| `header-desc-fg` | rgb(76, 81, 87) | rgb(177, 181, 185) | yes |

**shadcn** — 6 light, 4 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `popup-bg` | oklch(1 0 0) | oklch(0.205 0 0) | **no** |
| `popup-fg` | oklch(0% 0 0) | oklch(0.985 0 0) | **no** |
| `popup-border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `popup-shadow` | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | — | yes |
| `radius-popup` | calc(0.625rem * 0.8) | — | **no** |
| `fg-muted` | oklch(0.556 0 0) | oklch(0.708 0 0) | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.trigger` | structure | switchable | `True` | `True` | **off** |
| 2 | `structure.anchor` | structure | switchable | **off** | `True` | **off** |
| 3 | `structure.popup` | structure | switchable | `True` | `True` | **off** |
| 4 | `structure.arrow` | structure | switchable | `True` | **off** | **off** |
| 5 | `structure.header` | structure | switchable | `True` | `True` | **off** |
| 6 | `structure.title` | structure | switchable | `True` | `True` | **off** |
| 7 | `structure.description` | structure | switchable | `True` | `True` | **off** |
| 8 | `structure.header-actions` | structure | switchable | `True` | **off** | **off** |
| 9 | `structure.close-button` | structure | switchable | `True` | **off** | **off** |
| 10 | `structure.content` | structure | switchable | `True` | **off** | **off** |
| 11 | `behavior.trigger-interaction` | behavior | switchable | `True` | `True` | **off** |
| 12 | `behavior.role` | behavior | switchable | `dialog` | `dialog` | **off** |
| 13 | `behavior.modal-focus-trap` | behavior | switchable | `True` | **off** | **off** |
| 14 | `behavior.initial-focus` | behavior | switchable | `panel itself (FloatingFocusManager default initialFocus=0)` | `content root focuses on open (Radix's own documented default)` | **off** |
| 15 | `behavior.dismiss-outside` | behavior | switchable | `True` | `True` | **off** |
| 16 | `behavior.dismiss-escape` | behavior | switchable | `True` | `True` | **off** |
| 17 | `behavior.focus-return` | behavior | switchable | `True` | `True` | **off** |
| 18 | `behavior.close-button-action` | behavior | switchable | **off** | **off** | **off** |
| 19 | `behavior.positioning-engine` | behavior | switchable | `@floating-ui/react: offset(11), flip(), shift({limiter:limitShift()}), arrow()` | `Radix's own Popper primitive (external, unvendored)` | **off** |
| 20 | `prop.placement` | prop | switchable | `top, bottom, left, right` | `top, right, bottom, left` | **off** |
| 21 | `prop.align` | prop | switchable | **off** | `start, center, end` | **off** |
| 22 | `slot.trigger` | slot | switchable | — | — | — |
| 23 | `slot.title-text` | slot | switchable | — | — | — |
| 24 | `slot.description-text` | slot | switchable | — | — | — |
| 25 | `slot.content` | slot | switchable | — | — | — |
| 26 | `slot.composes` | slot | switchable | — | — | — |
| 27 | `state.closed-open` | state | switchable | — | — | — |
| 28 | `state.focus-trap-active` | state | switchable | — | — | — |
| 29 | `style.popup.background` | style | switchable | ⟡ `popup-bg` | ⟡ `popup-bg` | **off** |
| 30 | `style.popup.color` | style | switchable | ⟡ `popup-fg` | ⟡ `popup-fg` | **off** |
| 31 | `style.popup.border` | style | switchable | `border: 1px solid var(--popup-border)` | `border: 1px solid var(--popup-border)` | **off** |
| 32 | `style.popup.shape` | style | switchable | ⟡ `popup-shape` | ⟡ `radius-popup` | **off** |
| 33 | `style.popup.shadow` | style | switchable | ⟡ `popup-shadow` | ⟡ `popup-shadow` | **off** |
| 34 | `style.popup.width` | style | switchable | `max-content` | `288px` | **off** |
| 35 | `style.popup.font` | style | switchable | ⟡ `type-body` | **off** | **off** |
| 36 | `style.popup.z-index` | style | switchable | `1500` | `50` | **off** |
| 37 | `style.popup.outline@focus` | style | switchable | **off** | `none` | **off** |
| 38 | `style.popup.entrance-transition` | style | switchable | `fade-in-center 300ms ease-in-out` | `fade-in-and-zoom-in 150ms ease-out` | **off** |
| 39 | `style.popup.padding` | style | switchable | **off** | `16px` | **off** |
| 40 | `style.content.padding` | style | switchable | ⟡ `content-padding` | **off** | **off** |
| 41 | `style.arrow.size` | style | switchable | `width: 12px; height: 6px` | **off** | **off** |
| 42 | `style.arrow.color` | style | switchable | `fill: var(--popup-bg); stroke: var(--popup-border); stroke-width: 1px` | **off** | **off** |
| 43 | `style.header.padding` | style | switchable | ⟡ `header-padding` | **off** | **off** |
| 44 | `style.header.gap` | style | switchable | ⟡ `header-gap` | `4px` | **off** |
| 45 | `style.title.font` | style | switchable | `font: var(--type-h4)` | `font-weight: 500` | **off** |
| 46 | `style.description.color` | style | switchable | ⟡ `header-desc-fg` | ⟡ `fg-muted` | **off** |
| 47 | `style.description.font` | style | switchable | ⟡ `type-body` | `400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif` | **off** |
| 48 | `style.close-button.position` | style | switchable | `position: absolute; right: 0; top: 0; z-index: 1` | **off** | **off** |

<details><summary>Citations — 108 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.trigger` | salt | OverlayTrigger clones the consumer's child and merges floating-ui's own reference props onto it |
| `structure.trigger` | shadcn | PopoverTrigger |
| `structure.trigger` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.anchor` | salt | CONFIRMED ABSENT — OverlayTrigger IS both the reference and the trigger in one; no separate anchor concept exists anywhere in packages/core/src/overlay/ |
| `structure.anchor` | shadcn | PopoverAnchor, a real, dedicated exported part |
| `structure.anchor` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.popup` | salt | OverlayPanel, role="dialog" (via Overlay's own useRole) |
| `structure.popup` | shadcn | PopoverContent, portalled |
| `structure.popup` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.arrow` | salt | OverlayPanel.tsx renders FloatingArrow UNCONDITIONALLY, not opt-in |
| `structure.arrow` | shadcn | CONFIRMED ABSENT — see arrow-off provenance |
| `structure.arrow` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.header` | salt | OverlayHeader, real, opt-in composed part |
| `structure.header` | shadcn | PopoverHeader |
| `structure.header` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.title` | salt | OverlayHeader's own header prop, rendered as <H2 styleAs="h4"> |
| `structure.title` | shadcn | PopoverTitle |
| `structure.title` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.description` | salt | OverlayHeader's own description prop, rendered via <Text color="secondary"> |
| `structure.description` | shadcn | PopoverDescription |
| `structure.description` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.header-actions` | salt | OverlayHeader's own actions prop, a real, dedicated actionsContainer div |
| `structure.header-actions` | shadcn | CONFIRMED ABSENT — see header-actions-off provenance |
| `structure.header-actions` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.close-button` | salt | OverlayPanelCloseButton, a real, dedicated, opt-in composed Button |
| `structure.close-button` | shadcn | CONFIRMED ABSENT — see close-button-off provenance |
| `structure.close-button` | m3 | CONFIRMED ABSENT — see total-absence |
| `structure.content` | salt | OverlayPanelContent, a real part with its own scroll-shadow state classes |
| `structure.content` | shadcn | CONFIRMED ABSENT — see content-off provenance |
| `structure.content` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.trigger-interaction` | salt | useClick(context) |
| `behavior.trigger-interaction` | shadcn | [R] — external package, Radix Trigger's own documented click default |
| `behavior.trigger-interaction` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.role` | salt | Overlay.tsx's own useRole(context, { role: "dialog" }) |
| `behavior.role` | shadcn | [R] — Radix's own documented convention for Popover.Content |
| `behavior.role` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.modal-focus-trap` | salt | OverlayPanel.tsx: focusManagerProps={{ context, outsideElementsInert: true }}, FloatingFocusManager's own default modal:true not overridden — see role-dialog-and-modal-focus-trap provenance |
| `behavior.modal-focus-trap` | shadcn | CONFIRMED OFF — see modal-focus-trap-off provenance |
| `behavior.modal-focus-trap` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.initial-focus` | salt | OverlayPanel.tsx passes no initialFocus override |
| `behavior.initial-focus` | shadcn | [R] |
| `behavior.initial-focus` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.dismiss-outside` | salt | useDismiss(context), floating-ui's own default outsidePress:true |
| `behavior.dismiss-outside` | shadcn | [R] — Radix's DismissableLayer |
| `behavior.dismiss-outside` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.dismiss-escape` | salt | useDismiss(context), floating-ui's own default escapeKey:true |
| `behavior.dismiss-escape` | shadcn | [R] |
| `behavior.dismiss-escape` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.focus-return` | salt | FloatingFocusManager's own default returnFocus:true, not overridden |
| `behavior.focus-return` | shadcn | [R] — general APG/Radix convention |
| `behavior.focus-return` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.close-button-action` | salt | CONFIRMED NOT AUTOMATIC — see close-button-not-automatic provenance; every real usage wires onClick to setOpen(false) by hand, the consumer's responsibility, not the component's |
| `behavior.close-button-action` | shadcn | no close-button part exists to wire — see structure.close-button |
| `behavior.close-button-action` | m3 | CONFIRMED ABSENT — see total-absence |
| `behavior.positioning-engine` | salt | Overlay.tsx middleware array |
| `behavior.positioning-engine` | shadcn | [R] |
| `behavior.positioning-engine` | m3 | CONFIRMED ABSENT — see total-absence |
| `prop.placement` | salt | Overlay.tsx's own placement prop, default "top" |
| `prop.placement` | shadcn | Radix's own `side` prop, passed through via ...props, no override in popover.tsx itself; default "bottom" [R], Radix Popper's own documented default |
| `prop.placement` | m3 | CONFIRMED ABSENT — see total-absence |
| `prop.align` | salt | CONFIRMED ABSENT — see align-off provenance |
| `prop.align` | shadcn | PopoverContent's own align prop, explicitly destructured with default "center" |
| `prop.align` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.background` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.color` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.border` | salt | OverlayPanel.css border-color: var(--overlay-borderColor) |
| `style.popup.border` | shadcn | PopoverContent's bare border utility -> --border |
| `style.popup.border` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.shape` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.shadow` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.width` | salt | OverlayPanel.css: width: max-content |
| `style.popup.width` | shadcn | class w-72 |
| `style.popup.width` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.font` | shadcn | CONFIRMED OFF — see popup-font-off provenance |
| `style.popup.font` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.z-index` | salt | OverlayPanel.css z-index: var(--saltOverlay-zIndex, var(--salt-zIndex-flyover)) |
| `style.popup.z-index` | shadcn | class z-50 |
| `style.popup.z-index` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.outline@focus` | salt | CONFIRMED OFF — see popup-outline-off provenance |
| `style.popup.outline@focus` | shadcn | approximation of Tailwind's outline-hidden utility — see popup-outline-hidden provenance |
| `style.popup.outline@focus` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.entrance-transition` | salt | OverlayPanelContent.css animation: var(--salt-animation-fade-in-center) -> foundations/animation.css: fade-in-center var(--salt-animation-duration) var(--salt-animation-timing-function) -> var(--salt-duration-perceptible)=300ms, ease-in-out |
| `style.popup.entrance-transition` | shadcn | REGISTRY RENDERING APPROXIMATION — see popup-entrance-transition provenance; tw-animate-css's real keyframe/duration isn't vendored in this clone |
| `style.popup.entrance-transition` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.popup.padding` | salt | CONFIRMED OFF at the root level — see popup-padding-off provenance; the real padding is one level down, see style.content.padding |
| `style.popup.padding` | shadcn | class p-4 |
| `style.popup.padding` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.content.padding` | shadcn | no separate content wrapper exists — see structure.content |
| `style.content.padding` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.arrow.size` | salt | OverlayPanel.tsx: <FloatingArrow height={6} width={12} strokeWidth={1} /> |
| `style.arrow.size` | shadcn | no arrow part — see structure.arrow |
| `style.arrow.size` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.arrow.color` | salt | OverlayPanel.tsx fill/stroke props |
| `style.arrow.color` | shadcn | no arrow part — see structure.arrow |
| `style.arrow.color` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.header.padding` | shadcn | CONFIRMED OFF — see header-padding-off provenance |
| `style.header.padding` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.header.gap` | shadcn | class gap-1 |
| `style.header.gap` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.title.font` | salt | H2 styleAs="h4" resolves the full h4 shorthand (weight/size/family/line-height) via the type-h4 slot |
| `style.title.font` | shadcn | class font-medium; size/family left unset — see title-font provenance |
| `style.title.font` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.description.color` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.description.font` | shadcn | inherited text-sm — see description-font provenance |
| `style.description.font` | m3 | CONFIRMED ABSENT — see total-absence |
| `style.close-button.position` | salt | OverlayPanelCloseButton.css |
| `style.close-button.position` | shadcn | no close-button part — see structure.close-button |
| `style.close-button.position` | m3 | CONFIRMED ABSENT — see total-absence |

</details>

<!-- END GENERATED VALUES -->
