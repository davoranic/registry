# Chip / tag — component template matrix

*Twelfth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs, card, badge came before).
Same method as [BADGE-MATRIX.md](BADGE-MATRIX.md) / [CARD-MATRIX.md](CARD-MATRIX.md) /
[TABS-MATRIX.md](TABS-MATRIX.md) / [DIALOG-MATRIX.md](DIALOG-MATRIX.md) /
[SELECT-MATRIX.md](SELECT-MATRIX.md): one master template (union of all six
pieces across systems), columns per design system, rows switched
on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `OFF` = row switched off in this column · `INHERIT` =
system silent, registry default applies · `[S]` = value extracted from source
this session · `[R]` = not directly sourced (reason always given).

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

**75 rows in all**: 7 structure, 7 prop, 9 behavior, 4 slot, 6 state, 42 style.
Chip has **more behaviour than any non-composite component built so far**, and
unlike badge — where six behaviour rows contained not one event handler — seven
of these nine are handlers or measurements.

**Chip is the fifth component to ship the third gate.**
`scripts/check-chip-behavior.mjs` follows `check-badge-behavior.mjs`'s contract
exactly, with the `REF_EFFECT_GUARDS` block restored to its **positive** form
(badge's was inverted because badge has no effects; chip has two, one of which
is precisely the dialog hazard), and repeats the same honest closing caveat: it
proves code **exists and is bound**, not that it **runs** or that it is
**correct**.

**The headline of this matrix.** This is the first component where **one of the
three columns has nothing in it at all**, and the first where the central
question is an **accessibility fork** rather than a styling one. shadcn/ui
ships no chip, no tag and no pill — a confirmed absence with a six-part proof,
not an unfilled column. And of the two systems that do ship one, they disagree
about whether the delete control is a **nested focusable inside a focusable**:
Salt says no and makes the whole chip the remove button; M3's spec says yes and
gives every removable chip two tab stops. Neither answer is visible in a
screenshot or in a token table.

**The second headline, and it is a naming trap.** Salt's **`Pill` is nearly
square** (`corner-weaker` → 1/2/3/4px by density) and Salt's **`Tag` is a full
999px pill** (`corner-strongest`). The names are the wrong way round, and under
`[data-corner="sharp"]` the gap *widens* to 0px against 999px, because
`corner-weaker` collapses to `curve-0` while `corner-strongest` does not.

---

## Scope note

### Resolving the badge boundary

[BADGE-MATRIX.md](BADGE-MATRIX.md)'s scope table excluded `chip`/`tag`/`pill`
and cited Salt's own `badge/usage.mdx` drawing the line three times. That
boundary **holds in both directions**, and source now states it from this side
too:

| direction | source | what it says |
|---|---|---|
| badge → chip | `site/docs/components/badge/usage.mdx` | *"To trigger an immediate action … Instead, use `Pill`"*; *"To communicate status through color, such as red/amber/green … Instead, use `Pill`"*; *"To communicate read-only metadata that categorizes or groups content … use `Tag`"* [S] |
| chip → badge | `site/docs/components/tag/usage.mdx` | *"To display counts, notifications or if you need a small, compact piece of information to be displayed inline, for example 'New'. Instead, use `Badge`"* [S] |
| pill → tag | `site/docs/components/pill/usage.mdx` | *"For labeling. Instead, use `Tag`"* [S] |
| tag → pill | `site/docs/components/tag/usage.mdx` | *"For quick filtering and selection, use `Pill`. Tags and Pills both categorize content in an app, but while Tags are read-only and simply display metadata, Pills are interactive"* [S] |

A badge is inert, single-coloured and system-driven; a chip is interactive,
selectable and user-driven. **`badge` is out of scope here for the same reason
`chip` was out of scope there**, and because it is already built with its own
template, three columns, skeleton and behaviour gate.

### Salt ships BOTH, and source names the canonical one itself

The brief asked whether Salt also ships a separate `tag`, and it does:
`packages/core/src/pill/` (8 files) and `packages/core/src/tag/` (3 files).

**`Pill` is canonical, and Salt says so literally.**
`site/docs/components/pill/index.mdx` declares
`alsoKnownAs: ["Chip", "Badge"]` — **Salt itself calls a Pill a Chip** [S].
`tag/index.mdx` declares `alsoKnownAs: []`. That is not an inference; it is a
field in the source.

**`Tag` is not dropped — it is the `static` value of `prop.interaction`**,
because `docs/COMPONENTS.md` line 111 puts both on ONE canonical row
(`| tag / pill | — (badge) | ✓ tag, pill | ✓ chip family |`), and dropping it
would have dropped half a declared row. This is exactly the treatment
CARD-MATRIX.md gave `Card` / `InteractableCard` / `LinkCard`: three exports,
one row, one `prop.interaction` axis with a real element branch. The two are
genuinely different objects — different element (`<button>` vs `<div>`),
different radius, different padding, different colour family, no shared state —
which is why the whole static reading is carried in **one** gated block,
`style.chip.tag-rest`, rather than smeared across the state rows.

### shadcn: CONFIRMED ABSENCE for the whole column

**shadcn/ui ships no chip, no tag and no pill.** Six independent checks, and
`themes/columns/chip.shadcn.json` carries all of them on the cells:

1. **Directory listing.** `ls apps/v4/registry/new-york-v4/ui/` → 63 files. No
   `chip.tsx`, no `tag.tsx`, no `pill.tsx`.
2. **Filename search over the whole clone.**
   `find ui -not -path '*/node_modules/*' \( -iname '*chip*' -o -iname '*pill*' -o -iname '*tag*.tsx' \)`
   → **nothing**.
3. **Every `chip` string in `apps/v4`, classified.** Four kinds of hit and no
   fifth: `combobox.tsx`'s `ComboboxChips` / `ComboboxChip` / `ComboboxChipsInput`
   / `ComboboxChipRemove` (rendering Base UI's `ComboboxPrimitive.Chip`); the
   same three exports in `registry/bases/{radix,base,aria}/ui/combobox.tsx` and
   their `assign-issue.tsx` consumer; eight `registry/styles/style-*.css` files
   carrying `.cn-combobox-chip`; and the word **"microchip"** inside
   lorem-ipsum task titles in `app/(app)/examples/tasks/data/tasks.json`.
4. **Docs.** No `chip.mdx`, `tag.mdx` or `pill.mdx` in any of the three docs
   bases. The only page containing "chip" is `combobox.mdx`.
5. **shadcn's own machine-readable index.** `grep -c 'chip\|pill' _registry.ts`
   → **0**.
6. **Lesson 11.** `file apps/v4/registry/new-york-v4/ui/*.tsx` reports every one
   of the 63 files as text. The empty greps above are therefore *evidence*, not
   a repeat of the NUL byte that made `skeleton/card.tsx` invisible to grep.

**Corroborated independently**: `docs/COMPONENTS.md` line 111 already prints a
dash in shadcn's cell, written in phase 1 from a separate pass. Two passes, one
answer.

**Badge was NOT substituted.** Taking `badge.tsx` would be a rule-1 retrofit
*and* a double-count of an already-built component, and the two systems' own
docs put them on opposite sides of the same line (above). Every shadcn cell is
`off` with a citation; the seven **locked** rows carry a `value` reading
"NO COMPONENT — …" rather than `off`, because a locked row means the question
must be *answered*, and "there is no component" is an answer with evidence.

Recorded so the absence is understood rather than merely stated: shadcn covers
this space with **three** components on three other rows — `toggle`/`toggle-group`
for the interactive case, `ComboboxChip` for the removable-token case, and
`badge` for the static label. None of them is a chip.

### M3: the four-member family, treated as ONE component with axes

Confirmed by a mechanical read of all four files. **They agree on every
structural number**: `container-height` 32px, `container-shape` corner-small,
the whole `label-large` typescale, the `focus-indicator` triple, the
state-layer scheme, 18px icons, 0.38 disabled-label / 0.12 disabled-container
opacities — and, via the four hand-authored wrappers, the identical
16/16/8/8px spacing. A normalized value diff of `suggestion` against `assist`
finds the two files **identical except that every `on-surface` becomes
`on-surface-variant`** and the icon family is renamed. They differ only in
colour role, which parts exist, and whether selection exists.

So: **one canonical component, `prop.kind` = `[assist, filter, input,
suggestion]`**, the way button handled filled/outlined/text and card handled
elevated/filled/outlined. Two declared constraints rather than a silent
flattening: `kind` **determines** `interaction` in M3 (assist/suggestion →
action, filter/input → toggle), and `input` supports only `flat`. Both are
enforced in the harness, not merely documented.

### What is out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `badge` | already built — `docs/BADGE-MATRIX.md` | Its own canonical row and the other side of a boundary all three of Salt's own usage docs draw (table above). Inert, single-coloured, system-driven, no role, no tab stop, no disabled state — the exact inverse of every behaviour row here [S]. |
| `button` | already built | Its own canonical row. Salt's own `pill/usage.mdx` separates them explicitly: *"For actions that do not dynamically change with the context. Instead, use `Button`"*, and — a real detail — *"Use title or sentence case when labeling pills. This maintains a visual distinction between `Pill` and `Button`, which always has uppercase labels"* [S]. |
| `toggle-group` / `segmented-control` | Salt `packages/core/src/{toggle-button,toggle-button-group,segmented-button-group}`; shadcn `toggle-group.tsx`; `docs/COMPONENTS.md` | Salt ships **three** separate components here and `pill/usage.mdx` routes to one of them by name: *"To switch between views (e.g., Grid view vs. Card view). Instead, use `ToggleButton`"*. A toggle group is a single-select, roving-tabindex, mutually-exclusive control; a Salt pill group is multi-select only, with a tab stop per member and no arrow keys [S]. |
| `pill-input` / `tokenized-input` | Salt `packages/core/src/pill-input/`, `packages/lab/src/tokenized-input{,-next}/`; shadcn `ComboboxChip*`; `docs/COMPONENTS.md` lines 34 and 45 | **The chip-inside-a-field pattern, and COMPONENTS.md already assigns it elsewhere** — line 34 puts `pill-input` on the `input` row and line 45 on `input-group`. It is also where the entire Delete/Backspace contract lives (`PillInput.tsx:225,253`), which is why `behavior.delete-keys` is off in every column here. Excluding it is the same double-count exclusion INPUT-MATRIX.md made for `search-input` [S]. |
| Salt `status-indicator`, `status-adornment` | `packages/core/src/{status-indicator,status-adornment}` | Their own canonical row, already declared out of scope by BADGE-MATRIX.md for the same reason: icon + semantic colour on a four-value `ValidationStatus`, which is a tone axis neither a pill nor a tag has [S]. |
| Salt Tag's categories **2–20** | `Tag.css` lines 38–159 | Twenty near-identical four-property blocks reassigning the same four indirections. This matrix pins **category 1** (`Tag.tsx`'s own `category = 1` default), the same **scope trim** every column has made for `palette-accent`'s blue/teal axis. Recorded, not modelled [S]. |
| Salt Pill's menu-trigger rule | `Pill.css` lines 55–60 | `.saltPill[aria-expanded="true"][aria-haspopup="menu"]` shares one declaration body with the pressed block, styling a pill that is currently opening a menu as pressed. That is a **`menu` composition** and belongs to the menu row. Recorded on `style.chip.pressed` [S]. |
| M3 `dragged-*` families | all four chip files | Complete in all four (`dragged-container-elevation` level4, `dragged-state-layer-opacity` 0.16) and **no column models drag**, so there is no cross-system contract to hang it on. The identical exclusion `card.m3.json` made [S]. |
| M3 `container-surface-tint-layer-color` | `latest`, three of four files | Arrives **`@deprecated` on the edition that adds it** — same treatment card and dialog gave it [S]. |

---

## Sources

- **Salt** [S]: `packages/core/src/pill/{Pill.tsx,Pill.css,PillGroup.tsx,PillGroup.css,PillGroupContext.ts,PillCheckIcon.tsx,PillCheckIcon.css,index.ts}`;
  `packages/core/src/tag/{Tag.tsx,Tag.css,index.ts}`; `packages/core/src/button/useButton.ts`
  (Pill delegates to it, and its two source comments are quoted in
  `behavior.pressed-flag`);
  `packages/core/stories/{pill/pill.stories.tsx,pill/pill-group.stories.tsx,pill/pill.qa.stories.tsx,tag/tag.stories.tsx,tag/tag.qa.stories.tsx}`;
  `site/docs/components/{pill,tag}/{index,usage,examples,accessibility}.mdx`.
  Resolution through `packages/theme/css/next/characteristics/{actionable,category,content,focused,text}.css`,
  `next/palette/{neutral,categorical,foreground,alpha,accent,corner}.css`,
  `next/foundations/color.css`,
  `packages/theme/css/foundations/{size,spacing,curve,alpha,color,cursor,borderStyle,typography}.css`.
  Read only to fix the boundary: `packages/core/src/pill-input/PillInput.tsx`,
  `packages/lab/src/tokenized-input/useTokenizedInput.tsx`.
  Reused rather than re-derived:
  `docs/foundations/{typography,sizes,spacing,shape,colors,density,cursors,border-style,state-layers}.md`.
- **shadcn** [S, as an absence]: `apps/v4/registry/new-york-v4/ui/` (full listing);
  `apps/v4/registry/new-york-v4/ui/{combobox.tsx,_registry.ts}`;
  `apps/v4/registry/bases/{radix,base,aria}/ui/combobox.tsx`;
  `apps/v4/registry/styles/style-*.css`;
  `apps/v4/content/docs/components/{radix,base,aria}/`;
  `apps/v4/app/(app)/examples/tasks/data/tasks.json`. Plus a `file` sweep of the
  whole `ui/` directory (lesson 11).
- **Material 3** [S]: `tokens/versions/latest/sass/_md-comp-{assist,filter,input,suggestion}-chip.scss`;
  `tokens/versions/v0_192/_md-comp-{assist,filter,input,suggestion}-chip.scss` (edition diff);
  **and the hand-authored `tokens/_md-comp-{assist,filter,input,suggestion}-chip.scss`,
  which are load-bearing here rather than only a disownment record — they are
  the ONLY source of this component's spacing**;
  `versions/latest/sass/{_md-sys-color.scss,_md-sys-color__dark.scss,_md-ref-palette.scss,_md-sys-shape.scss,_md-sys-typescale.scss,_md-ref-typeface.scss,_md-sys-state.scss,_md-sys-state-focus-indicator.scss,_md-sys-elevation.scss}`.
  **material-web is a tokens-only clone**, so every M3 structure and behavior
  row is `[R]` and every style cell is `[S]`.
  Cited rather than re-derived: `docs/foundations/elevation.md`'s canonical
  dp→CSS shadow table.

