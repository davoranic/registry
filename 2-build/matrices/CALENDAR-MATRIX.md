# Calendar / date picker — component template matrix

> **⚠ READ BEFORE TRUSTING — the pilot built from this matrix was deleted
> as retrofit (2026-08-01), and the failure is the document's most
> important content.** The style cells below were largely faithful; the
> pilot still looked like "one calendar in three color schemes" because
> **character lives in structure and content formatting as much as in
> CSS**, and the pilot inherited a shadcn-derived skeleton that silently
> imposed its nav layout, weekday names, and day-number format on every
> column. Verified against the owner's reference screenshots of the real
> systems: Salt's calendar has month+year dropdowns (flush bottom-border),
> zero-padded `01` days, single-letter weekdays, muted (not hidden)
> outside days, dotted focus outline. M3's picker has its "Select date"
> header with headline + input-mode pencil toggle, a month dropdown,
> Cancel/OK action buttons, single-letter weekdays. **Any future build:
> the skeleton must be generated from this template's part union with
> content-format parameters (weekday format, day-number format,
> nav variant, outside-day policy) as first-class switchable rows — and a
> row a column turns on that the implementation cannot express is a
> FAILING build, never a silent fallback.**

*The first concrete instance of the component-template model: one master
template (union of all six pieces across systems), columns per design system,
rows switched on/off/inherited per column. Test artifact — nothing here is
built; this is the matrix the generator would consume.*

**Cell legend** · `⟡ slot` = alias to shared contract slot (Figma: variable
alias) · **bold** = the system's own switch (Figma: detached override) ·
`x-ds:` = system's native token, no shared slot yet (stays in its column
until promoted) · `OFF` = row switched off in this column · `INHERIT` =
system silent, registry default applies (labeled) · `[S]` = value extracted
from source this session · `[R]` = from the research pass, needs an
extraction re-check before build.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default (must have a
value; silence inherits, labeled).

**Naming rule — what to call a row.** One row is one **attribute**: an
addressable characteristic of a part, in a state, belonging to one of the
six pieces (structure/behavior/prop/slot/state/style). "The weekday's font"
is the `weekday.font` attribute; "the day's corner radius" is the
`day.shape` attribute. Grammar: `<piece>.<part>[.<subpart>].<property>[@state]`
— enforced by `contract/template.schema.json`'s `row.id` pattern. Don't say
"token" for a row (a token is a *resolved value*, i.e. a cell); don't say
"attribute" for a DOM hook (`data-slot`, `data-range`) — always say **"data
attribute"** for those, to keep the two apart.

Sources: salt-ds clone `packages/date-components/src/calendar/*` [S];
`ui/apps/v4/registry/new-york-v4/ui/calendar.tsx` [S]; material-web /
androidx `date-picker` token files [R].

---

## 1 · Structure (parts) — Figma: the layers panel

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| root | 🔒 | on | on | on |
| navigation (prev / next / caption) | 🔒 | on | on | on |
| weekday header | 🔒 | on | on | on |
| grid (7 × n weeks) | 🔒 | on | on | on |
| day cell | 🔒 | on | on | on |
| day button | 🔒 | on | on | on |
| caption dropdowns (month/year select) | ⚪ | on (dropdown) [S] | on (`captionLayout` dropdowns) [S] | on (year/month selection view) [R] |
| week-number column | ⚪ | OFF | on (optional) [S] | OFF |
| **today marker bar** (separate element) | ⚪ | **on** — 2–5px accent bar under date [S] | OFF (today is a cell style, §6) | OFF (today is a cell style, §6) |
| **event/highlight triangle** | ⚪ | **on** — corner triangle, clip-path [S] | OFF | OFF |
| modal header (selected-date headline) | ⚪ | OFF | OFF | on (modal variant) [R] |
| input-mode toggle (calendar ⇄ text field) | ⚪ | OFF | OFF | on [R] |
| footer | ⚪ | OFF | on (optional) [S] | OFF |

## 2 · Behavior — Figma: prototype interactions (one column, locked)

