# The Semantic Token Contract

The registry's single source of truth. Components consume ONLY these slots.
A design system joins the registry by providing values for these slots plus a
capability declaration — see `docs/LINKING.md` for the rules.

Naming is system-neutral. shadcn and Salt are both *adapters* to this
contract (`themes/theme-*.json`). Derived from the comparison of shadcn,
Salt, Material 3, Carbon, Fluent 2, Radix (`docs/token-research.md`) — the
union of their categories, so any of them (and their peers) can link without
inventing slots.

Legend: **R** required (theme must value it) · **D** derivable (theme may
give a rule instead of a value) · **A** axis (optional capability).

## 1 · Color

| Slot | Req | Meaning |
|---|---|---|
| `surface` / `on-surface` | R | page ground and its text/icon color |
| `surface-raised` / `on-surface-raised` | R | cards, panels |
| `surface-overlay` / `on-surface-overlay` | R | menus, popovers, dialogs |
| `surface-sunken` | R | recessed canvas behind cards |
| `content-secondary` | R | supporting text on any surface |
| `action` / `on-action` | R | the primary interactive color (shadcn: near-black · Salt: blue-600) |
| `action-hover` · `action-active` | D | derivable by ramp step |
| `action-secondary` / `on-action-secondary` | R | secondary buttons/fills |
| `interaction-hover` · `interaction-active` | R | subtle state layer (ghost buttons, menu items, rows) |
| `interaction-selected` / `on-interaction-selected` | R | selected items, active tabs |
| `field-border` | R | form control borders (Salt: bottom-border only — anatomy, still this color) |
| `border` · `border-strong` | R | hairlines / emphasized rules |
| `link` | R | inline links |
| `focus` | R | focus indicator color |
| `overlay-scrim` | R | dimming layer under modals |
| `status-info` · `-success` · `-warning` · `-critical`, each with `-surface` (subtle bg), `-border`, `on-status-*` | R | full sentiment family — text-only is not enough (Salt/Carbon) |
| `data-1 … data-6` | R | categorical/chart palette — never for actions |
| `inverse-surface` / `on-inverse-surface` | D | tooltips/toasts in inverted style |

Modes: every color slot is valued for `light` and `dark` (or the theme
declares single-mode as a constraint).

## 2 · Typography (composite roles)

Each role = { family, size, line-height, weight, tracking, case }.

| Role | Req | Notes |
|---|---|---|
| `display` | D | hero numerals/titles |
| `heading-1` `-2` `-3` | R | page/section/subsection |
| `body` · `body-strong` | R | prose |
| `label` | R | form labels, small headings |
| `action` | R | button/tab text — THE role that carries Salt's uppercase-600-tracked character; shadcn: 500 none |
| `caption` | R | helper text, timestamps |
| `code` · `data` | R | monospace / tabular numerals |
| families: `family-display` `family-body` `family-code` | R | stacks |

## 3 · Space & size

| Slot | Req | Notes |
|---|---|---|
| `space-unit` | R | the grid (shadcn 4px · Salt 8px@medium) |
| `space-inline-sm/md/lg` | D | gaps within a control/row |
| `space-stack-sm/md/lg` | D | gaps between blocks |
| `inset-control-x` · `inset-container` | R | control padding / card padding |
| `control-height-sm/md/lg` | R | 32/36/40 shadcn · density-driven Salt |
| `target-min` | R | minimum touch target (44px) |
| **density** | A | axis multiplying unit/control/text/icon as a group (Salt: 4 stops; Radix: scaling %) |

## 4 · Shape

| Slot | Req | Notes |
|---|---|---|
| `radius-control` · `radius-container` · `radius-overlay` · `radius-pill` | R | themes may bind all to one knob (shadcn) or fix them (Salt: 0,0,0,999) |
| `border-width` · `border-width-strong` | R | 1px / 2px typical |

## 5 · Elevation

| Slot | Req | Notes |
|---|---|---|
| `elevation-resting` · `-raised` · `-overlay` · `-modal` | R | semantic levels, valued as shadows AND/OR borders |
| `elevation-strategy` | R | `shadow` \| `border` \| `mixed` — how the theme expresses depth (Material: shadow · Salt: border+rare shadow · shadcn dark: border) |

## 6 · Motion

| Slot | Req | Notes |
|---|---|---|
| `duration-instant` · `-fast` · `-base` · `-slow` | R | Salt source: 0/—/300/1000ms · shadcn/tw: 0/150/200/300ms |
| `easing-standard` · `-enter` · `-exit` · `-emphasized` | R | cubic-beziers |
| reduced-motion | R | rule: all durations → 0 under `prefers-reduced-motion` |

## 7 · Layer (z-index ladder)

`layer-base(0) · layer-sticky · layer-dropdown · layer-overlay · layer-modal ·
layer-notification · layer-tooltip` — **R**. Salt source ladder:
1 / 1100 / 1000 / 1200 / 1300 / 1400 / 1500. Themes may renumber; order is
contract.

## 8 · Iconography

| Slot | Req | Notes |
|---|---|---|
| `icon-size-inline` · `-control` · `-emphasis` | R | e.g. 12/16/24 shadcn · density-driven Salt |
| `icon-style` | R | `outline` (+`icon-stroke`) \| `filled` — Material's variable axes reduce to this |
| `icon-set` | R | default library + allowed alternates |
| `icon-swap-mechanism` | R | `import` (shadcn migrate) \| `provider` (Salt SemanticIconProvider) |
| **semantic icon roles** | R | the role list themes must map: `close dismiss expand collapse back forward search add remove overflow error warning success info calendar user upload external drag loading` |

## 9 · Focus

`focus-width` · `focus-style` (`ring`\|`outline`) · `focus-offset` — **R**.
shadcn: 3px ring @50% · Salt: 2px solid outline, offset 2.

---
Implementation: `tokens/base.css` carries these as CSS custom properties with
neutral defaults, plus a shadcn-compat alias block so existing components run
unchanged. Machine-readable theme adapters: `themes/theme-*.json`. Format is
expressible in W3C DTCG types for future tooling.