### Edition pin — `versions/latest`, and it is load-bearing

Pinned to **`tokens/versions/latest/sass`**, matching spinner, tooltip, alert,
input, select, dialog, tabs, card and badge; calendar and button remain on
`v0.192`. The tally becomes **10 latest / 2 v0.192** — the minority shrinks for
the sixth component running, the split is still open, and it still wants one
registry-wide decision. **Flagged for the owner for the tenth time.**

A normalized key/value diff of all four files across the editions (the two
editions use different file *formats* — `latest` emits `$vars`, `v0_192` emits
a `$_default` map — so a textual diff is useless and the comparison was done
after normalizing both) finds exactly three classes of change, **identical in
all four files**:

1. **`latest` ADDS the focus-indicator family** — `focus-indicator-color`
   (`secondary`), `focus-indicator-thickness` (3px),
   `focus-indicator-outline-offset` (`$outer-offset` = **+2px**). This is the
   **only sourced focus affordance an M3 chip has**. On v0.192 this column
   would have had no focus treatment at all.
2. **`latest` CHANGES the resting outline role from `outline` to
   `outline-variant`** in all four files — a real, visible value change, and
   the only value divergence in the whole set.
3. `latest` re-adds a set of legacy names, **every one of them `@deprecated` on
   arrival** (the `flat-*` / `with-icon-*` / unqualified aliases, plus
   `container-surface-tint-layer-color`, itself deprecated). No non-deprecated
   token was removed.

**The counter-argument, weighed rather than hidden.** All four hand-authored
`tokens/_md-comp-*-chip.scss` wrappers do `@use 'versions/v0_192/md-comp-*-chip'`
— the shipped library pins v0.192 for this exact component, as it does for card
and for tabs. Here it is **not close**: following the library's pin would cost
the only focus indicator and take a stale outline role. `latest` is taken, and
the disagreement is stated on the cells. **The pin widens the majority.**

### No borrow was declared — and this time the reason is a real find

Card had to borrow one 16px padding from m3.material.io because its token files
carry no spacing. **None of the four generated chip files carries a spacing
token either** — but the four **hand-authored wrappers each add one,
identically**, as `$new-tokens`:

```
'leading-space': 16px,  'trailing-space': 16px,
'icon-label-space': 8px,  'with-leading-icon-leading-space': 8px,
'with-trailing-icon-trailing-space': 8px   (filter and input only)
```

So chip's padding, gap and icon insets are **`[S]`, read from a file in the
clone**, and flagged as *library-added* rather than generated because the two
sources genuinely disagree about whether they exist. **No token name was
invented and nothing was borrowed.**

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **element** | ⚪ (info) | **two elements from two exports**: `Pill.tsx` returns a real `<button type="button">`, `Tag.tsx` a bare `<div>` with no role and no tabindex [S] | **NO COMPONENT** [S] | **[R] a button-like control** — no element in a tokens-only clone, but four state layers, a focus indicator and a disabled family in every file |
| leading icon | ⚪ | **on, and Salt owns only the GAP** — `gap: spacing-50` (Pill) / `column-gap: spacing-50` (Tag); the glyph is a consumer child sized by Salt's own Icon component, so `style.leading.box` and `.color` are OFF [S] | OFF [S] | **on, and M3 owns all of it** — 18px, a colour per state, and an 8px leading-space that **halves** the chip's own 16px inset [S] |
| **avatar** | ⚪ | OFF — confirmed absence [S] | OFF [S] | **input-chip only** — 24px at `corner-full` (9999px) inside a `corner-small` (8px) container. A PART, not a bigger icon [S] |
| **selection check** | ⚪ | **on, and it is the WHOLE of Salt's selected state** — `PillCheckIcon`, a component-owned **visible checkbox**: a `size-selectable` square with a 1px `currentColor` border and the pill's own radius, filled with a checkmark when checked [S] | OFF [S] | **OFF WITH A REASON, not an absence** — the spec shows a checkmark swap; the token set encodes only a leading-icon **recolour** on selection. Turning it on would have meant inventing the part [S/R] |
| **trailing** | ⚪ | **OFF — confirmed absence, and it is the a11y fork.** No close subcomponent, no trailing rule. The documented closable pill puts a bare `<CloseIcon>` **inside** the button [S] | OFF [S] | **filter and input only** — a full `with-trailing-icon-*` family with its own 8px space. What it *does* is `[R]` [S/R] |
| state layer | ⚪ | OFF — Salt moves the fill/label/border directly [S] | OFF [S] | **on** — hover/focus/pressed/dragged over `on-surface` or `on-surface-variant` [S] |
| **selection scope** | ⚪ | **`group`** — a Pill *outside* a `selectionVariant="multiple"` group has no role, no `aria-checked` and no check icon, and passing it a `value` does **nothing** [S] | OFF [S] | **`self`** — `selected-`/`unselected-` families on the chip; no chip-set token exists anywhere [S] |

### The three axes that were nearly smoothed over

**A Salt Tag is not a Salt Pill in a different colour.** Different element
(`<div>` vs `<button>`), different radius (999px vs 1–4px), different padding
(`spacing-25`/`spacing-100` vs `0`/`spacing-50 − 1px`), different colour family
(categorical vs actionable-bold), a transparent border, no cursor, no hover, no
focus, no pressed, no disabled. They share **three** declarations: the height
expression, the gap step and the type. Modelled as `prop.interaction`'s
`static` value with **one gated block** carrying the whole fork, because in
source it is a different component and not a state of another.

**Selection lives in two different places.** Salt puts it on the **group** and
M3 puts it on the **chip**. A boolean `selectable` flag would have erased that,
and would have made a bare Salt `<Pill value="x">` selectable when source says
it is inert.

**Elevated vs flat is shadow-versus-stroke.** The same trap card fell into. An
elevated M3 chip does not gain a shadow on top of its stroke — it has **no
outline token at all** in any of the four files, so the 1px stroke is *deleted*
and replaced. And **selecting** a flat chip does the same thing a second time,
inside one component: `flat-selected-outline-width: 0px` with a
`secondary-container` fill.

## 2 · Behavior

**Every row below is implemented in `skeleton/chip.tsx` and asserted by
`scripts/check-chip-behavior.mjs`.** Nine rows, five locked, and seven of them
real handlers or measurements.

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **role** | 🔒 (info) | **three answers, and the ARIA is CONDITIONAL**: an action pill writes **none** (native button); a toggle pill writes `role="checkbox"` + `aria-checked`, **only** inside a `"multiple"` group; a Tag writes nothing. **No `radio` reading exists** — `selectionVariant` is only `"none" \| "multiple"`. PillGroup renders a `<fieldset>` and sets **no** `role="group"` [S] | **NO COMPONENT** [S] | **[R]** button + a pressed/selected state; selection is chip-scoped, so the chassis takes `aria-pressed` |
| **tab stop** | 🔒 (info) | **0 on EVERY pill, including every pill of a group — no roving tabindex.** `Pill.tsx` deliberately discards `useButton`'s tabIndex with a source comment. `accessibility.mdx`: Tab reaches the **first** pill, Shift+Tab the **last**. **The opposite of the same system's card group** [S] | OFF [S] | **[R] 0**, implied by the focus-indicator family |
| **keyboard activation** | 🔒 (info) | **TWO CONTRACTS IN ONE SYSTEM.** Action = Enter **and** Space (native). Toggle = **SPACE ONLY** — `if (event.key === "Enter" && insideSelectableGroup) { event.preventDefault(); return; }`, with the source comment *"Prevent selection on enter key for selectable pill."* `accessibility.mdx` states both halves in two separate blocks [S] | OFF [S] | **[R]** Enter + Space |
| selection | ⚪ (info) | **multi-select only**, group-owned, toggling on click; `select` filters-or-concatenates. No single-select mode exists [S] | OFF [S] | **per-chip, and it moves THREE properties** — fill, label, **and the outline width to 0** [S] |
| **delete affordance** | 🔒 (info) | **THE WHOLE PILL IS THE DELETE CONTROL — no nested focusable, one tab stop.** `<Pill onClick={() => removeColor(color)}>{color} <CloseIcon style={{marginLeft:"auto"}} /></Pill>`; `examples.mdx`: *"a close icon on the right side of the pill"* [S] | OFF — **abstains** [S] | **[R] a nested trailing control — two tab stops.** The family is `[S]`; that it is a *button* is spec, not token |
| **delete keys** | ⚪ (config) | **OFF** [S] | **OFF** [S] | **OFF** [S] — *off in all three; see finding 4* |
| **disabled handling** | 🔒 (info) | the **native** attribute, ORed with the group's; `tabIndex: -1`; plus a **separate** early return in `handlePointerDown`, because that handler is bound outside `useButton`. **A Tag has no disabled state** [S] | OFF [S] | `[S]` two opacities, `[R]` mechanism |
| **pressed flag** | ⚪ (info) | **TWO independent flags, combined differently by mode** — `pressActive` (window-level pointerup/pointercancel) and `spaceActive`; `combinedActive = insideSelectableGroup ? pressActive \|\| spaceActive : pressActive \|\| active`. A selectable pill **drops** `useButton`'s `active` so Enter cannot flash it [S] | OFF [S] | **[R]** a ripple; the chassis uses the same flag. Values `[S]`, trigger `[R]` |
| group navigation | ⚪ (info) | **OFF — confirmed absence.** `PillGroup.tsx` binds **no** keydown handler; it is a context provider around a stripped `<fieldset>`. Tab / Shift+Tab only [S] | OFF [S] | **OFF** — no chip-set token [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **`interaction`** | ⚪ | **`action` \| `toggle` \| `static`, DEFAULT `action`** — a bare `<Pill onClick>`, which is what `PillGroup`'s own `selectionVariant = "none"` default produces [S] | **OFF — confirmed absence** [S] | **`action` \| `toggle`, DEFAULT `action`** — the unqualified token families are the base reading. **DETERMINED by `kind`**, declared [S] |
| **`kind`** | ⚪ | OFF [S] | OFF [S] | **`assist` \| `filter` \| `input` \| `suggestion`** — **no source default exists**; spec order, absence recorded, `assist` defensible as value[0] because its enabled tokens are entirely unqualified [S] |
| **`elevation`** | ⚪ | **OFF — confirmed absence**, no `box-shadow` and no `palette/shadow.css` reference in either file [S] | OFF [S] | **`flat` \| `elevated`, DEFAULT `flat`** — and **source says so twice**: the wrappers rename `flat-*` → unprefixed (b/275577569 *"Remove flat-* prefix"*), and input-chip's tokens are already unprefixed [S] |
| **`tag-variant`** | ⚪ | **`primary` \| `secondary`, DEFAULT `primary`** (`Tag.tsx` literal) [S] | OFF [S] | OFF [S] |
| `bordered` | ⚪ | **`[false, true]` — CAPABILITY LIST** (`bordered?: boolean`, no default) [S] | OFF [S] | **OFF, deliberately** — the stroke is unconditional on flat and absent on elevated, so `prop.elevation` already decides it [S] |
| `selected` | ⚪ | **`[false, true]` — CAPABILITY LIST**; not a Pill prop at all, **derived** from group context [S] | OFF [S] | **`[false, true]` — CAPABILITY LIST**; filter and input only [S] |
| `disabled` | ⚪ | **`[false, true]` — CAPABILITY LIST**; group `disabled` ORs into the pill's [S] | OFF [S] | **`[false, true]` — CAPABILITY LIST** [S] |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| label | 🔒 | consumer-owned **children** in every column, and **no system formats or clamps it** — a deliberate contrast with badge, where Salt owns `value`/`max`. Both Salt components handle length in **prose** (*"one or a couple of words"* / *"one or two words"*) and then **clip** with `overflow: hidden` and no ellipsis; M3 declares no overflow token at all. |
| leading | ⚪ | **DECLARED COMPOSITION** to an icon set (both live columns) and to **`avatar`** (M3 input-chip, its own COMPONENTS.md row). Neutral placeholders. |
| trailing | ⚪ | **M3 only. DECLARED COMPOSITION** to an icon set and, per the spec, to **`button`**. Rendered inside a real nested `<button>` so the a11y fork is inspectable. |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**: (a) **`form-field`** — `PillGroup` calls `useFormFieldProps()` and merges the field's `aria-labelledby`/`aria-describedby` and disabled state, and `examples.mdx` recommends wrapping every selectable group in one; (b) an **icon set**; (c) **`avatar`**; (d) **`button`** (M3's remove control); (e) **`combo-box`** — Salt's `examples.mdx` routes the closable pill *"within an input control such as ComboBox"*, which is the boundary this component does **not** cross; (f) **`badge`**, already built, which points here from the other side. All neutral placeholders. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | **Pill**: solid gray-500 fill, white label, a **same-colour** (invisible) 1px border, 1–4px radius. **Tag**: cobalt-100 wash, cobalt-600 label, 999px radius [S] | **NO COMPONENT** [S] | **NO FILL AT ALL** — a 1px `outline-variant` hairline at 8px. Confirmed absence: no flat-unselected container-color token exists [S] |
| hover | ⚪ | a **15% black gradient wash** over the same fill, the **same** label colour (see finding 2), a 30% contrast border that **inverts by mode**. And `:focus-visible` shares the block. Tag: none [S] | OFF [S] | a state layer at **8%** and nothing else on the container — every `hover-label-text-color` equals its resting role. Elevated lifts level1→level2 [S] |
| focus | ⚪ | **2px DOTTED** `accent-stronger` at offset 0, **plus the whole hover treatment** [S] | OFF [S] | **THREE SIMULTANEOUS MECHANISMS** — a 3px solid `secondary` at the **outer +2px** offset (latest only), a stroke recolour, and a 10% layer. **Focus does not elevate** [S] |
| pressed | ⚪ | **THE PILL INVERTS** — gray-200 fill, **BLACK** label in light mode. The largest single state change in this component [S] | OFF [S] | a 10% layer; elevated returns to its **resting** level1 [S] |
| **selected** | ⚪ | **NOTHING CHANGES ON THE CHIP.** No `-selected` selector, no `[aria-checked]` selector, no `selectable-*` reference anywhere in `Pill.css`. The **entire** signal is a checkmark appearing inside the check box [S] | OFF [S] | **three properties** — `secondary-container` fill, `on-secondary-container` label, outline width → **0** [S] |
| disabled | ⚪ | a **blanket 40%** on the whole pill, with the three resting indirections **restated** so hover cannot win, plus `not-allowed`. The 0.4 is a **literal**, not a token. Tag: none [S] | OFF [S] | **TWO different opacities in one state** — 0.38 on the content, **0.12** on the stroke [S] |

