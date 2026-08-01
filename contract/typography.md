# Typography — the type-role reference

The contract has nine type roles and three family stacks. Components consume
**only** these slots — never a raw `font-size`, `font-weight`, or family name
(LINKING.md R1). Spec: `tokens/semantic.md` §2. Implementation:
`tokens/base.css` §2. Delivery: `fonts/fonts.json` +
`fonts/theme-<name>.fonts.css`. Validator: `scripts/check-fonts.py`.

## How a role reaches the screen

```
tokens/base.css              declares every slot with a neutral default
        ↓
dist/theme-<name>.css        generated: --text-ui, --ui-weight, density stops
        ↓
fonts/theme-<name>.fonts.css the theme's font program: families + role values
        ↓
component CSS                font: var(--type-action);
```

A role is a **composite**: `weight size/line-height family`, consumed with the
CSS `font` shorthand in one declaration. Two role attributes cannot live in the
shorthand — case and tracking — so the `action` role carries two companion
slots, `--action-case` and `--action-tracking`. Any component rendering action
text writes all three:

```css
[data-slot="button"] {
  font: var(--type-action);
  text-transform: var(--action-case);
  letter-spacing: var(--action-tracking);
}
```

That is the whole mechanism by which Salt's uppercase button voice and
shadcn's sentence-case one are the same component.

## Families

| Slot | Feeds | shadcn | Salt |
|---|---|---|---|
| `--family-display` | display, heading-1..3 | system sans stack (`ui-sans-serif, system-ui, …`) | `"Amplitude"` → `"Open Sans"` → system (Amplitude licensed, falls back) |
| `--family-body` | body, body-strong, label, action, caption | `var(--family-display)` — one stack for everything | `"Open Sans"` → system |
| `--family-code` | code, data | `ui-monospace, SFMono-Regular, …` | `"PT Mono"` → `ui-monospace` → system |

## Roles

| Role | Slot | Purpose | shadcn | Salt |
|---|---|---|---|---|
| display | `--type-display` | hero numerals, marketing titles, big empty-state figures. **D** — optional | 600 · 2.25rem/2.5rem · display | 300 · 2.5rem/3rem · display (Amplitude tier, Open Sans Light in practice) |
| heading-1 | `--type-heading-1` | page title, one per view | 600 · 1.875rem/2.25rem | 600 · 1.75rem/2.25rem |
| heading-2 | `--type-heading-2` | section title | 600 · 1.5rem/2rem | 600 · 1.375rem/1.75rem |
| heading-3 | `--type-heading-3` | subsection, card title, dialog title | 600 · 1.125rem/1.75rem | 600 · 1.125rem/1.5rem |
| body | `--type-body` | prose, paragraph copy, dialog description | 400 · 1rem/1.5rem | 400 · 0.875rem/1.25rem |
| body-strong | `--type-body-strong` | emphasis *inside* prose — never a substitute for a heading | 600 · 1rem/1.5rem | 600 · 0.875rem/1.25rem |
| label | `--type-label` | form labels, column headers, small chrome headings | 500 · `--text-ui`/1.25rem | 600 · `--text-ui`/1.25 (density-driven) |
| action | `--type-action` | button, tab, menu-item, link-as-button text — **the role that carries a system's voice** | `--ui-weight` (500) · `--text-ui` · case `none` · tracking `0em` | `--ui-weight` (600) · `--text-ui` · case `uppercase` · tracking `0.6px` |
| caption | `--type-caption` | helper text, validation messages, timestamps, footnotes | 400 · 0.75rem/1rem | 400 · 0.75rem/1rem |
| code | `--type-code` | inline code, snippets, monospace identifiers | 400 · 0.8125rem/1.25rem · code | 400 · 0.8125rem/1.25rem · PT Mono |
| data | `--type-data` | tabular figures, amounts, IDs — anything that must align in a column | 400 · `--text-ui`/1.25rem · code | 400 · `--text-ui`/1.25 · PT Mono |

Companion slots for the action role: `--action-case` (`none` \| `uppercase`)
and `--action-tracking` (a length or `0em`). Both are valued in
`tokens/base.css` and overridden per theme.

`--text-ui` and `--ui-weight` are the density-scalable primitives the chrome
roles bind to. Under a theme with a density axis (Salt: high/medium/low/touch)
`dist/theme-<name>.css` rescales `--text-ui` per `[data-density]`, so
label/action/data resize with control height while prose roles hold still.
Under shadcn (`density: false`) `--text-ui` is a constant 0.875rem.

## The chrome rule

> **UI chrome uses `text-ui` / `label` / `action`. The prose roles
> (`body`, `body-strong`, `display`) are never used for chrome.**

Chrome is anything the user operates rather than reads: buttons, tabs, menu
items, form labels, table headers, toolbar text, breadcrumbs, badges, chips,
nav items, dialog footers. Prose is anything the user reads: paragraphs,
dialog descriptions, empty-state explanations, help text bodies, article
content.

Why it is a rule and not a preference:

1. **Density.** Chrome roles bind to `--text-ui`; prose roles do not. A body
   role inside a toolbar refuses to shrink at high density and breaks the
   control rhythm.
2. **Voice.** `action` is the only role carrying case + tracking. A button
   labelled with `--type-body` silently loses Salt's uppercase signature, and
   the same component then reads as two different systems across themes.
3. **Translation.** `scripts/translate.py` and the conformance checks reason
   about which role a slot plays; a prose role in a chrome position makes the
   component untranslatable by inspection.

Corollaries:

- Dialog **title** = `heading-3`, dialog **description** = `body`, dialog
  **buttons** = `action`. Not `body` for all three.
- Table **header cells** = `label`; numeric **body cells** = `data`; free-text
  body cells = `body`.
- Helper/validation text under a field = `caption`, never `body`.
- Never set `text-transform` or `letter-spacing` from a literal in a
  component — only from `--action-case` / `--action-tracking`.

## Font-delivery policy

- **No external URLs.** No `@import`, no `@font-face` with a remote `src`. The
  registry renders under a strict CSP with zero network requests; the showroom
  and every published page depend on it. `scripts/check-fonts.py` fails the
  build on a violation.
- **Stacks only.** A theme's font file declares family stacks. Named webfonts
  appear as a comment telling a consumer what to self-host.
- **Licensed faces must fall back.** A face the registry may not redistribute
  (Salt's Amplitude) is named first and followed by a shipped tier, so its
  absence is a graceful downgrade, and the restriction is recorded in
  `fonts/fonts.json` under that family's `licensing` / `mustFallBack`.
- **Every theme ships a font file.** `themes/theme-<name>.json` requires
  `fonts/theme-<name>.fonts.css` and an entry in `fonts/fonts.json`. Adding a
  theme without one is a conformance violation.