| row | policy | all systems |
|---|---|---|
| APG grid keyboard pattern (arrows = day, PgUp/PgDn = month, Home/End = week) | 🔒 | identical — carried by the behavior chassis, not the theme |
| roving focus within grid | 🔒 | identical |
| selection logic single/range | 🔒 | identical |
| outside-click / Escape dismiss (in popover use) | 🔒 | identical |
| screen-reader announcements (selected date, month change) | 🔒 | identical |
| modal + input-entry mode switching | ⚪ | Salt OFF · shadcn OFF · M3 on [R] — behavioral capability, flagged |

## 3 · Props — Figma: component properties panel (derived from switched-on rows)

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `mode: single \| range` | 🔒 | on [S] | on (+`multiple`) [S] | on [R] |
| `numberOfMonths` | ⚪ | on (multi-month) [R] | on [S] | OFF (single view) [R] |
| `captionLayout` (label / dropdowns) | ⚪ | on [R] | on [S] | OFF (always own header) |
| `density` | ⚪ capability | on — high/medium/low/touch [S] | OFF (locked control shown) | OFF |
| `weekStartsOn` / locale | 🔒 | on | on | on |
| `disabledDates / unselectable ranges` | 🔒 | on [S] | on [S] | on [R] |

## 4 · Content slots — Figma: text overrides / instance swap

| slot | policy | notes |
|---|---|---|
| day content (custom render) | 🔒 | consumer-owned; all three allow it |
| caption / month label format | 🔒 | locale-driven |
| weekday labels | 🔒 | locale-driven |
| footer content | ⚪ | shadcn only (footer part on) |

## 5 · States — Figma: variants (union across systems)

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest / hover / focus-visible | 🔒 | on | on | on |
| selected (single) | 🔒 | on | on | on |
| range start / middle / end | 🔒 | on | on | on |
| today | 🔒 (mechanism varies — §6) | on | on | on |
| outside month | ⬜ | **hidden by default** [R] | on — muted 50% [S] | on [R] |
| unselectable / disabled | 🔒 | on | on | on |
| **highlighted (has-event)** | ⚪ | **on** — triangle marker [S] | OFF | OFF |
| dragged (range in progress) | ⚪ | OFF | OFF | on — 16% state layer [R] |

## 6 · Styles — the cell matrix (per part × attribute × state)

### root

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | ⬜ | ⟡ surface (`container-primary-background`) [S] | ⟡ surface (`bg-background`) [S] | x-m3: `surface-container-high` [S] |
| padding | ⬜ | **8px @md** (`spacing-100`, by density) [S] | **12px** (`p-3`) [S] | **12dp** [S] |
| shape | ⬜ | **sharp (0)** [S] | ⟡ radius-container (`rounded-md` on dropdown variant) [S] | **16dp** (`corner-large` — docked; 28dp is the modal) [S] |
| width | ⬜ | **formula**: day×7 + gap×6 → 146/202/258/314px by density [S] | **fit-content** (`w-fit`) [S] | **360dp** (docked container-width) [S] |

### day cell / day button

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| size | ⬜ | **`size-base`** → 20/28/36/44px by density [S] | **formula**: `aspect-square`, fluid width, min 32px (`--cell-size`) [S] | **two-layer: 48dp cell around a 40dp circle** (`date-container` / `date-state-layer`) [S] |
| shape | ⬜ | **sharp (0)** (`palette-corner-weak`) [S] | ⟡ radius-control (`rounded-md`) [S] | **circle** (`corner-full`) [R] |
| gap between cells | ⬜ | **1px fixed** (`spacing-fixed-100`) [S] | **0** (cells abut) [S] | INHERIT [R] |
| label font | ⬜ | ⟡ type-body (`text-*` ramp, density-scaled) [S] | ⟡ type-body (`text-xs` in day, `text-sm` caption) [S] | ⟡ type-body (`body-large`) [R] |
| @hover background | 🔒 | ⟡ interaction-hover (`selectable-background-hover`) [S] | ⟡ interaction-hover (ghost-button hover → `accent`) [S] | **expression**: on-surface-variant @ 8% state layer [R] |
| @selected background | 🔒 | ⟡ interaction-selected + **1px border** `selectable-borderColor-selected` [S] | ⟡ action (`bg-primary text-primary-foreground`) [S] | ⟡ action (`primary` / `on-primary`) [R] |
| @range-middle background | 🔒 | ⟡ interaction-hover, bled −1px into gaps, top/bottom borders only [S] | **accent fill, radius 0** [S] | **OFF — M3's inline (docked) calendar has no range mode**; range is modal-only (`secondary-container`) [S] |
| @today (the audit row) | 🔒 | **separate bar part**: height `size-indicator` (2–5px), color `sentiment-accent-borderColor` [S] | **accent fill + radius**; radius 0 when also selected [S] | **1dp outline** in `primary`, label `primary` [R] |
| @outside-month | ⬜ | OFF (hidden) [R] | **muted fg + 50% opacity** [S] | **muted fg** [R] |
| @unselectable | 🔒 | ⟡ content-disabled + `selectable-background-disabled`, cursor-disabled [S] | **muted fg + 50% opacity** [S] | **38% label opacity** [R] |
| @focus-visible | 🔒 ⬜ | ⟡ focus (`focused-outline`, inset offset) [S] | ⟡ focus (`ring-[3px] ring-ring/50`) [S] | ⟡ focus (state layer 12%) [R] |
| @highlighted (event) | ⚪ | **triangle**: `sentiment-accent-background`, clip-path polygon [S] | OFF | OFF |