## 6 · Styles — the cell matrix

All cells at each system's default: Salt an **action Pill**, medium density;
M3 a **flat, unselected, assist** chip. shadcn is off throughout, once, for one
reason.

### the chip

| attribute | policy | Salt | Material 3 |
|---|---|---|---|
| background | ⬜ | ⟡ `chip-bg` → `actionable-bold-background` → `palette-neutral` → **gray-500 `rgb(114,119,125)`, MODE-INVARIANT** [S] | ⟡ `chip-bg` → **`transparent`** — CONFIRMED ABSENCE, no flat-unselected container-color token [S] |
| colour | ⬜ | `actionable-bold-foreground` → **WHITE IN BOTH MODES** [S] | `on-surface` **`#1d1b20` / `#e6e0e9`**; the other three kinds take `on-surface-variant` [S] |
| **font** | ⬜ | **`400 12px/16px 'Open Sans'`** @medium (11/14 · 12/16 · 14/18 · 16/20 by density). **REGULAR body type at body size** [S] | **`500 0.875rem/1.25rem Roboto`** (`label-large`) [S] |
| letter-spacing | ⚪ | **`0`** — declared on Pill.css and **not** on Tag.css [S] | **`0.00625rem`**, and **disowned** by all four wrappers [S] |
| **shape** | ⬜ | **1/2/3/4px by density** (`corner-weaker` → `curve-50`) — a **nearly square** pill. Tag is **999px** [S] | **8px** (`corner-small`), all four files, both editions [S] |
| height | ⬜ | **`calc(size-base − spacing-100)`** = 16/20/24/28px over a `text-minHeight` floor of 14/16/18/20px — **byte-identical declarations in Pill.css and Tag.css** [S] | **32px**, a hardcoded literal in all four files. **Taller than a Salt pill at every density including touch** [S] |
| padding | ⬜ | **`0 calc(spacing-50 − 1px)`** = 0 1/3/5/7px — source **subtracts the border** so the ink box lands on the step. Tag: `spacing-25 spacing-100` = **four times** the inline padding [S] | **`0 16px`**, from the **hand-authored wrappers**, not the generated set [S] |
| padding @with-leading | ⚪ | OFF — Salt's padding does not react to its contents [S] | **8px** — the leading inset **halves** when a glyph is present [S] |
| padding @with-trailing | ⚪ | OFF [S] | **8px**, filter and input wrappers only [S] |
| gap | ⚪ | **2/4/6/8px** — `gap` on Pill, `column-gap` on Tag [S] | **8px** (`icon-label-space`), library-added [S] |
| border-width | ⚪ | **1px** (`size-fixed-100`, **FIXED scale, density-invariant by design**) — invisible at rest [S] | **1px** — a **real** hairline, because there is no fill behind it [S] |
| border-colour | ⚪ | `palette-neutral` → gray-500, **the same colour as the fill** [S] | `outline-variant` — **the edition-pin payoff**; v0.192 said `outline` [S] |
| overflow | ⚪ | **`hidden`** in **both** files — clipped, no ellipsis [S] | OFF — no token [S] |
| white-space | ⚪ | **`nowrap`** on Pill; Tag uses `min-width: max-content` instead [S] | OFF [S] |
| cursor | ⚪ | **`pointer`**; Tag declares none [S] | **OFF** — no cursor token in any of the four files [S] |
| transition | ⚪ | **OFF** [S] | **OFF** [S] — *off in both; see finding 8* |
| elevation | ⚪ | **OFF — confirmed absence** [S] | **`none`** (`flat-container-elevation` level0), declared so `@elevated` has a base [S] |
| elevation @hover | ⚪ | OFF [S] | **level2**, elevated only — cited from `docs/foundations/elevation.md` [S/R] |
| hover | ⚪ | **on** — three indirections at once [S] | **OFF on the container** — the whole hover response is the state layer [S] |
| focus | ⚪ | **`2px dotted`** + the hover block [S] | **3px solid `secondary` at +2px** + a stroke recolour [S] |
| pressed | ⚪ | **on, and it inverts** [S] | **OFF on the container** [S] |
| selected | ⚪ | **OFF — confirmed absence** [S] | **on — three properties** [S] |
| disabled | ⚪ | blanket `0.4` + restated colours + `not-allowed` [S] | **two `color-mix()` expressions**, 38% and 12% [S] |

### the axes, as generated rows

| row | Salt | Material 3 |
|---|---|---|
| `style.chip.elevation@elevated` | OFF | **on — THE MECHANISM ROW**: `surface-container-low` fill + level1 shadow + **`border-width: 0`**. Shadow *replaces* stroke. **Not available on input-chip** [S] |
| `style.chip.kind@suggestion` | OFF | **on** — reassigns `--chip-fg`, `--chip-focus-border`, `--sl-color` to `on-surface-variant`. That single substitution **is** the whole difference from assist [S] |
| `style.chip.kind@filter` | OFF | **on** — the same three. At rest, flat and unselected, **a filter chip and a suggestion chip are byte-identical**; see finding 3 [S] |
| `style.chip.kind@input` | OFF | **on, and the most divergent** — also moves `--chip-icon` to `on-surface-variant` and `--chip-icon-selected` **back to `primary`**, inverting filter [S] |
| `style.chip.tag-rest` | **on — the whole static fork in one block**: 999px, `spacing-25/spacing-100`, categorical colours, transparent border, `cursor: auto` [S] | OFF |
| `style.chip.tag-variant@secondary` | **on** — cobalt-500 at full strength (**mode-invariant**) with a white label [S] | OFF |
| `style.chip.bordered` | **on** — changes **only the colour**, transparent → cobalt-500 [S] | OFF |

### the parts

| attribute | policy | Salt | Material 3 |
|---|---|---|---|
| leading box | ⚪ | **OFF — confirmed absence**; Salt owns the gap, not the glyph [S] | **18px square**, all four files [S] |
| leading colour | ⚪ | **OFF** — the icon **inherits the label**, so it inverts when the pill is pressed [S] | **`primary`** (assist/suggestion/filter), `on-surface-variant` (input) [S] |
| leading colour @selected | ⚪ | OFF [S] | **`on-secondary-container`** (filter) / **`primary`** (input) — **the two toggle families invert each other on this one part** [S] |
| avatar box | ⚪ | OFF [S] | **24px at `corner-full`** — the only `corner-full` anywhere in the family [S] |
| trailing box | ⚪ | OFF [S] | **18px**; filter declares trailing *colours* but no trailing size and inherits the shared 18px [S] |
| trailing colour | ⚪ | OFF [S] | `on-surface-variant` [S] |
| **check box** | ⚪ | **on** — `size-selectable` square (**12/14/16/18 by DENSITY**), a **colourless** 1px border (therefore `currentColor`), the pill's own radius, and **`clip-path: border-box` instead of `overflow: hidden`** with a source comment saying why [S] | OFF [S] |
| state-layer colour | ⚪ | OFF [S] | `on-surface` / `on-surface-variant`, declared on the **chip** so the child inherits [S] |
| state-layer @hover/@focus/@pressed | ⚪ | OFF [S] | **0.08 / 0.10 / 0.10** (`latest`; v0.192 said 0.12 for the last two). Focus is **disowned** by all four wrappers [S] |
| group box | ⚪ | **`gap: 2/4/6/8px` + `flex-wrap: wrap`** [S] | **OFF — confirmed absence**; M3 tokenises the chip and never the row of chips [S] |

**Accent scope trim.** `palette-accent-stronger` (the focus outline colour)
resolves through `palette-accent`, which has a `data-accent` axis (`blue`
default, `teal` alternate). This column pins **blue**, matching every other
component's Salt column except `calendar`. Recorded, not modelled.

**Category scope trim.** `Tag.css` enumerates categories **1–20**. This column
pins **category 1** (`Tag.tsx`'s own default). Recorded, not modelled.

---

## Declared approximations in the chassis

1. **`selected` is an instance prop; in Salt it is derived.** `Pill.tsx`
   computes `selected` internally from
   `pillGroupContext.selected.includes(value)`. The chassis takes it as a prop
   and lets `ChipGroup` drive it — the same observable rule reached through a
   props-based API, and the identical restatement `card.tsx` made for
   `hasCardSection`.
2. **M3's selected + disabled case is not modelled.**
   `flat-disabled-selected-container-opacity: 0.12` applies to the *container*
   when a chip is both selected and disabled. It needs a compound selector the
   template has no channel for. The unselected disabled case (0.38 content /
   0.12 stroke) **is** modelled, faithfully, as two `color-mix()` expressions.
3. **A disabled *elevated* M3 chip keeps its hover shadow while hovered.**
   `style.chip.elevation@hover`'s selector
   (`[data-elevation="elevated"]:hover`) outranks `style.chip.disabled`'s
   (`[data-disabled]`), and source says `elevated-disabled-container-elevation`
   is level0. A disabled `<button>` still matches `:hover` in CSS. One compound
   selector short; declared rather than papered over.
4. **M3's `prop.interaction` is derived from `prop.kind`, not independent.**
   Source couples them (assist/suggestion have no selection tokens; filter and
   input have nothing else). Both rows are carried because the *question* each
   asks is real and cross-system, and the coupling is enforced in the harness
   so no impossible combination can be rendered. Likewise `input` + `elevated`
   is withdrawn in the harness, because input-chip has no elevated family.
5. **Salt's `menu`-trigger pressed rule is not reproduced.**
   `.saltPill[aria-expanded="true"][aria-haspopup="menu"]` shares the pressed
   body. It is a `menu` composition and belongs to that row.
6. **The check glyph is a neutral placeholder.** Salt renders
   `CheckmarkSolidIcon` when checked and a plain `CheckmarkIcon` while
   *active* — two different glyphs for two states. The chassis renders one
   neutral tick, the same declared deferral every component has made pending a
   registry icon set. The **box** — which is the part Salt actually owns and
   styles — is reproduced exactly.

---

## Findings from building this matrix

1. **Salt's Pill is nearly square and Salt's Tag is a full pill — the names are
   backwards, and the edition axis makes it worse.** `Pill.css` reads
   `border-radius: var(--salt-palette-corner-weaker, 0)` → `curve-50` →
   **1/2/3/4px by density**. `Tag.css` reads
   `var(--saltTag-borderRadius, var(--salt-palette-corner-strongest, 9999px))`
   → `curve-999` → **999px**. Under `[data-corner="sharp"]` the gap *widens*:
   `corner-weaker` collapses to `curve-0` while `corner-strongest` stays at
   `curve-999` (`next/palette/corner.css` lines 2 and 16), so the sharp edition
   gives a **0px "pill"** and a **999px "tag"**. M3's chip sits between them at
   a flat 8px. Three chips in this registry, three shapes, no two alike — and
   the one whose name promises a pill shape is the one that does not have it.
   Found by reading the CSS; invisible in any prop table.

2. **Salt declares a hover recolour that recolours nothing — for the third time
   in this pipeline.** `Pill.css`'s hover block reassigns `--pill-color` from
   `--salt-actionable-bold-foreground` to
   `--salt-actionable-bold-foreground-hover`. `next/characteristics/actionable.css`
   defines the first (line 48) as `var(--salt-palette-foreground-primary-alt)`
   and the second (line 47) as **`var(--salt-palette-foreground-primary-alt)`**.
   Identical. A hovered Salt pill's label does not move. The row is carried with
   two slots holding one value so the identity is visible in the matrix rather
   than silently collapsed, exactly as CARD-MATRIX.md finding 6 did for
   `LinkCard`'s focus accent — this is the same defect in the same
   characteristics family, and the **sixth source self-contradiction** the
   pipeline has turned up.

3. **A filter chip and a suggestion chip are byte-identical at rest, and the
   thing that distinguishes them is not a colour.** Flat, unselected, enabled,
   with no icon, the two M3 families produce the *same* computed style: same
   32px, same 8px, same `label-large`, same `on-surface-variant` label, same
   `outline-variant` 1px stroke, same 16px padding. They are discriminated by
   **structure**, not by style: filter has a **selected state** (three
   properties) and a **trailing part**; suggestion has neither. Stated in the
   `@filter` cell rather than hidden, because lesson 3's real target is an axis
   value that discriminates nothing — here the value discriminates plenty, just
   not in CSS. Separately: a normalized value diff of `suggestion` against
   `assist` finds the two files identical except that **every `on-surface`
   becomes `on-surface-variant`** and the icon family is renamed. Four files;
   one of them is another with one substitution.

4. **No system in the clones binds Delete or Backspace to a standalone chip,
   and the one system that has the handler keeps it in a different
   component.** `grep -niE "backspace|Delete"` over
   `packages/core/src/{pill,tag}` returns **nothing**. The same grep over
   `packages/core/src/pill-input/` returns `PillInput.tsx:225`
   (`event.key === "Backspace" && lastPill`) and `PillInput.tsx:253`
   (`event.key === "Delete" || event.key === "Backspace"`), and
   `packages/lab/src/tokenized-input/useTokenizedInput.tsx` binds the same.
   Those are the chip-**inside-a-field** pattern, which `docs/COMPONENTS.md`
   line 45 puts on the `input-group` row and the brief excludes by structural
   reason. M3 cannot source a key contract from a tokens-only clone; shadcn has
   no component. **So a standalone chip in this registry is removable by
   Enter/Space (Salt) or by clicking a nested control (M3) and by no keyboard
   shortcut in any column.** `behavior.delete-keys` is carried as a capability
   every column leaves off — the treatment badge gave `behavior.live-region` —
   so the gap is a matrix cell rather than a silent omission.

5. **The a11y fork is real, and the two systems answer it in opposite
   directions.** Salt: **do not nest.** Its documented closable pill is
   `<Pill onClick={remove}>{label} <CloseIcon style={{marginLeft:"auto"}} /></Pill>`
   — the glyph is a decorative child of the button, pushed right by a
   *consumer* inline style, with one tab stop and one click target, and
   `examples.mdx` describes it as *"adding a close icon on the right side of
   the pill"*. M3: **nest.** `filter` and `input` chips carry a full
   `with-trailing-icon-*` family with its own 8px space and its own
   enabled/hover/focus/pressed/disabled colours, and the published spec makes
   an input chip's trailing icon a remove **button** — a focusable inside a
   focusable, two tab stops per chip. That last half is `[R]`: the tokens say a
   trailing icon exists and its colours; they do not say it is a button. shadcn
   **abstains**. The chassis refuses to guess: it renders a real nested
   `<button>` only where `structure.trailing` is on, `stopPropagation`s its
   click so it cannot also activate its host, and **measures** whether a
   focusable descendant is actually present, publishing
   `data-has-nested-focusable` — the same resolution CARD-MATRIX.md finding 9
   reached, and the harness prints the measured answer beside every deletable
   chip rather than asserting it.

6. **Salt's selected state changes nothing on the chip, and that is a real
   accessibility and fidelity fact rather than a modelling gap.** `Pill.css`
   contains no `-selected` selector, no `[aria-checked]` selector and no
   `selectable-*` characteristic reference — and note that
   `next/characteristics/selectable.css` exists and is full of exactly the
   tokens a selected pill would want (`selectable-background-selected`,
   `-foreground-selected`, `-borderColor-selected`); Salt's pill simply does
   not read them. A selected Salt pill's fill, label and border are
   byte-identical to an unselected one. The **entire** selected signal is a
   `CheckmarkSolidIcon` appearing inside the `PillCheckIcon` box, and Salt's own
   `examples.mdx` treats that as the design intent: *"A visible checkbox
   provides the user with a clear visual cue that the accompanying pill is
   selectable."* M3, by contrast, moves three properties including the
   separation mechanism. One system signals selection with a **glyph**, the
   other by swapping the **surface**.

7. **Two group components in one design system with two opposite navigation
   contracts.** `PillGroup.tsx` binds **no** keydown handler at all; every pill
   keeps its own tab stop (`Pill.tsx` explicitly discards `useButton`'s
   tabIndex with a comment saying so), so a group of eight Salt pills is eight
   tab stops and `accessibility.mdx` documents Tab / Shift+Tab and nothing
   else. `InteractableCardGroup` — recorded in CARD-MATRIX.md from the other
   side — is a roving-tabindex radiogroup with arrow navigation and
   selection-follows-focus. Same design system, same "a group of selectable
   things" problem, two answers. Also: `PillGroup` has **no single-select
   mode** (`selectionVariant?: "none" | "multiple"`), which is why the pill's
   role is `checkbox` and there is no `radio` reading anywhere in this matrix.

8. **Chip is the second component after card where a whole property class is
   absent in every column — and this time it is motion.** Neither `Pill.css`
   nor `Tag.css` declares a transition, animation or `--salt-duration-*`
   reference; none of M3's four files carries a duration, easing or motion
   token; shadcn has no component. `style.chip.transition` is off in **all
   three** columns and is retained deliberately as documentation. Worth stating
   against card, where Salt *did* declare
   `transition: box-shadow var(--salt-duration-instant)` with a **0ms**
   duration: here it does not declare one at all, which is the honest version
   of the same outcome.

9. **material-web supplies the spacing its own generated tokens omit, and that
   turns card's declared borrow into a sourced value.** All four
   `versions/latest` and `versions/v0_192` chip files carry **zero** spacing
   tokens. All four hand-authored `tokens/_md-comp-*-chip.scss` wrappers add
   the same four (or five) as `$new-tokens`: `leading-space` 16px,
   `trailing-space` 16px, `icon-label-space` 8px,
   `with-leading-icon-leading-space` 8px, and — on filter and input —
   `with-trailing-icon-trailing-space` 8px. So chip needed **no borrow** where
   card needed one. The same wrappers also **rename every `flat-*` token to its
   unprefixed form** citing *b/275577569 "Remove flat-* prefix"*, which is
   direct source evidence that **flat is the base reading** and elevated the
   qualified one — the single most useful thing found in this component, and it
   is in a file that most passes would treat only as a disownment record. The
   disownment is there too: `label-text-tracking`, `label-text-type`,
   `container-elevation`, the whole `dragged-*` family and
   `focus-state-layer-{color,opacity}` all go under `$unsupported-tokens`, so
   the shipped library draws a focus **indicator** but no focus state **layer**.
   That is the **sixth** time the generated token set and the shipped library
   have disagreed in this pipeline (SELECT finding 6, DIALOG finding 8, TABS
   finding 11, CARD finding 3, BADGE's `letter-spacing`, and now this).

10. **The edition pin is load-bearing for the second component running, and it
    changed a value as well as adding a family.** `latest` adds the
    focus-indicator triple to all four files — the only sourced focus
    affordance an M3 chip has, exactly as it was for card — **and** it moves
    the resting outline from `outline` to `outline-variant` in all four. The
    second half is new: every previous edition diff in this pipeline found
    either zero value divergences (badge, card) or additions only. Here a
    modelled cell's *value* differs between editions, so the pin is not merely
    a coverage choice. Tally now **10 latest / 2 v0.192**; the shipped library
    pins v0.192 for all four chip files and is overruled, with the reason
    written down.

11. **Frozen-token check, run in both directions, found one fixed-scale value
    and three real density moves.** `--salt-size-fixed-100` (the 1px border on
    both Pill and Tag, and the value the padding subtracts) is on the **FIXED**
    scale and is density-invariant **by design** per `docs/foundations/sizes.md`
    — carried as a plain `1px`, the same call `card.salt.json` made.
    `--salt-size-selectable` (the check box, **12/14/16/18**),
    `--salt-size-base` and `--salt-spacing-100` (the height, via a `calc`),
    `--salt-spacing-{25,50,100}` (both paddings, the gap, the group gap),
    `--salt-curve-50` (the pill radius) and `--salt-text-{fontSize,lineHeight,minHeight}`
    all **move**, and are carried per density — so a medium snapshot would have
    been wrong at three of four densities in nine slots. Two genuinely
    invariant values by another route: `curve-999` = 999px in all four density
    blocks **and both corner editions**, and every M3 number, because M3 has no
    density capability at all (`docs/foundations/density.md`). Note also
    `--salt-focused-outlineWidth` = `size-fixed-200` = 2px, fixed scale.

12. **Axis self-audit (run deliberately, per ALERT-MATRIX.md finding 10).**
    Every `channel: "config"` row whose cell is a list of 2+ values, and what
    discriminates each value:
    - **`prop.interaction`** — Salt `[action, toggle, static]`, M3
      `[action, toggle]`: discriminated by a **real skeleton element branch**
      (`<div>` vs `<button>`), by the role/aria computation
      (none → `checkbox`+`aria-checked` → nothing), by the **keyboard fork**
      (Enter+Space vs Space-only with an explicit `preventDefault`), by
      `structure.selection-check`'s toggle gate, and by
      `style.chip.tag-rest`, a real block gated on `[data-interaction="static"]`
      that moves six properties. Listed **SOURCE-DEFAULT-FIRST (`action`)** in
      both, and this one is easy to get wrong in two different ways: a
      toggle-first list would have put a checkbox glyph on every unqualified
      Salt chip, and a static-first list would have turned every Salt chip into
      a 999px categorical tag. Salt's default is sourced from `PillGroup`'s own
      `selectionVariant = "none"` plus the `Default` story; M3's from the
      unqualified token families.
    - **`prop.kind`** — M3 `[assist, filter, input, suggestion]`: discriminated
      by **three real CSS blocks** (`@suggestion`, `@filter`, `@input`), which
      between them move the label colour, the focus-stroke colour, the
      state-layer colour, the leading-icon colour and the **selected**
      leading-icon colour; by **skeleton part branches** (avatar on input
      alone; trailing on filter and input alone); by whether `prop.selected` is
      reachable at all; and by input's exclusion from `prop.elevation`.
      **No source default exists** — nothing in the four files or four wrappers
      marks one as primary — so the list is in the spec's published order and
      the absence is recorded rather than a default invented, the same
      treatment `card.m3.json` gave `prop.variant`. `assist` is nonetheless the
      defensible value[0]: it is the only family whose enabled tokens are
      entirely unqualified. **Filter and suggestion are byte-identical at rest
      and that is stated on the cell** (finding 3) — the discrimination is
      structural.
    - **`prop.elevation`** — M3 `[flat, elevated]`: discriminated by
      `style.chip.elevation@elevated`, a real block that moves **three**
      properties in a mechanism-changing way (a fill appears, a shadow appears,
      the 1px stroke is **deleted**), plus `style.chip.elevation@hover`.
      Listed **SOURCE-DEFAULT-FIRST (`flat`)**, and source says so twice — the
      wrappers rename `flat-*` to unprefixed citing *"Remove flat-* prefix"*,
      and input-chip's tokens are already unprefixed. An elevated-first list
      would have made every unqualified M3 chip in the harness a shadowed
      surface with no stroke, against source.
    - **`prop.tag-variant`** — Salt `[primary, secondary]`: discriminated by
      `style.chip.tag-variant@secondary`, a real block moving the background
      and the label colour. Listed **SOURCE-DEFAULT-FIRST (`primary`)**, from
      the literal `variant = "primary"` in `Tag.tsx`.
    - **`prop.bordered`** — Salt `[false, true]`; **`prop.selected`** — Salt and
      M3 `[false, true]`; **`prop.disabled`** — Salt and M3 `[false, true]`.
      These are **CAPABILITY LISTS, not ordered defaults**: `false` is the base
      rendering in every column and the skeleton reads the per-instance prop,
      **never `value[0]`**. Stated explicitly because the ordering convention
      differs from the enum rows above, exactly as card and tabs had to state.
      `bordered` is discriminated by `style.chip.bordered`; `selected` by
      `style.chip.selected` and `style.leading.color@selected` and the ARIA
      branch; `disabled` by `style.chip.disabled` (two genuinely different
      mechanisms) plus the native-attribute and early-return branches.
    - **Single-valued or boolean per column, so nothing to discriminate:**
      every `structure.*` row (`leadingIcon`, `avatar`, `selectionCheck`,
      `trailing`, `stateLayer` are single booleans per column;
      `selectionScope` is one value per column, discriminated by the ARIA
      branch and the group gate), and `behavior.delete-keys` (off everywhere).
    **Result: no dead axis values, every enum list is source-default-first,
    every capability list is declared as such, the one axis with no source
    default says so, and the one pair of values that is style-identical at rest
    says that too.** The rows off in every column
    (`behavior.delete-keys`, `behavior.group-navigation`,
    `style.chip.transition`) are retained deliberately as documentation of
    findings 4, 7 and 8.

13. **No `docs/foundations/*.md` claim was contradicted by a grep, and six were
    confirmed.** `typography.md` line 57's label row (M3 `label-large`
    0.875rem/1.25rem, `plain`, `weight-medium`) matches
    `_md-sys-typescale.scss` exactly, and its **amended** Roboto entry holds —
    `_md-ref-typeface.scss:19,21` really do carry `$brand: Roboto` /
    `$plain: Roboto` as literals, so the M3 font cell here is **`[S]`**.
    `state-layers.md` is **correct as amended**: this column pins `latest` and
    uses 0.08 / 0.10 / 0.10, and the page's own edition table says exactly
    that; its separate note that Salt's 40% disabled opacity "is not declared
    as a named foundation token" is confirmed for a ninth component
    (`Pill.css`'s literal `opacity: 0.4`), as is the M3 0.38/0.12 convention.
    `elevation.md`'s canonical dp→CSS table was **cited, not re-derived**, for
    level1 and level2 — the whole point of that table. `shape.md`'s
    small–medium row (M3 `corner-small`: 8px) and its Salt `curve-50` row
    (1/2/3/4px) both match. `sizes.md`'s `size-selectable` (12/14/16/18) and
    `size-fixed-100` (1px, fixed scale) both match. `density.md`'s claim that
    M3 has no density capability holds — no chip token varies by anything.
    `cursors.md`'s `cursor-hover: pointer` / `cursor-disabled: not-allowed`
    match. **Nothing to report under lesson 9 this time.**

14. **The third gate, fifth outing, with the ref-effect block back in its
    positive form.** `scripts/check-chip-behavior.mjs` is
    `check-badge-behavior.mjs`'s contract over chip's **nine** behaviour rows
    (five locked/info). Badge's `REF_EFFECT_GUARDS` was *inverted* because that
    skeleton has no effects at all; chip has **two**, and one of them is
    precisely the dialog hazard — it reads a ref and queries for a
    **conditionally rendered** node (the trailing remove button). Its deps
    therefore list every piece of state that decides whether that node exists:
    `[showTrailing, interactionMode, isDisabled]` — the trailing gate, the
    element swap that turns the root itself from non-focusable to focusable,
    and the flag that removes the button from the tab order. The second effect
    (the window-level `pointerup`/`pointercancel` listener that clears the
    pressed flag) reads no ref and is deliberately unguarded, with the reason
    written beside the guard list; the script **counts** effects so a third one
    cannot appear silently. The honest closing caveat is unchanged, and it now
    carries a chip-specific environment warning: `style.chip.focus` is a
    `:focus-visible` rule in **both** live columns, and `:focus-visible` does
    **not** match a programmatic `.focus()` on a mouse-driven document at all —
    so the focus ring must be exercised with a real keyboard Tab or asserted
    from the stylesheet, or the environment manufactures a false negative of
    the same shape TABS-MATRIX.md's validation pass chased.

15. **Lesson 11 mattered here for a reason it has not before: an empty grep was
    the *expected* result.** The shadcn verdict rests on greps that return
    nothing, which is exactly the evidence CARD-MATRIX.md proved untrustworthy
    when a NUL byte made `skeleton/card.tsx` binary. So the absence proof is
    six-part rather than one-part, and one of the six is a `file` sweep of the
    entire `ui/` directory confirming all 63 files are text. Every artifact
    written by this build was then checked the same way: `file` reports
    `skeleton/chip.tsx` as **ASCII text**, all five JSON/TSX/MJS siblings as
    text, and a `tr -d -c '\000'` scan finds **zero NUL bytes** in any of them.

## Validation pass

**Generator: `OK` on all three columns**, zero failures —
m3 59 filled / 16 off, salt 47 / 28, shadcn 7 / 68. The seven shadcn "filled"
cells are the **locked** rows, which carry an evidenced *"NO COMPONENT — …"*
answer rather than `off`, because a locked row means the question must be
answered. **Harness builds clean** (`node scripts/build-chip-check.mjs` →
`dist/chip-check.html`). **Behaviour gate passes** — nine rows, five
locked/info, one guarded ref effect, effect count 2 as declared.

**One cascade decision worth recording.** The generator emits rows in template
order, and switchable rows gain a `:not([data-off~="…"])` clause that raises
their specificity above unswitchable ones. The style rows were therefore
**deliberately reordered** so the axis blocks (`@elevated`, the three `@kind`s,
`tag-rest` → `tag-variant@secondary` → `bordered`) precede the state blocks
(`hover` → `focus` → `pressed` → `selected` → `disabled`). Without that,
`@elevated`'s `box-shadow` would have outlived `disabled`'s `box-shadow: none`,
and `tag-variant@secondary` would have been overwritten by `tag-rest`'s
background. Equal-specificity ordering is a real correctness surface in this
generator and it is not currently gated — **flagged for the owner**, alongside
CARD-MATRIX.md finding 12's cross-column shadow inconsistency.

## An owner decision this component surfaces: the nested-focusable delete control

Chip is the first component matrixed where the two live systems give
**opposite** answers to an accessibility question, and where the registry
cannot ship both.

- **Salt: one tab stop.** The whole pill is the remove control. Simple to
  operate, impossible to mis-target — but the chip can then do **only one
  thing**, so a chip that both filters *and* removes is not expressible.
- **M3 [R]: two tab stops.** A nested remove button inside a focusable chip.
  Expressive — the chip toggles and the button removes — but it puts a
  focusable inside a focusable, which doubles the tab burden of a chip row and
  is the pattern APG warns about for exactly that reason. And the "it is a
  button" half is **spec, not token**: material-web's chip tokens describe a
  trailing icon and its colours and say nothing about focusability.
- **shadcn: abstains.** No component.

The chassis currently **mirrors each column** and *measures* the outcome
(`data-has-nested-focusable`), so the divergence is inspectable rather than
decided. Three options, no default chosen:

1. **Mirror source** — as now. Maximum fidelity; a consumer switching themes
   silently changes their app's tab-stop count.
2. **Mirror source, and expose the count** — as now *plus* surfacing the
   measurement in the panel, so the tab-stop cost of a theme is visible before
   it ships.
3. **Add a registry-level rule** — e.g. always nest, or never nest, clearly
   marked as a **REGISTRY ADDITION** the way declared approximations are, with
   the departed system's behaviour recorded on the cell.

Recorded rather than decided, per the pipeline's instruction to queue taste
decisions instead of blocking on them — and logged alongside BADGE-MATRIX.md's
open ARIA question, which this component partially answers: **badge's "all
three ship zero ARIA" is not a registry-wide pattern.** Salt's chip really does
write `role="checkbox"` and `aria-checked`, conditionally.

## Owner-validation pass — a wrong `structure` row, revealed by a 300px blowout

**Verified.** Salt's Pill really is nearly square (`corner-weaker` → `curve-50`,
and `curve-0` under the sharp edition) while Salt's Tag is a full 999px pill
(`corner-strongest` → `curve-999`, both editions) — the two names are the wrong
way round, and `pill/index.mdx` literally declares
`alsoKnownAs: ["Chip", "Badge"]`. shadcn's absence holds up.

**The bug: `structure.leading-icon` was `true` for Salt, and Salt has no
leading icon.** `PillProps extends ComponentPropsWithoutRef<"button">` and adds
exactly one member, `value?: string`; the render body is
`{insideSelectableGroup && <PillCheckIcon .../>}{children}`. The only icon Salt
ships is the selection check — already modelled by its own
`structure.selection-check` row. There is no leading slot, no adornment prop,
and no icon rule in `Pill.css`.

**How it surfaced is the transferable part.** The wrong row turned on a part;
the matching `style.leading.box` row was — correctly — `off`, because Salt has
no such part to size. So the skeleton rendered an icon wrapper with **no
width**, containing an `<svg>` styled `width: 100%`. A replaced element sized
in percentages inside a parent with no definite width falls back to its
**default 300px intrinsic width**, so every unconstrained Salt chip ballooned
from ~40px to ~367px.

It was invisible in half the harness: chips inside `.chip-cell` looked perfect
because that wrapper's `max-width: 260px` clamped the blowout. Only the chips
sitting directly in `.chip-row` showed it. **A layout constraint elsewhere on
the page was masking a component defect** — the same shape as spinner's
indeterminate arc hiding a wrong radius until a determinate ring sat next to it.

Two rules worth carrying:

- **A `structure` row ON with its sizing `style` row OFF is a latent defect**,
  and no gate sees it: `off` is a legal state for a switchable style row, and
  the generator has no notion that a part which renders must also have
  dimensions. Worth a future check — for every `structure.<part>` that is on,
  assert at least one style row targeting that part is also on.
- **Never validate a component only inside a constrained container.** Render at
  least one instance with no width limit, or a runaway intrinsic size will hide
  behind whatever clamps it.

Fixed by correcting the data, not by patching the symptom: `structure.leading-icon`
and `slot.leading` are now `off` for Salt with the source cited. Adding a
fallback width to the wrapper would have made the render look right while
leaving the false claim that Salt's chip has a leading icon.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/chip.template.json` against every system, read from `columns/chip.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 21 light, 6 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `chip-bg` | rgb(114, 119, 125) | — | yes |
| `chip-fg` | rgb(255, 255, 255) | — | yes |
| `chip-border` | rgb(114, 119, 125) | — | yes |
| `chip-bg-hover` | linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)) rgb(114, 119, 125) | — | yes |
| `chip-fg-hover` | rgb(255, 255, 255) | — | yes |
| `chip-border-hover` | rgba(0, 0, 0, 0.3) | rgba(255, 255, 255, 0.3) | yes |
| `chip-bg-active` | rgb(211, 213, 216) | rgb(58, 63, 68) | yes |
| `chip-fg-active` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `chip-border-active` | rgb(114, 119, 125) | — | yes |
| `chip-focus-outline` | 2px dotted rgb(0, 69, 126) | 2px dotted rgb(154, 189, 245) | yes |
| `tag-bg` | rgb(237, 244, 255) | rgb(0, 31, 79) | yes |
| `tag-fg` | rgb(53, 95, 161) | rgb(118, 148, 207) | yes |
| `tag-bg-secondary` | rgb(70, 118, 191) | — | yes |
| `tag-fg-secondary` | rgb(255, 255, 255) | — | yes |
| `tag-border` | rgb(70, 118, 191) | — | yes |
| `chip-border-width` | 1px | — | yes |
| `chip-letter-spacing` | 0 | — | yes |
| `chip-cursor` | pointer | — | yes |
| `chip-cursor-disabled` | not-allowed | — | yes |
| `chip-disabled-opacity` | 0.4 | — | yes |
| `tag-radius` | 999px | — | yes |