### navigation

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| prev/next buttons | 🔒 | composes registry `button` (secondary/ghost) [S] | composes `button` ghost, `size-(--cell-size)` [S] | composes icon-button [R] |
| chevron icons | 🔒 | ⟡ icon-role: back/forward → Salt set [S] | ⟡ icon-role: back/forward → Lucide [S] | ⟡ icon-role → Material Symbols [R] |
| caption font | ⬜ | ⟡ type-label [S] | **`text-sm font-medium`** [S] | ⟡ type-label [R] |

---

## Findings from building this matrix

1. **Optional parts are real and non-exotic.** Five parts exist in exactly
   one column (today bar, event triangle, modal header, input toggle,
   footer). The template handles them as switchable rows; the anatomy
   schema needs per-theme part activation.
2. **Cells hold three value kinds**, all already on the extension list:
   plain values, aliases, and **formulas/expressions** (Salt's width
   arithmetic, shadcn's aspect-square fluid cell, M3's state-layer
   percentages). shadcn's *fluid* cell vs Salt/M3 *fixed* cells is a
   formula-vs-value difference in the same row — the cell type must be
   per-cell, not per-row.
3. **The today row is the retrofit proof**, now mechanically stated: three
   systems answer "how do we mark today?" with a bar part, a fill style,
   and an outline style respectively. Any single hardcoded answer is wrong
   for two of the three — which is exactly what the audit caught.