**m3** — 36 light, 15 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `chip-bg` | transparent | — | yes |
| `chip-fg` | #1d1b20 | #e6e0e9 | yes |
| `chip-fg-variant` | #49454f | #cac4d0 | yes |
| `chip-border` | #79747e | #938f99 | yes |
| `chip-focus-border` | #1d1b20 | #e6e0e9 | yes |
| `chip-icon` | #6750a4 | #d0bcff | yes |
| `chip-icon-primary` | #6750a4 | #d0bcff | yes |
| `chip-icon-variant` | #49454f | #cac4d0 | yes |
| `chip-icon-selected` | #1d192b | #e8def8 | yes |
| `chip-trailing-color` | #49454f | #cac4d0 | yes |
| `chip-bg-selected` | #e8def8 | #4a4458 | yes |
| `chip-fg-selected` | #1d192b | #e8def8 | yes |
| `chip-bg-elevated` | #f7f2fa | #1d1b20 | yes |
| `chip-shadow-elevated` | 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15) | — | yes |
| `chip-shadow-elevated-hover` | 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15) | — | yes |
| `chip-focus-outline` | 3px solid #625b71 | 3px solid #ccc2dc | yes |
| `chip-disabled-fg` | #1d1b20 | #e6e0e9 | yes |
| `sl-color` | #1d1b20 | #e6e0e9 | yes |
| `chip-height` | 32px | — | yes |
| `chip-radius` | 8px | — | yes |
| `chip-border-width` | 1px | — | **no** |
| `chip-padding` | 0 16px | — | yes |
| `chip-padding-lead-icon` | 8px | — | yes |
| `chip-padding-trail-icon` | 8px | — | yes |
| `chip-gap` | 8px | — | yes |
| `chip-font` | 500 0.875rem/1.25rem Roboto, sans-serif | — | yes |
| `chip-tracking` | 0.00625rem | — | yes |
| `chip-icon-size` | 18px | — | yes |
| `chip-avatar-size` | 24px | — | yes |
| `chip-avatar-radius` | 9999px | — | yes |
| `chip-focus-offset` | 2px | — | yes |
| `chip-disabled-opacity` | 0.38 | — | yes |
| `chip-disabled-outline-opacity` | 0.12 | — | yes |
| `sl-hover` | 0.08 | — | yes |
| `sl-focus` | 0.12 | — | yes |
| `sl-pressed` | 0.12 | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.element` | structure | switchable | `button (Pill) / div (Tag)` | **off** | `[R] a button-like control` |
| 2 | `structure.leading-icon` | structure | switchable | **off** | **off** | `True` |
| 3 | `structure.avatar` | structure | switchable | **off** | **off** | `True` |
| 4 | `structure.selection-check` | structure | switchable | `True` | **off** | **off** |
| 5 | `structure.trailing` | structure | switchable | **off** | **off** | `True` |
| 6 | `structure.state-layer` | structure | switchable | **off** | **off** | `True` |
| 7 | `structure.selection-scope` | structure | switchable | `group` | **off** | `self` |
| 8 | `prop.interaction` | prop | switchable | `action, toggle, static` | **off** | `action, toggle` |
| 9 | `prop.kind` | prop | switchable | **off** | **off** | `assist, filter, input, suggestion` |
| 10 | `prop.elevation` | prop | switchable | **off** | **off** | `flat, elevated` |
| 11 | `prop.tag-variant` | prop | switchable | `primary, secondary` | **off** | **off** |
| 12 | `prop.bordered` | prop | switchable | `False, True` | **off** | **off** |
| 13 | `prop.selected` | prop | switchable | `False, True` | **off** | `False, True` |
| 14 | `prop.disabled` | prop | switchable | `False, True` | **off** | `False, True` |
| 15 | `behavior.role` | behavior | locked | `none as an action pill; role="checkbox" + aria-checked inside a selectable group; none at all for a Tag` | `NO COMPONENT — and therefore no role, no aria-checked and no aria-pressed. This is a locked row, so the question must be answered rather than left silent: shadcn/ui ships no chip, no tag and no pill (six-part proof in this file's provenance), so there is nothing to give semantics to. Its neighbours answer differently and are on other rows: badge.tsx writes data-slot and data-variant and no ARIA at all (docs/BADGE-MATRIX.md finding 2), and toggle.tsx delegates aria-pressed to Radix.` | `[R] button, and aria-pressed/aria-selected on the two toggle families` |
| 16 | `behavior.tab-stop` | behavior | locked | `0 on every pill, including every pill of a group; -1 when disabled; none for a Tag` | `NO COMPONENT — nothing to place in the tab order.` | `[R] 0` |
| 17 | `behavior.keyboard-activation` | behavior | locked | `Enter and Space natively for an action pill; SPACE ONLY inside a selectable group — Enter is explicitly preventDefault-ed` | `NO COMPONENT — no handler, no key contract, nothing to activate.` | `[R] Enter and Space` |
| 18 | `behavior.selection` | behavior | switchable | `multi-select only, owned by the group, toggling on click` | **off** | `per-chip, and it moves THREE properties` |
| 19 | `behavior.delete-affordance` | behavior | locked | `THE WHOLE PILL IS THE DELETE CONTROL — no nested focusable exists` | `NO COMPONENT, so shadcn ABSTAINS from the a11y fork. Worth stating explicitly because the fork has only two answers in this registry rather than three: Salt says do-not-nest (the whole pill is the delete control, one tab stop) and M3's spec says nest (a trailing remove button, two tab stops). The nearest shadcn code, ComboboxChipRemove, IS a nested focusable — but it belongs to combobox, on the input-group COMPONENTS.md row, and is excluded by the brief's tokenised-input rule.` | `[R] a nested trailing control, and this is the a11y fork` |
| 20 | `behavior.delete-keys` | behavior | switchable | **off** | **off** | **off** |
| 21 | `behavior.disabled-handling` | behavior | locked | `the NATIVE disabled attribute, plus a group-level disabled that ORs into it` | `NO COMPONENT — no disabled prop, no disabled selector, nothing to disable.` | `[R] the attribute; [S] two opacities` |
| 22 | `behavior.pressed-flag` | behavior | switchable | `TWO independent pressed flags, combined differently depending on whether the pill is selectable` | **off** | `[R] a ripple, standing in as a data flag` |
| 23 | `behavior.group-navigation` | behavior | switchable | **off** | **off** | **off** |
| 24 | `slot.label` | slot | locked | `arbitrary children in both components` | `NO COMPONENT — there is no label slot because there is no chip to put one in.` | `[R] arbitrary children` |
| 25 | `slot.leading` | slot | switchable | **off** | **off** | `True` |
| 26 | `slot.trailing` | slot | switchable | **off** | **off** | `True` |
| 27 | `slot.composes` | slot | default | `form-field, icon set, combo-box, badge` | **off** | `icon set, avatar, button` |
| 28 | `state.rest` | state | locked | `Pill: gray-500 fill, white label, a same-colour 1px border, nearly square. Tag: cobalt-100 fill, cobalt-600 label, a fully round 999px pill` | `NO COMPONENT — there is no resting appearance to describe. Every style row below is off for the same single reason, and each carries the same citation rather than being left blank, because CLAUDE.md law 3 makes a silent gap a failing build.` | `NO FILL AT ALL and a 1px outline-variant stroke — the chip is a hairline outline over the page` |
| 29 | `state.hover` | state | switchable | `Pill only — a 15% black wash over the same fill, the SAME label colour, and a border that recolours to a 30% contrast alpha` | **off** | `an on-surface state layer at 8%, and — on an elevated chip only — a lift from level1 to level2` |
| 30 | `state.focus` | state | switchable | `2px dotted accent-stronger at offset 0, PLUS the whole hover treatment` | **off** | `a 3px secondary outline at +2px offset, PLUS a stroke recolour, PLUS a 12% state layer — three simultaneous mechanisms` |
| 31 | `state.pressed` | state | switchable | `the pill INVERTS — a gray-200 fill with a BLACK label in light mode` | **off** | `a 12% state layer, and the elevated chip returns to its RESTING elevation` |
| 32 | `state.selected` | state | switchable | `NO SELECTED STYLE AT ALL on the chip — the entire selected signal is the check icon` | **off** | `secondary-container fill, on-secondary-container label, and the outline width drops to ZERO` |
| 33 | `state.disabled` | state | switchable | `40% opacity on the whole pill, the RESTING colours restated, and a not-allowed cursor` | **off** | `38% on the content, 12% on the stroke — two different opacities in one state` |
| 34 | `style.chip.background` | style | default | ⟡ `chip-bg` | **off** | ⟡ `chip-bg` |
| 35 | `style.chip.color` | style | default | ⟡ `chip-fg` | **off** | ⟡ `chip-fg` |
| 36 | `style.chip.font` | style | default | ⟡ `chip-font` | **off** | ⟡ `chip-font` |
| 37 | `style.chip.letter-spacing` | style | switchable | ⟡ `chip-letter-spacing` | **off** | ⟡ `chip-tracking` |
| 38 | `style.chip.shape` | style | default | ⟡ `chip-radius` | **off** | ⟡ `chip-radius` |
| 39 | `style.chip.height` | style | default | `height: var(--chip-height); min-height: var(--chip-min-height)` | **off** | `height: var(--chip-height)` |
| 40 | `style.chip.padding` | style | default | ⟡ `chip-padding` | **off** | ⟡ `chip-padding` |
| 41 | `style.chip.padding@with-leading` | style | switchable | — | **off** | ⟡ `chip-padding-lead-icon` |
| 42 | `style.chip.padding@with-trailing` | style | switchable | — | **off** | ⟡ `chip-padding-trail-icon` |
| 43 | `style.chip.gap` | style | switchable | ⟡ `chip-gap` | **off** | ⟡ `chip-gap` |
| 44 | `style.chip.border-width` | style | switchable | ⟡ `chip-border-width` | **off** | ⟡ `chip-border-width` |
| 45 | `style.chip.border-color` | style | switchable | ⟡ `chip-border` | **off** | ⟡ `chip-border` |
| 46 | `style.chip.overflow` | style | switchable | `hidden` | **off** | **off** |
| 47 | `style.chip.white-space` | style | switchable | `nowrap` | **off** | **off** |
| 48 | `style.chip.cursor` | style | switchable | ⟡ `chip-cursor` | **off** | **off** |
| 49 | `style.chip.transition` | style | switchable | **off** | **off** | **off** |
| 50 | `style.chip.elevation` | style | switchable | **off** | **off** | `none` |
| 51 | `style.chip.elevation@elevated` | style | switchable | **off** | **off** | `background: var(--chip-bg-elevated); box-shadow: var(--chip-shadow-elevated); border-width: 0` |
| 52 | `style.chip.kind@suggestion` | style | switchable | **off** | **off** | `--chip-fg: var(--chip-fg-variant); --chip-focus-border: var(--chip-fg-variant); --sl-color: var(--chip-fg-variant)` |
| 53 | `style.chip.kind@filter` | style | switchable | **off** | **off** | `--chip-fg: var(--chip-fg-variant); --chip-focus-border: var(--chip-fg-variant); --sl-color: var(--chip-fg-variant)` |
| 54 | `style.chip.kind@input` | style | switchable | **off** | **off** | `--chip-fg: var(--chip-fg-variant); --chip-focus-border: var(--chip-fg-variant); --sl-color: var(--chip-fg-variant); --chip-icon: var(--chip-icon-variant); --chip-icon-selected: var(--chip-icon-primary)` |
| 55 | `style.chip.tag-rest` | style | switchable | `background: var(--tag-bg); color: var(--tag-fg); border-radius: var(--tag-radius); padding: var(--tag-padding); border-color: transparent; cursor: auto` | **off** | **off** |
| 56 | `style.chip.tag-variant@secondary` | style | switchable | `background: var(--tag-bg-secondary); color: var(--tag-fg-secondary)` | **off** | **off** |
| 57 | `style.chip.bordered` | style | switchable | `border-color: var(--tag-border)` | **off** | **off** |
| 58 | `style.chip.elevation@hover` | style | switchable | **off** | **off** | ⟡ `chip-shadow-elevated-hover` |
| 59 | `style.chip.hover` | style | switchable | `background: var(--chip-bg-hover); color: var(--chip-fg-hover); border-color: var(--chip-border-hover)` | **off** | **off** |
| 60 | `style.chip.focus` | style | switchable | `outline: var(--chip-focus-outline); outline-offset: 0; background: var(--chip-bg-hover); color: var(--chip-fg-hover); border-color: var(--chip-border-hover)` | **off** | `outline: var(--chip-focus-outline); outline-offset: var(--chip-focus-offset); border-color: var(--chip-focus-border)` |
| 61 | `style.chip.pressed` | style | switchable | `background: var(--chip-bg-active); color: var(--chip-fg-active); border-color: var(--chip-border-active)` | **off** | **off** |
| 62 | `style.chip.selected` | style | switchable | **off** | **off** | `background: var(--chip-bg-selected); color: var(--chip-fg-selected); border-width: 0; --chip-icon: var(--chip-icon-selected)` |
| 63 | `style.chip.disabled` | style | switchable | `background: var(--chip-bg); color: var(--chip-fg); border-color: var(--chip-border); cursor: var(--chip-cursor-disabled); opacity: var(--chip-disabled-opacity)` | **off** | `color: color-mix(in srgb, var(--chip-disabled-fg) 38%, transparent); border-color: color-mix(in srgb, var(--chip-disabled-fg) 12%, transparent); box-shadow: none; --chip-icon: color-mix(in srgb, var(--chip-disabled-fg) 38%, transparent); --chip-trailing-color: color-mix(in srgb, var(--chip-disabled-fg) 38%, transparent)` |
| 64 | `style.leading.box` | style | switchable | **off** | **off** | `width: var(--chip-icon-size); height: var(--chip-icon-size)` |
| 65 | `style.leading.color` | style | switchable | **off** | **off** | ⟡ `chip-icon` |
| 66 | `style.leading.color@selected` | style | switchable | **off** | **off** | ⟡ `chip-icon-selected` |
| 67 | `style.avatar.box` | style | switchable | **off** | **off** | `width: var(--chip-avatar-size); height: var(--chip-avatar-size); border-radius: var(--chip-avatar-radius)` |
| 68 | `style.trailing.box` | style | switchable | **off** | **off** | `width: var(--chip-icon-size); height: var(--chip-icon-size)` |
| 69 | `style.trailing.color` | style | switchable | **off** | **off** | ⟡ `chip-trailing-color` |
| 70 | `style.check.box` | style | switchable | `width: var(--check-size); min-width: var(--check-size); height: var(--check-size); min-height: var(--check-size); border-width: var(--chip-border-width); border-style: solid; border-color: currentColor; border-radius: var(--chip-radius); position: relative; clip-path: border-box` | **off** | **off** |
| 71 | `style.state-layer.color` | style | switchable | **off** | **off** | ⟡ `sl-color` |
| 72 | `style.state-layer.opacity@hover` | style | switchable | **off** | **off** | ⟡ `sl-hover` |
| 73 | `style.state-layer.opacity@focus` | style | switchable | **off** | **off** | ⟡ `sl-focus` |
| 74 | `style.state-layer.opacity@pressed` | style | switchable | **off** | **off** | ⟡ `sl-pressed` |
| 75 | `style.group.box` | style | switchable | `gap: var(--group-gap); flex-wrap: wrap` | **off** | **off** |

<details><summary>Citations — 138 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.element` | salt | Pill.tsx returns <button type="button"> — Salt's chip is a real button element, not a div with a role. Tag.tsx returns a bare <div> with no role and no tabindex. Two exports, two elements, one COMPONENTS.md row |
| `structure.element` | shadcn | no component, no element |
| `structure.element` | m3 | material-web is tokens-only, so there is no element to read. The token set describes a control unambiguously — hover, focus, pressed and dragged state layers, a focus indicator, a disabled family — but nothing says which tag carries them |
| `structure.leading-icon` | salt | CORRECTED in the owner-validation pass. This was `true`, which is not what Salt ships. `PillProps extends ComponentPropsWithoutRef<"button">` and adds exactly one member, `value?: string` (Pill.tsx:21-23); the render body is `{insideSelectableGroup && <PillCheckIcon .../>}{children}` (Pill.tsx:149-151). There is no leading-icon slot, no adornment prop and no icon rule anywhere in Pill.css. Salt's  |
| `structure.leading-icon` | shadcn | CONFIRMED ABSENCE — see evidence 1-5 |
| `structure.leading-icon` | m3 | A real, sized, coloured, component-owned part in all four families: assist/filter `$with-icon-icon-size: 18px`, suggestion/input `$with-leading-icon-leading-icon-size: 18px`, each with its own enabled/hover/focus/pressed/disabled colour and its own leading-space of 8px in the hand-authored wrapper |
| `structure.avatar` | salt | CONFIRMED ABSENCE — no avatar rule, no avatar sizing and no round-image treatment in Pill.css or Tag.css. Salt ships an `avatar` component on its own COMPONENTS.md row and never composes it into a pill |
| `structure.avatar` | shadcn | CONFIRMED ABSENCE |
| `structure.avatar` | m3 | input-chip ONLY: `$with-avatar-avatar-size: 24px`, `$with-avatar-avatar-shape: corner-full`, `$with-avatar-disabled-avatar-opacity: 0.38`. A 24px circle where the leading icon is an 18px square — a genuinely different part, not a bigger icon |
| `structure.selection-check` | salt | PillCheckIcon.tsx/.css — a real, component-OWNED part, not a consumer child: Pill.tsx renders `{insideSelectableGroup && <PillCheckIcon checked={selected} active={combinedActive} />}` as the FIRST child. It is a square box with its own border and radius that fills with a checkmark, i.e. a visible CHECKBOX, and examples.mdx says so: 'A visible checkbox provides the user with a clear visual cue that |
| `structure.selection-check` | shadcn | CONFIRMED ABSENCE |
| `structure.selection-check` | m3 | OFF WITH A REASON, not an absence. The published M3 spec shows a selected filter chip swapping its leading icon for a checkmark, and the brief flagged that as a structural change — correctly. But the TOKEN SET does not encode it: filter-chip declares only that the leading icon RECOLOURS on selection ($with-leading-icon-selected-leading-icon-color: on-secondary-container). There is no checkmark tok |
| `structure.trailing` | salt | CONFIRMED ABSENCE — see the no-trailing-part provenance entry. Salt's closable pill is a close ICON inside the button, not a nested control, and the pill's own onClick is the remove handler |
| `structure.trailing` | shadcn | CONFIRMED ABSENCE. The nearest thing in the clone is ComboboxChipRemove, a part of combobox — out of scope by the brief's tokenised-input exclusion and on the `input-group` COMPONENTS.md row |
| `structure.trailing` | m3 | filter-chip and input-chip only, each with a full `$with-trailing-icon-*` family (18px on input, colours for every state on both) and an 8px trailing-space in the wrapper. Assist and suggestion have no trailing token of any kind. WHAT the trailing control DOES is [R]: the spec makes input-chip's a remove affordance and filter-chip's a dropdown arrow, but the tokens say only 'trailing icon' |
| `structure.state-layer` | salt | CONFIRMED ABSENCE — Salt moves the fill, the label and the border colour directly; there is no overlay element and no opacity scale (docs/foundations/state-layers.md: 'Salt's hover/selected states are pre-composed solid colors') |
| `structure.state-layer` | shadcn | CONFIRMED ABSENCE — shadcn has no state-layer mechanism in any component (docs/foundations/state-layers.md) |
| `structure.state-layer` | m3 | All four files carry hover/focus/pressed/dragged state-layer colour+opacity pairs over on-surface or on-surface-variant. The only system of the three with one (docs/foundations/state-layers.md) |
| `structure.selection-scope` | salt | SELECTION LIVES IN THE GROUP, NOT THE CHIP. Pill.tsx reads `usePillGroup()` and computes `insideSelectableGroup = pillGroupContext.selectionVariant === "multiple"`; a Pill outside a group, or inside a group with the default selectionVariant="none", has NO role, NO aria-checked and NO check icon, and passing `value` to it does nothing. PillGroup owns the controlled/uncontrolled `selected: string[]` |
| `structure.selection-scope` | shadcn | CONFIRMED ABSENCE |
| `structure.selection-scope` | m3 | [R] as a DOM claim, [S] as a token claim: filter-chip and input-chip carry `selected-*` and `unselected-*` token families on the CHIP ITSELF, and no file in the set declares a chip-set, chip-group or selection-container token. So M3 puts selection on the chip where Salt puts it on the group — a real structural divergence, not a naming one |
| `prop.interaction` | salt | SOURCE-DEFAULT-FIRST. `action` = a bare <Pill onClick>, which is what the Default story and index.mdx open with and what PillGroup's own `selectionVariant = "none"` default produces. `toggle` = the same Pill inside selectionVariant="multiple" (role=checkbox, aria-checked, the check icon). `static` = Tag, a div with no interaction of any kind. An action-first list matters: a toggle-first list would |
| `prop.interaction` | shadcn | CONFIRMED ABSENCE — there is no component to carry an interaction axis |
| `prop.interaction` | m3 | SOURCE-DEFAULT-FIRST, and the default is derivable rather than declared. `action` covers assist-chip and suggestion-chip, whose label/state-layer tokens are UNQUALIFIED (`$label-text-color`, `$hover-state-layer-color`) — i.e. there is no selection axis to qualify them with. `toggle` covers filter-chip and input-chip, every one of whose colour tokens is prefixed `selected-` or `unselected-`. Action |
| `prop.kind` | salt | CONFIRMED ABSENCE — Salt has no assist/filter/input/suggestion axis. PillProps is exactly `{ value?: string }` on top of the native button props; the job of the chip is decided by the group it is in, not by a kind prop |
| `prop.kind` | shadcn | CONFIRMED ABSENCE |
| `prop.kind` | m3 | THE FAMILY, MODELLED AS ONE AXIS. No source default exists — nothing in the four files or the four wrappers marks one as primary — so the list is in the spec's own published order and the absence is recorded rather than a default invented, exactly as card.m3.json did for elevated/filled/outlined. `assist` is nonetheless the defensible value[0]: it is the family whose enabled-state tokens are entir |
| `prop.elevation` | salt | CONFIRMED ABSENCE — see the no-elevation provenance entry |
| `prop.elevation` | shadcn | CONFIRMED ABSENCE |
| `prop.elevation` | m3 | SOURCE-DEFAULT-FIRST, and source says so twice. (1) All four hand-authored wrappers RENAME the flat-* tokens to their unprefixed forms — 'flat-container-elevation' -> 'container-elevation', 'flat-outline-color' -> 'outline-color', 'flat-outline-width' -> 'outline-width' — citing b/275577569 'Remove flat-* prefix', i.e. the library treats flat as the un-suffixed base. (2) input-chip's tokens are AL |
| `prop.tag-variant` | salt | Tag.tsx `variant = "primary"` is the literal declared default, so the list is SOURCE-DEFAULT-FIRST. Only meaningful when interaction="static"; a Pill has no variant |
| `prop.tag-variant` | shadcn | CONFIRMED ABSENCE |
| `prop.tag-variant` | m3 | Salt-only axis. M3 has no read-only chip and no categorical colour scale |
| `prop.bordered` | salt | Tag.tsx `bordered?: boolean` destructured with NO default, i.e. undefined/false. CAPABILITY LIST, not an ordered enum: false is the base rendering and the skeleton reads the per-instance prop, never value[0] — the same declaration card.salt.json made for `disabled` and `hoverable` |
| `prop.bordered` | shadcn | CONFIRMED ABSENCE |
| `prop.bordered` | m3 | Not an axis here — the 1px stroke is UNCONDITIONAL on a flat chip and absent on an elevated one, so 'bordered' is what prop.elevation already decides. Modelling it separately would have double-counted the same property |
| `prop.selected` | salt | CAPABILITY LIST. Not a Pill prop at all — `selected` is derived in Pill.tsx from `pillGroupContext.selected.includes(value)`, so the chassis takes it as an instance prop and the column declares only that the capability exists |
| `prop.selected` | shadcn | CONFIRMED ABSENCE |
| `prop.selected` | m3 | CAPABILITY LIST, not an ordered enum — false is the base rendering and the skeleton reads the per-instance prop, never value[0]. Available on filter-chip and input-chip only; on assist and suggestion there is nothing to select |
| `prop.disabled` | salt | CAPABILITY LIST. Pill inherits `disabled` from ComponentPropsWithoutRef<"button"> and PillGroup has its own `disabled` that ORs into it (`const disabled = pillGroupContext.disabled \|\| buttonDisabled`). Tag has no disabled state at all |
| `prop.disabled` | shadcn | CONFIRMED ABSENCE |
| `prop.disabled` | m3 | CAPABILITY LIST. A complete disabled family in all four files at two opacities (0.38 label/icon/avatar, 0.12 outline or selected container) |
| `behavior.role` | salt | Pill.tsx `groupProps = insideSelectableGroup ? { "aria-checked": selected, role: "checkbox", value } : {}` — the ARIA is written ONLY inside a multiple-selection group. An action pill relies on the native <button> semantics and writes no ARIA of its own. Tag.tsx writes className and spreads rest and nothing else. PillGroup renders a <fieldset> and writes aria-labelledby / aria-describedby from the |
| `behavior.role` | shadcn | CONFIRMED ABSENCE. Evidence: (1) ls of ui/apps/v4/registry/new-york-v4/ui/ = 63 files, no chip/tag/pill; (2) find over the whole clone for *chip*/*pill*/*tag*.tsx = nothing; (3) every 'chip' string in apps/v4 is ComboboxChip*/.cn-combobox-chip* or the word 'microchip' in lorem-ipsum task data; (4) no chip.mdx/tag.mdx/pill.mdx in any of the three docs bases; (5) zero chip/pill hits in _registry.ts; |
| `behavior.role` | m3 | No element exists. Recorded as [R] and computed from config in the chassis so the inference is a matrix cell rather than a hardcode. The token set's own evidence for 'this is a control' is unusually strong: four state layers, a focus indicator and a disabled family in every one of the four files |
| `behavior.tab-stop` | salt | Pill.tsx deliberately DISCARDS useButton's tabIndex — `const { tabIndex: _tabIndex, disabled: buttonDisabled, ...restButtonProps } = buttonProps` with the comment 'we do not want to spread tab index in this case because the button element does not require tabindex="0" attribute'. So the native button's own tab stop is used, there is NO roving tabindex, and accessibility.mdx confirms the consequenc |
| `behavior.tab-stop` | shadcn | CONFIRMED ABSENCE. Evidence: (1) ls of ui/apps/v4/registry/new-york-v4/ui/ = 63 files, no chip/tag/pill; (2) find over the whole clone for *chip*/*pill*/*tag*.tsx = nothing; (3) every 'chip' string in apps/v4 is ComboboxChip*/.cn-combobox-chip* or the word 'microchip' in lorem-ipsum task data; (4) no chip.mdx/tag.mdx/pill.mdx in any of the three docs bases; (5) zero chip/pill hits in _registry.ts; |
| `behavior.tab-stop` | m3 | Implied by the focus ring. NOTE the evidence changed with the v0.192 pin: the chip's own focus-indicator family is latest-only and absent from the pinned edition, so the argument now rests on the focus-state-layer family (present in all four v0.192 files) plus material-web shipping an md-focus-ring element whose tokens this column now cites. Weaker evidence, same conclusion, flagged rather than qu |
| `behavior.keyboard-activation` | salt | Pill.tsx handleKeyDown: `if (event.key === "Enter" && insideSelectableGroup) { /* Prevent selection on enter key for selectable pill. */ event.preventDefault(); return; }`. accessibility.mdx states both halves in two separate KeyboardControls blocks: 'Enter / Space' for a Pill, and 'Space' alone for a pill within a selectable group. A boolean interactive flag would have destroyed this fork exactly |
| `behavior.keyboard-activation` | shadcn | CONFIRMED ABSENCE. Evidence: (1) ls of ui/apps/v4/registry/new-york-v4/ui/ = 63 files, no chip/tag/pill; (2) find over the whole clone for *chip*/*pill*/*tag*.tsx = nothing; (3) every 'chip' string in apps/v4 is ComboboxChip*/.cn-combobox-chip* or the word 'microchip' in lorem-ipsum task data; (4) no chip.mdx/tag.mdx/pill.mdx in any of the three docs bases; (5) zero chip/pill hits in _registry.ts; |
| `behavior.keyboard-activation` | m3 | [R] — no element, no handler, no key token. Carried as the platform default for the button role the token set implies. Contrast Salt, which really does preventDefault Enter on a selectable pill: the two columns differ here on a value one of them cannot source, and that is stated rather than smoothed |
| `behavior.selection` | salt | PillGroup.tsx `selectionVariant?: "none" \| "multiple"` — there is NO single-select mode, which is why the pill's role is `checkbox` and never `radio`. `select` filters the value out if present and concatenates it if not, so every click is a toggle; the group is controlled-or-uncontrolled through useControlled |
| `behavior.selection` | shadcn | CONFIRMED ABSENCE |
| `behavior.selection` | m3 | [S] as a style claim: filter-chip and input-chip both swap the container colour to secondary-container, the label to on-secondary-container, AND the outline width from 1px to 0px (`$flat-selected-outline-width: 0px`, `$selected-outline-width: 0px`). Selecting an M3 chip changes the MECHANISM by which it is separated from the page — stroke becomes fill — which is the lesson-6 fork appearing a secon |
| `behavior.delete-affordance` | salt | stories/pill/pill.stories.tsx `Closable`: `<Pill onClick={() => removeColor(color)}>{color} <CloseIcon style={{ marginLeft: "auto" }} /></Pill>`. The close glyph is a decorative child of the button, pushed right by a consumer inline style; there is no second tab stop and no second click target. examples.mdx describes it the same way. Salt therefore answers the nested-focusable a11y fork with 'do n |
| `behavior.delete-affordance` | shadcn | CONFIRMED ABSENCE. Evidence: (1) ls of ui/apps/v4/registry/new-york-v4/ui/ = 63 files, no chip/tag/pill; (2) find over the whole clone for *chip*/*pill*/*tag*.tsx = nothing; (3) every 'chip' string in apps/v4 is ComboboxChip*/.cn-combobox-chip* or the word 'microchip' in lorem-ipsum task data; (4) no chip.mdx/tag.mdx/pill.mdx in any of the three docs bases; (5) zero chip/pill hits in _registry.ts; |
| `behavior.delete-affordance` | m3 | [S]: input-chip and filter-chip carry a `with-trailing-icon-*` family with its own 8px trailing-space and its own enabled/hover/focus/pressed/disabled colours. [R]: whether that trailing icon is a SEPARATE FOCUSABLE inside the chip. The published spec makes input-chip's trailing icon a remove button, which would make it a nested tab stop — the opposite of Salt, where the whole pill IS the delete c |
| `behavior.delete-keys` | salt | CONFIRMED ABSENCE — see the no-delete-keys provenance entry. Because the whole pill is the delete control, the delete key IS Enter/Space, and no Delete or Backspace handler exists in pill/ or tag/. Salt's Backspace/Delete contract lives entirely in pill-input and tokenized-input, which are on a different COMPONENTS.md row |
| `behavior.delete-keys` | shadcn | CONFIRMED ABSENCE — off in all three columns; see the matrix's finding on it |
| `behavior.delete-keys` | m3 | CONFIRMED ABSENCE in the clone. No key contract can be sourced from a tokens-only checkout, and the spec's Delete/Backspace behaviour for input chips is not in any token file. Off in every column — see the Salt column, which has a real Backspace/Delete handler but only inside pill-input, on a different COMPONENTS.md row |
| `behavior.disabled-handling` | salt | Pill.tsx `disabled = pillGroupContext.disabled \|\| buttonDisabled` written straight onto <button disabled>, and useButton returns `disabled: disabled && !focusableWhenDisabled` (Pill never passes focusableWhenDisabled, so it is always the native attribute) with `tabIndex: -1`. Note the divergence from card: an InteractableCard uses aria-disabled and stays focusable; a Pill uses the native attribu |
| `behavior.disabled-handling` | shadcn | CONFIRMED ABSENCE. Evidence: (1) ls of ui/apps/v4/registry/new-york-v4/ui/ = 63 files, no chip/tag/pill; (2) find over the whole clone for *chip*/*pill*/*tag*.tsx = nothing; (3) every 'chip' string in apps/v4 is ComboboxChip*/.cn-combobox-chip* or the word 'microchip' in lorem-ipsum task data; (4) no chip.mdx/tag.mdx/pill.mdx in any of the three docs bases; (5) zero chip/pill hits in _registry.ts; |
| `behavior.disabled-handling` | m3 | [S]: 0.38 on the label, the leading icon, the trailing icon and the avatar; 0.12 on the outline (unselected) or on the container (elevated and selected). [R]: which DOM mechanism carries it |
| `behavior.pressed-flag` | salt | Pill.tsx holds `pressActive` (set on pointerdown, cleared by a window-level pointerup/pointercancel listener in a useEffect) and `spaceActive` (set on Space keydown, cleared on Space keyup) alongside useButton's own `active`. `combinedActive = insideSelectableGroup ? pressActive \|\| spaceActive : pressActive \|\| active` — a selectable pill deliberately drops useButton's `active` so that Enter, w |
| `behavior.pressed-flag` | shadcn | CONFIRMED ABSENCE |
| `behavior.pressed-flag` | m3 | M3's pressed state is a RIPPLE in the real library, which a tokens-only clone cannot supply. The chassis drives the pressed state layer from a data-active flag instead — the VALUES are [S] ($pressed-state-layer-opacity 0.1), the TRIGGER is [R]. Identical treatment and identical wording to card.m3.json's declared approximation 3 |
| `behavior.group-navigation` | salt | CONFIRMED ABSENCE — PillGroup binds NO arrow-key handler. Every pill is a tab stop (see behavior.tab-stop), so navigation is Tab and Shift+Tab only. This is the opposite of InteractableCardGroup, which is a roving-tabindex radiogroup with arrow navigation — two groups in one design system with two different navigation contracts |
| `behavior.group-navigation` | shadcn | CONFIRMED ABSENCE |
| `behavior.group-navigation` | m3 | CONFIRMED ABSENCE — see the no-group-token provenance entry. M3 tokenises the chip and never the row of chips, so there is nothing to navigate between |
| `slot.label` | salt | Neither Pill nor Tag formats or clamps anything, in deliberate contrast to Badge's `value`/`max`. usage.mdx handles length in prose instead: 'Content should be succinct, often one or a couple of words' (Pill) and 'limiting to one or two words' (Tag) |
| `slot.label` | shadcn | CONFIRMED ABSENCE. Evidence: (1) ls of ui/apps/v4/registry/new-york-v4/ui/ = 63 files, no chip/tag/pill; (2) find over the whole clone for *chip*/*pill*/*tag*.tsx = nothing; (3) every 'chip' string in apps/v4 is ComboboxChip*/.cn-combobox-chip* or the word 'microchip' in lorem-ipsum task data; (4) no chip.mdx/tag.mdx/pill.mdx in any of the three docs bases; (5) zero chip/pill hits in _registry.ts; |
| `slot.label` | m3 | label-text-* describes the TYPE of a label and says nothing about where the string comes from — the same reading badge.m3.json took |
| `slot.leading` | salt | CORRECTED alongside structure.leading-icon, same evidence: no leading slot exists in PillProps or Pill.tsx's render body. |
| `slot.leading` | shadcn | CONFIRMED ABSENCE |
| `slot.leading` | m3 | DECLARED COMPOSITION to an icon set (all four families) and, on input-chip, to `avatar`, which has its own COMPONENTS.md row. Rendered as neutral placeholders |
| `slot.trailing` | salt | no trailing part; the closable pattern's CloseIcon is a leading-slot sibling pushed right with a consumer margin-left: auto |
| `slot.trailing` | shadcn | CONFIRMED ABSENCE |
| `slot.trailing` | m3 | DECLARED COMPOSITION to an icon set and, per the spec, to `button` — the remove control on an input chip. Rendered as a neutral placeholder inside a real nested button |
| `slot.composes` | salt | DECLARED COMPOSITION: (a) FORM-FIELD — PillGroup calls useFormFieldProps() and merges the field's aria-labelledby/aria-describedby and disabled state, and examples.mdx recommends wrapping selectable groups in one; (b) an ICON SET — the leading glyph and the closable pattern's CloseIcon; (c) COMBO-BOX — examples.mdx routes the closable pill 'within an input control such as ComboBox'; (d) BADGE, alr |
| `slot.composes` | shadcn | CONFIRMED ABSENCE |
| `slot.composes` | m3 | DECLARED COMPOSITION: (a) an ICON SET for both the leading and trailing glyphs; (b) AVATAR, whose 24px corner-full circle input-chip sizes and shapes itself; (c) BUTTON for the trailing remove control [R]. All neutral placeholders |
| `state.rest` | salt | Two components on one row and they share nothing but their height, their gap and their type |
| `state.rest` | shadcn | CONFIRMED ABSENCE. Evidence: (1) ls of ui/apps/v4/registry/new-york-v4/ui/ = 63 files, no chip/tag/pill; (2) find over the whole clone for *chip*/*pill*/*tag*.tsx = nothing; (3) every 'chip' string in apps/v4 is ComboboxChip*/.cn-combobox-chip* or the word 'microchip' in lorem-ipsum task data; (4) no chip.mdx/tag.mdx/pill.mdx in any of the three docs bases; (5) zero chip/pill hits in _registry.ts; |
| `state.rest` | m3 | The most surprising cell in this column, and it is a confirmed absence rather than an omission: there is no flat unselected container-color token in any of the four files |
| `state.hover` | salt | Pill.css `.saltPill-clickable:hover, .saltPill-clickable:focus-visible` — hover and focus-visible share ONE declaration block, so a keyboard-focused Salt pill is styled as hovered and additionally gets the focus outline. Tag has no hover |
| `state.hover` | shadcn | CONFIRMED ABSENCE |
| `state.hover` | m3 | $hover-state-layer-opacity 0.08 in versions/v0_192/_md-sys-state.scss — identical in both editions, so unlike focus and pressed the pin does not move it; $elevated-hover-container-elevation level2. The LABEL colour does not move either: $hover-label-text-color resolves to the same role as the resting one in every family |
| `state.focus` | salt | Pill.css declares the outline on `.saltPill:focus-visible` (the unqualified class, so it would apply to a non-clickable pill too — but every Pill is rendered with saltPill-clickable, so the distinction is unreachable). Tag is never focusable |
| `state.focus` | shadcn | CONFIRMED ABSENCE |
| `state.focus` | m3 | the focus ring, now sourced from the edition-independent tokens/_md-comp-focus-ring.scss ($width 3px, $color secondary, $outward-offset 2px) because the chip's own focus-indicator family is latest-only and absent from versions/v0_192, $flat-focus-outline-color (on-surface for assist, on-surface-variant for the rest), $focus-state-layer-opacity 0.12 (v0.192 value; was 0.1 under latest). And the ele |
| `state.pressed` | salt | Pill.css `.saltPill-clickable.saltPill-active, .saltPill-clickable:active` share one block, exactly as InteractableCard does and for the same reason: a keyboard activation never produces :active |
| `state.pressed` | shadcn | CONFIRMED ABSENCE |
| `state.pressed` | m3 | $pressed-state-layer-opacity 0.12 in versions/v0_192/_md-sys-state.scss — VALUE CHANGED BY THE PIN, was 0.1 under versions/latest/sass, and 0.12 is what docs/foundations/state-layers.md tabulates; $elevated-pressed-container-elevation level1 |
| `state.selected` | salt | THE FINDING OF THIS COLUMN'S STATE SEGMENT. Pill.css contains no `-selected` selector, no `[aria-checked]` selector and no `selectable-*` characteristic reference; a selected Salt pill's fill, label and border are byte-identical to an unselected one. The only difference is that PillCheckIcon renders a CheckmarkSolidIcon inside its box. Compare M3, where selection swaps the container colour, the la |
| `state.selected` | shadcn | CONFIRMED ABSENCE |
| `state.selected` | m3 | The fullest selected state of the three systems, against Salt's — which changes nothing on the chip at all |
| `state.disabled` | salt | Pill.css `.saltPill:disabled, .saltPill:disabled:hover` re-declares all three resting indirections inside the disabled block so the hover rule cannot win — the same defensive restatement card.salt.json recorded. Tag has no disabled state |
| `state.disabled` | shadcn | CONFIRMED ABSENCE |
| `state.disabled` | m3 | $disabled-label-text-opacity 0.38 with $flat-disabled-outline-opacity 0.12. Reproduced faithfully with two color-mix() expressions rather than one blanket opacity, so the stroke really does sit at 12% and not at 38% |
| `style.chip.height` | salt | Pill.css and Tag.css both `height: calc(var(--salt-size-base) - var(--salt-spacing-100)); min-height: var(--salt-text-minHeight)` — byte-identical declarations in the two files |
| `style.chip.height` | m3 | $container-height: 32px. No min-height token exists, unlike Salt, which declares both |
| `style.chip.overflow` | salt | Pill.css `overflow: hidden` and Tag.css `overflow: hidden` — both. A long Salt chip label is CLIPPED, with no ellipsis, at the chip's own radius |
| `style.chip.overflow` | m3 | CONFIRMED ABSENCE — see the no-overflow-token provenance entry |
| `style.chip.white-space` | salt | Pill.css `white-space: nowrap`. Tag.css does NOT declare it and relies on `min-width: max-content` instead — two files, two mechanisms for the same intent |
| `style.chip.white-space` | m3 | CONFIRMED ABSENCE — no token |
| `style.chip.cursor` | m3 | CONFIRMED ABSENCE — see the no-cursor-token provenance entry |
| `style.chip.transition` | salt | CONFIRMED ABSENCE — see the no-transition provenance entry |
| `style.chip.transition` | m3 | CONFIRMED ABSENCE — see the no-motion-token provenance entry |
| `style.chip.elevation` | salt | CONFIRMED ABSENCE — see the no-elevation provenance entry |
| `style.chip.elevation` | m3 | $flat-container-elevation: md-sys-elevation.$level0 (input: $container-elevation: level0). Declared rather than left off, because level0 is a real sourced value and because the @elevated block needs a base to override |
| `style.chip.elevation@elevated` | m3 | THE LESSON-6 MECHANISM ROW. $elevated-container-color surface-container-low + $elevated-container-elevation level1, and NO elevated outline token exists in any of the four files — so switching to elevated does not thicken or recolour a stroke, it DELETES the stroke and replaces it with a shadow. Shadow-versus-stroke, exactly as card's elevated-versus-outlined, and modelled as structure rather than |
| `style.chip.kind@suggestion` | m3 | suggestion-chip is assist-chip with ONE role substituted: a normalized value diff of the two files finds them identical except that every on-surface becomes on-surface-variant (label, hover/focus/pressed/dragged label and state layer, flat-focus-outline) and the icon family is renamed with-icon-* -> with-leading-icon-*. Same height, same shape, same typescale, same icon size, same icon colour (pri |
| `style.chip.kind@filter` | m3 | $unselected-label-text-color and $flat-unselected-focus-outline-color -> on-surface-variant, and the unselected state layers likewise. AT REST, FLAT AND UNSELECTED, A FILTER CHIP AND A SUGGESTION CHIP ARE BYTE-IDENTICAL — stated rather than hidden. They are discriminated instead by three real things: filter has a selected state (three properties, style.chip.selected), filter has a trailing icon pa |
| `style.chip.kind@input` | m3 | The most divergent of the four. Its unselected LEADING ICON is on-surface-variant where every other family's is primary, and its SELECTED leading icon is primary where filter's is on-secondary-container — the two families invert each other on that one part. It is also the only family with an avatar, the only one with no elevated tokens, and the only one whose selection tokens are unprefixed by `fl |
| `style.chip.tag-rest` | salt | Tag.css `.saltTag` + `.saltTag-primary`. THE ROW THAT CARRIES THE WHOLE STATIC FORK: a Tag is a different radius (999px against the Pill's 1-4px), a different padding (spacing-25/spacing-100 against 0/spacing-50-1px), a different colour family (categorical against actionable-bold) and a transparent border. Emitted as one block gated on [data-interaction="static"] rather than as six state-qualified |
| `style.chip.tag-rest` | m3 | no read-only chip in M3; every one of the four families is a control |
| `style.chip.tag-variant@secondary` | salt | Tag.css `.saltTag-secondary { background: var(--tag-secondary-background, var(--salt-category-1-bold-background)); color: var(--salt-content-bold-foreground) }`. The border is transparent in both variants unless `bordered` is set |
| `style.chip.bordered` | salt | Tag.css `.saltTag-bordered { border: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--tag-primary-borderColor, ...) }`. Only the colour is modelled here because the 1px solid is already carried by style.chip.border-width; the static variant's own border is `1px solid transparent`, so `bordered` really does change one property |
| `style.chip.hover` | salt | Pill.css `.saltPill-clickable:hover, .saltPill-clickable:focus-visible { --pill-color/-background/-borderColor: ...-hover }`. Reassigns three indirections; note that --pill-color-hover resolves to the same value as the resting colour |
| `style.chip.hover` | m3 | CONFIRMED ABSENCE ON THE CONTAINER, and worth stating: $hover-label-text-color resolves to the SAME colour role as the resting label in every one of the four families, and there is no hover container-color, hover outline-color or hover border token. An M3 chip's entire hover response is its state layer (style.state-layer.opacity@hover) plus, if elevated, its shadow |
| `style.chip.focus` | salt | Two source rules combined onto one selector: `.saltPill:focus-visible { outline: var(--salt-focused-outline) }` plus the hover block, which lists `.saltPill-clickable:focus-visible` alongside `:hover`. Combining them is faithful because in source both fire on the same element in the same state |
| `style.chip.focus` | m3 | Two sourced mechanisms on one selector: the focus ring re-pointed to tokens/_md-comp-focus-ring.scss (the chip's own focus-indicator triple is latest-only and absent from versions/v0_192; the values are identical) and $flat-focus-outline-color, which recolours the 1px stroke. On an elevated chip the border-width is 0, so the recolour is invisible there — the correct outcome, and the same 'invisibl |
| `style.chip.pressed` | salt | Pill.css `.saltPill-clickable.saltPill-active, .saltPill-clickable:active`. SCOPE TRIM, recorded not modelled: Pill.css declares a fourth selector with the identical body — `.saltPill[aria-expanded="true"][aria-haspopup="menu"]` — which styles a pill that is currently opening a menu as pressed. That is a `menu` composition and belongs to the menu row |
| `style.chip.pressed` | m3 | CONFIRMED ABSENCE ON THE CONTAINER — $pressed-label-text-color matches the resting role, and no pressed container-color or outline token exists. The pressed response is the state layer plus, on an elevated chip, the return to level1 (declared, not modelled: it equals the resting shadow, so no rule is needed) |
| `style.chip.selected` | salt | CONFIRMED ABSENCE, and it is a real divergence rather than a gap — see state.selected. Selection is signalled by the check icon alone |
| `style.chip.selected` | m3 | $flat-selected-container-color / $selected-container-color -> secondary-container; $selected-label-text-color -> on-secondary-container; $flat-selected-outline-width / $selected-outline-width -> 0px; $with-leading-icon-selected-leading-icon-color -> on-secondary-container. The --chip-icon reassignment is DECLARED ON THE CHIP so the leading-icon child inherits it (lesson 2: the var is read on [data |
| `style.chip.disabled` | salt | Pill.css `.saltPill:disabled, .saltPill:disabled:hover` — the resting values are RESTATED so the hover rule cannot win, then dimmed to 0.4 |
| `style.chip.disabled` | m3 | TWO OPACITIES, REPRODUCED AS TWO. $disabled-label-text-opacity 0.38 on the content (label, leading icon, trailing icon, avatar) and $flat-disabled-outline-opacity 0.12 on the stroke. A single blanket `opacity: 0.38` on the chip — the shape Salt's disabled rule really does take — would have put the stroke at 38% instead of 12%. DECLARED APPROXIMATION: the selected+disabled case ($flat-disabled-sele |
| `style.leading.box` | salt | CONFIRMED ABSENCE — the leading glyph is a consumer child sized by Salt's own Icon component (--saltIcon-size), not by the chip. The chip owns only the gap |
| `style.leading.box` | m3 | 18px square, all four families, both editions, density-invariant (M3 has no density capability — docs/foundations/density.md) |
| `style.leading.color` | salt | CONFIRMED ABSENCE — no icon colour rule; the glyph inherits the label colour, which is why a pressed Salt pill's icon inverts with its text |
| `style.avatar.box` | m3 | input-chip $with-avatar-avatar-size 24px + $with-avatar-avatar-shape corner-full. Note it is TALLER than the 18px leading icon and only 8px short of the 32px chip, so an avatar chip is nearly filled edge to edge on the block axis |
| `style.trailing.box` | m3 | input-chip $with-trailing-icon-trailing-icon-size 18px; filter-chip declares colours for a trailing icon but no size of its own, so it inherits the 18px $with-icon-icon-size — recorded |
| `style.check.box` | salt | PillCheckIcon.css in full. Two details are load-bearing and easy to lose: the border declares NO colour (`border: var(--salt-size-fixed-100) var(--salt-borderStyle-solid)`), so it is currentColor and tracks the label through every state including the pressed inversion; and `clip-path: border-box` is used INSTEAD of overflow:hidden, with a source comment saying why — 'Using overflow:hidden here cau |
| `style.check.box` | m3 | see structure.selection-check — no checkmark part is tokenised |
| `style.state-layer.opacity@focus` | m3 | CARRIED WITH A DISOWNMENT: all four hand-authored wrappers list focus-state-layer-color and focus-state-layer-opacity under $unsupported-tokens, so the shipped library draws a focus INDICATOR but no focus state layer. The generated value is taken and the disagreement recorded — the sixth time this pipeline has hit it |
| `style.group.box` | salt | PillGroup.css in full: `border: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: var(--salt-spacing-50)`. The reset half lives in the chassis base because it is a <fieldset> reset and theme-invariant; only the two real values are carried here |
| `style.group.box` | m3 | CONFIRMED ABSENCE — see the no-group-token provenance entry. Left visible in the harness rather than borrowed |

</details>

<!-- END GENERATED VALUES -->