4. **Salt's own gap shows the honesty mechanism working**: Salt defines no
   mobile-density highlight size (a real bug in Salt's source) — the cell
   records the absence rather than inventing a value.
5. **[R] cells need an extraction pass** before any build: every M3 value
   and a handful of Salt/shadcn prop claims should be re-verified from
   token files by the extraction tooling, not trusted from research notes.
   Counting them is the honest to-do: 21 of 68 filled cells were [R].

## Pilot outcome (2026-08-01, same session)

The matrix was executed: `contract/templates/calendar.template.json` +
`themes/columns/calendar.{salt,shadcn,m3}.json` →
`scripts/gen-from-template.py` → three generated stylesheets, rendered at
`dist/pilot/index.html` on the untouched calendar component. The style-cell
[R] entries were verified against a sparse clone of material-web
(`tokens/versions/v0_192/_md-comp-date-picker-docked.scss`) and corrected
above — three research errors found: docked shape is corner-large 16dp
(28dp is the modal's), the day cell is a two-layer 48/40dp structure, and
range selection does not exist in M3's inline calendar (modal-only) — now
a switched-off row, honestly rendered as such. Salt's emergent widths
(147/315px at high/touch density) match its source-predicted geometry
(146/314px) within a pixel. Prop/behavior rows marked [R] remain to be
verified when those pieces are wired beyond the style layer.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/calendar.template.json` against every system, read from `columns/calendar.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 16 light, 10 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `on-surface` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `content-secondary` | rgb(76, 81, 87) | rgb(177, 181, 185) | yes |
| `interaction-hover` | rgb(234, 246, 255) | rgb(0, 23, 54) | yes |
| `interaction-selected` | rgb(199, 222, 255) | rgb(0, 45, 89) | yes |
| `on-interaction-selected` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `selected-border` | rgb(0, 120, 207) | rgb(0, 120, 207) | yes |
| `accent` | rgb(0, 120, 207) | rgb(0, 120, 207) | yes |
| `focus` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `cursor-interactive` | pointer | — | **no** |
| `cursor-disabled` | not-allowed | — | **no** |
| `focus-width` | 2px | — | **no** |
| `space-fixed-100` | 1px | — | **no** |
| `space-fixed-200` | 2px | — | **no** |
| `space-fixed-400` | 4px | — | **no** |
| `field-border` | rgb(114, 119, 125) | rgb(114, 119, 125) | yes |

**shadcn** — 17 light, 7 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | oklch(1 0 0) | oklch(0.145 0 0) | yes |
| `on-surface` | oklch(0 0 0) | oklch(0.985 0 0) | yes |
| `content-secondary` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `action` | oklch(0 0 0) | oklch(0.922 0 0) | yes |
| `on-action` | oklch(0.985 0 0) | oklch(0.205 0 0) | **no** |
| `interaction-hover` | oklch(0.97 0 0) | oklch(0.371 0 0) | yes |
| `focus` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `radius-control` | calc(0.625rem - 2px) | — | yes |
| `radius-container` | 0.625rem | — | **no** |
| `type-body` | 400 14px/20px ui-sans-serif, system-ui, sans-serif | — | yes |
| `type-label` | 500 14px/20px ui-sans-serif, system-ui, sans-serif | — | **no** |
| `type-caption` | 400 12.8px/16px ui-sans-serif, system-ui, sans-serif | — | **no** |
| `control-size` | 2rem | — | yes |
| `inset` | 12px | — | **no** |
| `cursor-interactive` | default | — | yes |
| `cursor-disabled` | default | — | **no** |
| `focus-width` | 3px | — | **no** |

**m3** — 17 light, 9 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | #fef7ff | #141218 | yes |
| `on-surface` | #1d1b20 | #e6e0e9 | yes |
| `content-secondary` | #49454f | #cac4d0 | yes |
| `action` | #6750a4 | #d0bcff | yes |
| `on-action` | #ffffff | #381e72 | yes |
| `focus` | #6750a4 | #d0bcff | yes |
| `interaction-hover` | color-mix(in srgb, #49454f 8%, transparent) | color-mix(in srgb, #cac4d0 8%, transparent) | yes |
| `x-m3-surface-container-high` | #ece6f0 | #2b2930 | yes |
| `x-m3-on-surface-variant` | #49454f | #cac4d0 | **no** |
| `type-body` | 400 16px/24px Roboto, sans-serif | — | yes |
| `type-label` | 500 14px/20px Roboto, sans-serif | — | yes |
| `type-headline` | 400 32px/40px Roboto, sans-serif | — | yes |
| `control-size` | 40px | — | yes |
| `inset` | 12px | — | **no** |
| `cursor-interactive` | pointer | — | **no** |
| `cursor-disabled` | not-allowed | — | **no** |
| `focus-width` | 3px | — | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.nav.variant` | structure | default | `month-year-dropdowns` | `caption` | `month-menu` |
| 2 | `structure.header` | structure | switchable | **off** | **off** | `True` |
| 3 | `structure.input-toggle` | structure | switchable | **off** | **off** | `True` |
| 4 | `structure.actions` | structure | switchable | **off** | **off** | `True` |
| 5 | `structure.today-marker` | structure | switchable | `True` | **off** | **off** |
| 6 | `behavior.selection-commit` | behavior | default | `immediate` | `immediate` | `confirm` |
| 7 | `behavior.grid-keyboard` | behavior | locked | — | — | — |
| 8 | `behavior.range-selection` | behavior | switchable | `True` | `True` | `False` |
| 9 | `prop.density` | prop | switchable | `high, medium, low, touch` | **off** | **off** |
| 10 | `prop.accent` | prop | switchable | `blue, teal` | **off** | **off** |
| 11 | `slot.weekday-format` | slot | default | `narrow` | `short` | `narrow` |
| 12 | `slot.day-format` | slot | default | `2-digit` | `numeric` | `numeric` |
| 13 | `slot.outside-days` | slot | default | `muted` | `muted` | `hidden` |
| 14 | `slot.grid-weeks` | slot | default | `fixed-6` | `variable` | `variable` |
| 15 | `slot.icons` | slot | default | — | — | — |
| 16 | `slot.composes` | slot | default | — | — | — |
| 17 | `slot.locale` | slot | default | — | — | — |
| 18 | `state.today` | state | locked | — | — | — |
| 19 | `state.range` | state | switchable | — | — | — |
| 20 | `state.disabled` | state | locked | — | — | — |
| 21 | `state.range-preview` | state | switchable | — | — | — |
| 22 | `style.root.background` | style | default | ⟡ `surface` | ⟡ `surface` | `x-m3-surface-container-high` |
| 23 | `style.root.color` | style | default | ⟡ `on-surface` | ⟡ `on-surface` | ⟡ `on-surface` |
| 24 | `style.root.padding` | style | default | ⟡ `inset` | ⟡ `inset` | ⟡ `inset` |
| 25 | `style.root.shape` | style | default | `0` | ⟡ `radius-container` | `16px` |
| 26 | `style.root.width` | style | switchable | **off** | `fit-content` | `360px` |
| 27 | `style.day.size` | style | default | ⟡ `control-size` | ⟡ `control-size` | ⟡ `control-size` |
| 28 | `style.day.cell-padding` | style | switchable | `0 var(--space-fixed-100) var(--space-fixed-100) 0` | **off** | `4px` |
| 29 | `style.day.shape` | style | default | ⟡ `corner-weak` | ⟡ `radius-control` | `999px` |
| 30 | `style.day.font` | style | default | ⟡ `type-body` | ⟡ `type-body` | ⟡ `type-body` |
| 31 | `style.day.background@hover` | style | locked | ⟡ `interaction-hover` | ⟡ `interaction-hover` | ⟡ `interaction-hover` |
| 32 | `style.day.selected` | style | locked | `background: var(--interaction-selected); color: var(--on-interaction-selected); border: 1px solid var(--selected-border)` | `background: var(--action); color: var(--on-action); border-radius: var(--radius-control)` | `background: var(--action); color: var(--on-action)` |
| 33 | `style.day.range-middle-cell` | style | switchable | `background: var(--interaction-hover); border-block: 1px solid var(--selected-border)` | **off** | **off** |
| 34 | `style.day.range-middle` | style | switchable | `background: transparent; border: none; border-radius: 0; color: var(--on-surface)` | `background: var(--interaction-hover); color: var(--on-surface); border-radius: 0` | **off** |
| 35 | `style.day.range-start` | style | switchable | `border-radius: var(--corner-weak) 0 0 var(--corner-weak)` | `border-radius: var(--radius-control) 0 0 var(--radius-control)` | **off** |
| 36 | `style.day.range-end` | style | switchable | `border-radius: 0 var(--corner-weak) var(--corner-weak) 0` | `border-radius: 0 var(--radius-control) var(--radius-control) 0` | **off** |
| 37 | `style.day.today` | style | locked | `position: relative` | `background: var(--interaction-hover); color: var(--on-surface); border-radius: var(--radius-control)` | `outline: 1px solid var(--action); outline-offset: -1px; color: var(--action)` |
| 38 | `style.day.today-marker` | style | switchable | `content: ""; position: absolute; inset-inline: var(--inset-half); inset-block-end: var(--inset-half); block-size: var(--indicator-size); background: var(--accent); border-radius: var(--corner-weak)` | **off** | **off** |
| 39 | `style.day.today-marker@outside` | style | switchable | `background: var(--content-secondary)` | **off** | **off** |
| 40 | `style.day.outside` | style | switchable | `color: var(--content-secondary)` | `color: var(--content-secondary); opacity: 0.5` | **off** |
| 41 | `style.day.disabled` | style | locked | `color: var(--content-secondary); opacity: 0.4; cursor: var(--cursor-disabled)` | `color: var(--content-secondary); opacity: 0.5; cursor: var(--cursor-disabled)` | `color: color-mix(in srgb, var(--on-surface) 38%, transparent); cursor: var(--cursor-disabled)` |
| 42 | `style.day.focus` | style | locked | `outline: var(--focus-width) dotted var(--focus); outline-offset: calc(-1 * var(--focus-width))` | `outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--focus) 50%, transparent)` | `background: color-mix(in srgb, var(--x-m3-on-surface-variant) 12%, transparent); outline: 3px solid var(--focus); outline-offset: 2px` |
| 43 | `style.nav.button.size` | style | default | ⟡ `control-size` | ⟡ `control-size` | ⟡ `control-size` |
| 44 | `style.nav.button.shape` | style | default | ⟡ `corner-weak` | ⟡ `radius-control` | `999px` |
| 45 | `style.nav.button.background@hover` | style | locked | ⟡ `interaction-hover` | ⟡ `interaction-hover` | ⟡ `interaction-hover` |
| 46 | `style.nav.spacing` | style | default | `padding-block-end: var(--space-100); margin-block-end: 0` | `margin-block-end: 16px` | `margin-block-end: 4px` |
| 47 | `style.nav.layout` | style | switchable | `display: grid; grid-template-columns: min-content auto min-content; gap: var(--space-fixed-200); align-items: center` | **off** | **off** |
| 48 | `style.caption.layout` | style | switchable | `display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-fixed-400)` | **off** | **off** |
| 49 | `style.caption.font` | style | default | ⟡ `type-body` | ⟡ `type-label` | ⟡ `type-label` |
| 50 | `style.dropdowns` | style | switchable | `min-block-size: var(--control-size); padding: 0 var(--space-100); background: var(--surface); border-block-end: 1px solid var(--field-border); border-radius: var(--corner-weak) var(--corner-weak) 0 0; display: inline-flex; align-items: center; gap: var(--space-fixed-400)` | **off** | **off** |
| 51 | `style.weekday.font` | style | default | ⟡ `type-label` | ⟡ `type-caption` | ⟡ `type-body` |
| 52 | `style.weekday.color` | style | default | ⟡ `content-secondary` | ⟡ `content-secondary` | ⟡ `on-surface` |
| 53 | `style.header.label` | style | switchable | **off** | **off** | `font: var(--type-label); color: var(--content-secondary)` |
| 54 | `style.header.headline` | style | switchable | **off** | **off** | `font: var(--type-headline); color: var(--on-surface)` |
| 55 | `style.header.spacing` | style | switchable | — | **off** | `gap: 24px; margin-block-end: 8px; padding: 4px 8px 12px` |
| 56 | `style.actions.spacing` | style | switchable | — | **off** | `gap: 8px; margin-block-start: 8px` |
| 57 | `style.header.divider` | style | switchable | **off** | **off** | **off** |
| 58 | `style.actions.button` | style | switchable | **off** | **off** | `font: var(--type-label); color: var(--action); background: transparent; border: none; padding: 10px 12px; border-radius: 999px; cursor: var(--cursor-interactive)` |

<details><summary>Citations — 97 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.nav.variant` | salt | CalendarNavigation.tsx: month Dropdown + year Dropdown + prev/next buttons; owner reference screenshot 2026-08-01 |
| `structure.nav.variant` | shadcn | calendar.tsx captionLayout default 'label' |
| `structure.nav.variant` | m3 | docked tokens menu-button-*; m3.material.io date picker: 'August 2025 v' menu + chevrons |
| `structure.header` | m3 | date-picker-modal header tokens; owner reference screenshot: 'Select date' + 'Mon, Aug 17' |
| `structure.input-toggle` | m3 | date-input-modal tokens; pencil icon toggles calendar <-> text entry |
| `structure.actions` | m3 | modal Cancel/OK text buttons (owner screenshot) |
| `structure.today-marker` | salt | internal/CalendarDay.css -today span::after bar |
| `behavior.selection-commit` | m3 | M3 modal picker: selection pending until OK |
| `behavior.range-selection` | salt | Calendar selectionVariant=range |
| `behavior.range-selection` | shadcn | calendar.tsx mode range |
| `behavior.range-selection` | m3 | docked/inline calendar has zero range tokens; range is a separate modal variant. Declared capability gap. |
| `prop.density` | salt | core/src/theme/Density.ts (mobile pending upstream stabilization) |
| `prop.density` | shadcn | no density axis — control renders locked |
| `prop.density` | m3 | no global density; control renders locked |
| `prop.accent` | salt | next/palette/accent.css: [data-accent=blue\|teal] — Salt's two color themes |
| `prop.accent` | shadcn | no accent axis |
| `prop.accent` | m3 | no accent axis |
| `slot.weekday-format` | salt | CalendarWeekHeader.tsx daysOfWeek(dateAdapter, 'narrow') |
| `slot.weekday-format` | shadcn | react-day-picker default formatWeekdayName: Sun Mon Tue |
| `slot.weekday-format` | m3 | owner screenshot + m3.material.io: S M T W T F S |
| `slot.day-format` | salt | owner reference screenshot: 01, 02... zero-padded |
| `slot.day-format` | shadcn | calendar.tsx renders date.getDate() |
| `slot.outside-days` | salt | Calendar.tsx hideOutOfRangeDates is opt-in (default shows); CalendarDay.css -outOfRange muted; owner screenshot confirms |
| `slot.outside-days` | shadcn | calendar.tsx showOutsideDays=true default; outside: text-muted-foreground opacity-50 |
| `slot.outside-days` | m3 | owner screenshot: leading cells empty, no adjacent-month dates |
| `slot.grid-weeks` | salt | owner reference screenshot Jul 2026 (trailing 02-08 week shown); salt storybook CalendarGrid |
| `slot.grid-weeks` | shadcn | react-day-picker default (fixedWeeks opt-in) |
| `slot.grid-weeks` | m3 | owner reference screenshot Aug 2025: grid ends at 31 |
| `style.root.background` | m3 | docked container-color |
| `style.root.padding` | salt | Calendar.css padding --salt-spacing-100 |
| `style.root.padding` | shadcn | calendar.tsx p-3 |
| `style.root.shape` | salt | Salt sharp; palette-corner fallback 0 |
| `style.root.shape` | m3 | docked container-shape corner-large (28px is the modal) |
| `style.root.width` | salt | emergent from cell sizes |
| `style.root.width` | shadcn | calendar.tsx w-fit |
| `style.root.width` | m3 | docked container-width |
| `style.day.size` | salt | Calendar.css --calendar-day-size: var(--salt-size-base) |
| `style.day.size` | shadcn | source is fluid aspect-square min --cell-size; fixed at 2rem, declared simplification |
| `style.day.cell-padding` | salt | Calendar.css --calendar-gap: spacing-fixed-100 |
| `style.day.cell-padding` | m3 | date-container 48px around 40px state layer |
| `style.day.shape` | salt | CalendarDay.css:43 border-radius palette-corner-weak; rounded edition |
| `style.day.shape` | shadcn | calendar.tsx rounded-md |
| `style.day.shape` | m3 | corner-full |
| `style.day.background@hover` | salt | CalendarDay.css selectable-background-hover |
| `style.day.background@hover` | shadcn | Button ghost hover:bg-accent |
| `style.day.selected` | salt | CalendarDay.css selectable-background-selected + selectable-borderColor-selected |
| `style.day.selected` | shadcn | data-[selected-single=true]:bg-primary text-primary-foreground |
| `style.day.selected` | m3 | date-selected-container primary / on-primary |
| `style.day.range-middle-cell` | salt | CalendarDay.css:84-96 selectedSpan ::before: bg selectable-background-hover, top/bottom borders selectable-borderColor-selected, inset -gap (continuous band) |
| `style.day.range-middle-cell` | shadcn | cells abut (no gap); button-level band is already continuous |
| `style.day.range-middle-cell` | m3 | no range mode |
| `style.day.range-middle` | salt | span day button carries no own box; the cell carries the band |
| `style.day.range-middle` | shadcn | data-[range-middle=true]:bg-accent rounded-none |
| `style.day.range-start` | salt | CalendarDay.css:115 |
| `style.day.range-start` | shadcn | calendar.tsx data-[range-start]:rounded-l-md |
| `style.day.range-end` | salt | CalendarDay.css:122 |
| `style.day.range-end` | shadcn | calendar.tsx data-[range-end]:rounded-r-md |
| `style.day.today` | salt | today carried by the marker element |
| `style.day.today` | shadcn | today: bg-accent text-accent-foreground rounded-md |
| `style.day.today` | m3 | date-today-container-outline 1px primary; label primary |
| `style.day.today-marker` | salt | CalendarDay.css:305-313: width 100%-2xspacing-50, bottom spacing-50, height size-indicator, radius palette-corner-weak, bg sentiment-accent-borderColor |
| `style.day.today-marker@outside` | salt | CalendarDay.css:240: outOfRange today marker uses content-secondary-foreground |
| `style.day.outside` | salt | CalendarDay.css -outOfRange; owner screenshot: shown muted, not hidden |
| `style.day.outside` | shadcn | text-muted-foreground opacity-50 |
| `style.day.outside` | m3 | outside days hidden (config), no style needed |
| `style.day.disabled` | salt | Salt disabled = 40% (states doc); selectable disabled |
| `style.day.disabled` | shadcn | disabled: text-muted-foreground opacity-50 |
| `style.day.disabled` | m3 | M3 disabled content 38% convention |
| `style.day.focus` | salt | characteristics/focused.css: outlineStyle = borderStyle-dotted, width size-fixed-200 |
| `style.day.focus` | shadcn | ring-[3px] ring-ring/50 |
| `style.day.focus` | m3 | focus-state-layer 0.12 + md-focus-ring defaults |
| `style.nav.button.size` | salt | composes Button height size-base |
| `style.nav.button.size` | shadcn | nav buttons size-(--cell-size) |
| `style.nav.button.size` | m3 | menu-button-container-height 40px |
| `style.nav.button.shape` | salt | Button.css border-radius palette-corner-weak fallback |
| `style.nav.button.shape` | m3 | menu-button corner-full |
| `style.nav.button.background@hover` | m3 | menu-button-hover-state-layer 8% |
| `style.nav.spacing` | salt | CalendarNavigation.css padding-bottom: var(--salt-spacing-100) |
| `style.nav.spacing` | shadcn | calendar.tsx month: flex-col gap-4 (1rem between nav and grid) |
| `style.nav.spacing` | m3 | docked spec: menu row sits close above weekdays; approximation pending full spec extraction |
| `style.nav.layout` | salt | CalendarNavigation.css: grid min-content auto min-content, grid-gap spacing-fixed-200 (2px) |
| `style.nav.layout` | shadcn | base flex layout suffices |
| `style.nav.layout` | m3 | base flex layout suffices |
| `style.caption.layout` | salt | CalendarNavigation.css -dropdowns: grid 1fr 1fr, gap spacing-fixed-400 (4px) — each dropdown fills half the nav width |
| `style.caption.font` | salt | Salt Dropdown value text uses body ramp; owner screenshot: dropdown text matches day-number size |
| `style.caption.font` | shadcn | text-sm font-medium |
| `style.caption.font` | m3 | menu button label-large |
| `style.dropdowns` | salt | core/src/dropdown/Dropdown.css: min-height size-base, padding 0 spacing-100, inline-flex align center, corner-weak radius, default-variant border-bottom 1px editable-borderColor; bg editable-primary-background -> surface |
| `style.weekday.font` | shadcn | text-[0.8rem] font-normal |
| `style.weekday.font` | m3 | weekdays-label-text body-large |
| `style.weekday.color` | m3 | weekdays-label-text-color on-surface |
| `style.header.label` | m3 | modal header supporting text label-large |
| `style.header.headline` | m3 | headline-large 32/40 |
| `style.header.spacing` | m3 | modal header region: label-to-headline 24dp per spec screenshots |
| `style.actions.spacing` | m3 | M3 dialog action spacing 8dp convention |
| `style.header.divider` | m3 | divider color not in extracted docked tokens — omitted rather than guessed |
| `style.actions.button` | m3 | M3 text button: label-large, primary, full corner |

</details>

<!-- END GENERATED VALUES -->
