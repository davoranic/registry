# Input (single-line text field) — component template matrix

*Sixth live component in the post-clean-slate pipeline (button, spinner,
tooltip, alert, calendar came before). Same method as
[CALENDAR-MATRIX.md](CALENDAR-MATRIX.md) / [TOOLTIP-MATRIX.md](TOOLTIP-MATRIX.md) /
[ALERT-MATRIX.md](ALERT-MATRIX.md): one master template (union of all six
pieces across systems), columns per design system, rows switched
on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `x-ds:` = system's native token, no shared slot yet ·
`OFF` = row switched off in this column · `INHERIT` = system silent,
registry default applies · `[S]` = value extracted from source this
session · `[R]` = not directly sourced (reason always given); needs
verification before treating as authoritative.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

---

## Scope note — the basic single-line text control only

### What is in scope

- **Salt** `packages/core/src/input/{Input.tsx,Input.css}` — the plain
  single-line `Input`.
- **shadcn** `apps/v4/registry/new-york-v4/ui/input.tsx` — the one and only
  `Input`.
- **Material 3** BOTH `_md-comp-filled-text-field.scss` AND
  `_md-comp-outlined-text-field.scss`. These are not two components: they
  are one canonical component with an emphasis/variant axis, exactly as
  Button's filled/outlined/text family was handled. They share a token
  vocabulary almost line-for-line (same `input-text-*`, `label-text-*`,
  `supporting-text-*`, `error-*`, `disabled-*` families, same
  `body-large`/`body-small` typescale bindings); they differ in exactly
  two mechanisms — filled has a `container-color` + an **active
  indicator** (bottom-only rule), outlined has no container color and a
  full **outline** — which this matrix models as the
  `structure.indicator` axis.

### What is out of scope, and why (structural reasons, declared not dropped)

Salt ships six further input relatives. Each is excluded for a structural
reason, not for convenience:

| excluded | where | structural reason |
|---|---|---|
| `multiline-input` | `core/src/multiline-input` | Renders a `<textarea>`, not an `<input>` — a different host element with `rows`/auto-grow row arithmetic (`--saltMultilineInput-rows`) and no single-line height token. `docs/COMPONENTS.md` lists it under the separate canonical **`textarea`** row [S]. |
| `number-input` | `core/src/number-input` | Composes two `Button`s (increment/decrement), a `step`/`stepMultiplier`/`clamp`/`decimalScale` numeric model, long-press repeat, and Up/Down-arrow keyboard handling. A behavior superset, not a style variant [S]. |
| `pill-input` | `core/src/pill-input` | Renders an array of `Pill` children inside the control with removal callbacks and a `useTruncatePills` overflow measurement. `docs/COMPONENTS.md` maps it to the separate **`input-group`** row [S]. |
| `search-input` | `lab/src/search-input` | *Wraps* `Input` (literally `<Input …>` with an injected `SearchIcon` start adornment and a clear-button end adornment). It is a composition of this component, so modelling it here would double-count [S]. |
| `formatted-input`, `tokenized-input(-next)` | `lab/src/…` | Both add a value-transformation layer (mask/format on the way in and out; tokens as first-class removable values). `docs/COMPONENTS.md` gives them their own **`formatted/tokenized input`** row [S]. |
| `query-input`, `input-legacy` | `lab/src/…` | Legacy/derived; `input-legacy` is the pre-`next`-theme edition and would reintroduce the deprecated palette this pipeline does not target [S]. |

`field` — the **label + control + help-text wrapper** — is a SEPARATE
canonical component (`docs/COMPONENTS.md`: `| field (label+control+help
wrapper) | ✓ | ✓ form-field, form-field-legacy | — |`). This matrix covers
the *control*, not the wrapper. It does record, as an info row
(`behavior.status-inheritance`), exactly how Salt's Input reads state out
of form-field context — see below.

M3's `_md-comp-filled-field.scss` / `_md-comp-outlined-field.scss` are NOT
that wrapper: they are the text-field's own internal container-layout
token maps, and `docs/COMPONENTS.md` lists them on the **input** row, so
their spacing tokens are in scope here.

---

## Sources

- **Salt** [S]: `packages/core/src/input/{Input.tsx,Input.css}`;
  `packages/core/src/status-adornment/{StatusAdornment.tsx,StatusAdornment.css}`;
  `packages/core/src/form-field-context/{FormFieldContext.ts,useFormFieldProps.ts}`;
  `packages/core/src/status-indicator/ValidationStatus.ts`;
  `packages/theme/css/next/characteristics/{editable,status,focused,content,text}.css`;
  `packages/theme/css/next/palette/{neutral,accent,background,foreground,corner,negative,warning,positive}.css`;
  `packages/theme/css/next/foundations/{color,alpha}.css`;
  `packages/theme/css/foundations/{size,spacing,curve,borderStyle,cursor}.css`.
  Reused rather than re-derived: `docs/foundations/{sizes,spacing,density,typography,colors,shape,border-style,cursors}.md`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/input.tsx` (canonical);
  `apps/v4/app/globals.css` (token values);
  `apps/v4/registry/new-york-v4/examples/input-{demo,disabled,file,with-label,with-button}.tsx`;
  `apps/v4/content/docs/components/radix/input.mdx` (section list read to
  confirm which states shadcn documents at all). Cross-checked but NOT
  canonical: `apps/v4/registry/bases/radix/ui/input.tsx` (a `cn-input`
  class-token variant of the same element, same conclusion).
- **Material 3** [S]: `tokens/versions/latest/sass/_md-comp-filled-text-field.scss`,
  `…/_md-comp-outlined-text-field.scss`, plus
  `_md-sys-color.scss`, `_md-sys-color__dark.scss`, `_md-ref-palette.scss`,
  `_md-sys-shape.scss`, `_md-sys-state.scss`,
  `_md-sys-state-focus-indicator.scss`, `_md-sys-typescale.scss` for
  resolution; and `tokens/_md-comp-filled-field.scss` /
  `tokens/_md-comp-outlined-field.scss` for the four spacing values the
  edition-pinned files do not carry (see Edition pin).
  **material-web is a tokens-only clone** — no live M3 text-field
  component exists to read structure/behavior from, so every M3
  structure/behavior row is `[R]`.

### Edition pin — `versions/latest`, and the divergence is now four deep

Pinned to **`tokens/versions/latest/sass`**, matching spinner, tooltip and
alert; calendar and button are pinned to `v0_192`. Reasons specific to
this component:

1. `latest` is the only edition that carries `container-height: 56px` for
   both variants — v0.192 has no height token at all. (It arrives already
   annotated `@deprecated`: *"Removing fixed height token due to conflicts
   with text fields variants requiring dynamic height."* An emitted-and-
   already-deprecated token is odd, but it is the only sourced height
   number in either edition; recorded as such, not smoothed over.)
2. A full mechanical diff of both files across the two editions
   (`filled`: 86 vs 87 entries, `outlined`: 81 vs 79) turns up exactly
   **one substantive value divergence**:
   `outlined.focus.outline.width` = **2px in v0.192, 3px in latest**.
   Everything else differs only by newly-added tokens
   (`container-height`, `trailing-icon-size`, the `focus-indicator`
   family) or by the map-vs-`$var` file format. This matrix uses 3px.
3. The four container-spacing values (`leading-space` / `trailing-space` /
   `top-space` / `bottom-space` = 16px, `content-space` = 16px) exist in
   **neither** edition's text-field file. They live one layer up, in the
   library's hand-authored `tokens/_md-comp-{filled,outlined}-field.scss`,
   which is itself built on `versions/v0_192/…`. This is a **declared
   cross-edition borrow**: it is safe precisely because of finding (2) —
   the two editions agree on every value these files consume.

> **Flagged for the owner, fourth time now.** latest-vs-v0.192 has been
> pinned differently by different components (calendar/button →
> v0.192; spinner/tooltip/alert/input → latest). That is now a real,
> accumulating inconsistency in the registry, not a per-component
> footnote. It wants a single registry-wide decision.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| root (the box) | 🔒 (invariant) | on — `<div class="saltInput">`, a real wrapper [S] | **on, but it IS the control** — `input.tsx` renders a bare `<input data-slot="input">` and nothing else; there is no wrapper element [S] | on — the `field` container the text-field composes [R] |
| control (the `<input>`) | 🔒 (invariant) | on — `<input class="saltInput-input">` inside the wrapper [S] | on — same element as the root, see above [S] | on [R] |
| **activation indicator** (bottom-only rule) | ⚪ | **on** — `<div class="saltInput-activationIndicator">`, ALWAYS rendered; `position:absolute; bottom:0; width:100%; border-bottom: 1px …` [S] | **OFF** — no underline mechanism of any kind [S] | **on** — `active-indicator-color/-height`, filled variant only [S] |
| start adornment container | ⚪ | **on** — `startAdornment` prop → `.saltInput-startAdornmentContainer` [S] | OFF — bare element, no adornment slots; adornments are the separate `input-group` component (`docs/COMPONENTS.md`) [S] | **on** — `leading-icon-size: 24px`, `leading-icon-color`, `with-leading-content-leading-space` [S] |
| end adornment container | ⚪ | **on** — `endAdornment` prop [S] | OFF — same as above [S] | **on** — `trailing-icon-size: 24px`, `trailing-icon-color` [S] |
| status adornment (automatic validation glyph) | ⚪ | **on** — `{!isDisabled && validationStatus && <StatusAdornment status={…}/>}`, inserted by the component itself [S] | OFF [S] | **OFF** — M3 *recolours* a trailing icon on error (`error-trailing-icon-color`) but never inserts one; the glyph is always consumer-supplied content [S] |

### The root-vs-control split is real structure, and it is modelled, not papered over

Salt and M3 need a wrapper: adornments and an activation indicator have to
live *inside* the box, beside the text. shadcn does not: its input has no
adornments and no indicator, so its border, background, padding, radius,
height and shadow all sit **on the `<input>` element itself**.

The template carries this as a config axis, `chrome: "wrapper" | "control"`,
and every box-level style row's selector is a **union of both**:

```
[data-slot="input"][data-chrome="wrapper"],
[data-slot="input"][data-chrome="control"] [data-slot="input-control"]
```

so shadcn's chrome is genuinely applied to its `<input>`, exactly as in
source. The skeleton additionally gives the wrapper `display: contents`
when `chrome === "control"`, which removes its box from the layout tree
entirely — the rendered box model for shadcn is a single element, as it is
in shadcn. This is the same discipline TOOLTIP-MATRIX.md's arrow-shape
correction established: a structural difference gets a switch, not a
similar-looking approximation.

## 2 · Behavior

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| native single-line control | 🔒 | `<input>`; caret, IME, selection, autofill all platform-owned [S] | identical [S] | identical [R] |
| focus tracking | 🔒 (info) | **React state** — `useState(focused)` + `onFocus`/`onBlur` on the input, applied as a `.saltInput-focused` CLASS on the *wrapper*. Not `:focus-within`, not `:focus-visible` [S] | **native `:focus-visible`** pseudo-class in CSS, no JS [S] | [R] — no live component |
| status inheritance from form-field context | ⚪ | **on** — `useFormFieldProps()` supplies `disabled`, `readOnly`, `validationStatus`, and `a11yProps` (`aria-labelledby`/`aria-describedby`). Precedence is NOT uniform: `isDisabled = disabled \|\| formFieldDisabled` and `isReadOnly = readOnlyProp \|\| formFieldReadOnly` (**OR** — either source can turn it on), but `validationStatus = formFieldValidationStatus ?? validationStatusProp` (**context wins outright** over the instance prop) [S] | **OFF** — no context. shadcn's `Field` marks itself `data-invalid`; the input's own `aria-invalid` is set per-instance by the consumer [S] | **OFF** [R] — no context mechanism in a tokens-only clone |
| empty read-only marker | ⚪ | **on** — an empty read-only Input renders the literal `"—"` (`emptyReadOnlyMarker` prop, default `"—"`, `''` disables). A *content-formatting* behavior, the class of character CALENDAR-MATRIX.md's post-mortem said the pilot lost [S] | OFF [S] | OFF [R] |
| disabled tab-stop | 🔒 (info) | **explicit** — `tabIndex={isDisabled ? -1 : 0}` written onto the input, overriding the native default [S] | **implicit** — relies on the native `disabled` attribute plus `disabled:pointer-events-none` [S] | [R] |
| validation status enum | 🔒 (info) | error / warning / success — `FormFieldValidationStatus` is `Omit<ValidationStatuses,"info">`, so **`info` is deliberately excluded** even though Salt's general `ValidationStatus` has it (Banner/Tooltip do use `info`) [S] | **one boolean** — `aria-invalid`; no warning, no success [S] | **one state** — the `error-*` token family; no warning, no success token anywhere in either text-field file [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| indicator / box mechanism | ⚪ | **`bordered?: boolean`, default `false`** → underline (activation indicator) by default, full box border when `true`. Note the default: Salt's out-of-the-box input is an UNDERLINE, not a box [S] | **box only** — structurally always a full border, not a runtime prop [S] | **filled → underline, outlined → box** — the two token files, i.e. a component-choice axis rather than a prop [S] |
| `variant` (background intensity) | ⚪ | **on** — `"primary" \| "secondary" \| "tertiary"`, default `"primary"`; each reassigns `--input-background` to `editable-{variant}-background` (snow / marble / limestone) [S] | OFF — no such axis [S] | **OFF as a separate axis** — M3's only variant axis IS filled/outlined, already modelled as the indicator row above; recording it twice would invent a second axis M3 does not have [S] |
| `validationStatus` | ⚪ | **on** — 3 values (error/warning/success), also inheritable from form-field context [S] | **on, 1 value** — `aria-invalid` (error only) [S] | **on, 1 value** — the `error-*` family [S] |
| `textAlign` | ⚪ | **on** — `"left" \| "center" \| "right"`, default `"left"`, applied as an inline `--input-textAlign` custom property [S] | OFF [S] | OFF [S] |
| `disabled` | 🔒 | on [S] | on [S] | on (`disabled-*` opacity family) [S] |
| `readOnly` | ⚪ | **on, with a dedicated visual state** — its own background, border colour and cursor [S] | **on as an attribute, with NO visual state** — `input.tsx` has no `read-only:` variant, and the docs page has `Disabled` and `Invalid` sections but no read-only section at all. A real, sourced non-variation [S] | **OFF** — no read-only token in either text-field file [S] |
| `placeholder` | 🔒 | on, styled (`::placeholder`) [S] | on, styled [S] | on (`input-text-placeholder-color`) [S] |
| `emptyReadOnlyMarker` | ⚪ | **on**, see Behavior [S] | OFF | OFF |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| value / placeholder text | 🔒 | consumer-owned in all three |
| start adornment | ⚪ | consumer-owned; Salt takes any `ReactNode` and gives composed `Button`s a dedicated size override, M3 expects a 24px icon, shadcn has no slot |
| end adornment | ⚪ | same |
| status adornment | ⚪ | Salt only, and NOT consumer-owned: the component picks the glyph from the status. **DECLARED COMPOSITION** — which glyph, and its own fill, belong to Salt's `StatusAdornment`/semantic-icon-provider, a future registry icon component. Only its size, placement and colour-source are modelled here. |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**, same pattern as CALENDAR-MATRIX.md's nav buttons: (a) the `field` wrapper — label, help text, necessity marker, and Salt's whole context-inheritance channel; (b) `button`, for Salt's adornment buttons (`--saltButton-height: calc(size-base - spacing-100)`, `--saltButton-borderRadius: palette-corner-weaker`) and shadcn's `input-group` buttons; (c) an icon set. None is imported by this skeleton; all render as neutral placeholders. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | on | on | on |
| hover | ⚪ | **on** — border/indicator recolour to `editable-borderColor-hover` (accent) [S] | **OFF — no hover rule at all**, confirmed by reading every class in `input.tsx` [S] | **on** — `hover-active-indicator-color` / `hover-outline-color` → `on-surface` [S] |
| focus | 🔒 | on — class-driven (see Behavior) | on — `:focus-visible` | on [R] |
| disabled | 🔒 | on | on | on |
| read-only | ⚪ | **on** | OFF (attribute only, no style) | OFF |
| validation error | 🔒 | on | on | on |
| validation warning / success | ⚪ | **on** | OFF | OFF |

## 6 · Styles — the cell matrix

All cells are shown at each system's default: Salt `variant="primary"`,
`bordered={false}`; shadcn its only configuration; M3 the **filled**
variant. The non-default values are real generated rows, not prose — see
"the axes, as generated rows" below.

### root / box

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `bg-current` → `editable-primary-background` → `palette-background-primary` → **snow `rgb(255,255,255)` / jet `rgb(16,24,32)`** [S] | ⟡ `bg-current` → `bg-transparent` light, `dark:bg-input/30` → **`transparent` / `color-mix(in oklab, oklch(1 0 0 / 15%) 30%, transparent)`** — the only system whose input is transparent in light mode [S] | ⟡ `bg-current` → `container-color` → `surface-container-highest` → **`#e6e0e9` / `#36343b`** (filled) [S] |
| background @indicator=box | ⚪ | **OFF** — `bordered` changes the border only; the background is untouched. A real non-variation [S] | OFF — box is its only mode [S] | **on — `transparent`**: `_md-comp-outlined-text-field.scss` has **no `container-color` token at all** (direct grep; contrast filled's). Confirmed absence [S] |
| color (text) | 🔒 | ⟡ `content-primary-foreground` → **`rgb(0,0,0)` / `rgb(255,255,255)`** [S] | ⟡ `--foreground` → **`oklch(0% 0 0)` / `oklch(0.985 0 0)`** — note `input.tsx` sets **no** text-colour class; this is the ambient body colour, recorded as such [S] | ⟡ `input-text-color` → `on-surface` → **`#1d1b20` / `#e6e0e9`** [S] |
| font | ⬜ | ⟡ `type-body` → **`400 12px/16px 'Open Sans'` @medium**, 11/14 · 12/16 · 14/18 · 16/20 by density. `Input.css` sets family/size/line-height but **not** weight; 400 comes from the ambient `--salt-text-fontWeight` (regular) [S] | **`400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif`** — `text-base md:text-sm`; see the type note below [S] | **`400 1rem/1.5rem Roboto`** (`body-large`; family per this pipeline's standing M3 precedent — the tokens-only clone never spells out `plain`) [S] |
| letter-spacing | ⚪ | **0** (`--salt-text-letterSpacing`) [S] | OFF — no tracking utility [S] | **0.03125rem** (`body-large-tracking`) [S] |
| height | ⬜ | ⟡ `control-height` → `size-base` → **20/28/36/44px** by density [S] | **36px** (`h-9`) [S] | **56px** (`container-height`; see Edition pin) [S] |
| min-width | ⚪ | **4em** — `--saltInput-minWidth` default fallback, a hardcoded literal [S] | **0** (`min-w-0`) [S] | OFF — no token [S] |
| padding | ⬜ | ⟡ `field-padding` → **`0 4px` / `0 8px` / `0 12px` / `0 16px`** — `padding-left/right: spacing-100`, **no vertical padding at all**; height alone sets the vertical rhythm [S] | **`4px 12px`** (`py-1 px-3`) [S] | **`16px`** uniform (`top/bottom/leading/trailing-space`, `_md-comp-{filled,outlined}-field.scss`) — and 16+24+16 = the 56px height exactly [S] |
| gap (box ↔ adornment) | ⚪ | ⟡ `field-gap` → `spacing-100` → **4/8/12/16px**. One row covers both gaps: the adornment containers' `padding-right`/`padding-left` and their internal `column-gap` are the same `spacing-100` token [S] | OFF — no adornments [S] | **16px** (`content-space`) [S] |
| shape | ⬜ | ⟡ `corner-weak` → `palette-corner-weak` → curve-100 (rounded edition pin) → **2/4/6/8px** by density [S] | **8px** (`rounded-md` → `--radius-md` = `0.625rem × 0.8`) [S] | **`4px 4px 0 0`** (`corner-extra-small-top`) — filled is rounded on the TOP ONLY, so the activation indicator sits on a square bottom edge [S] |
| shape @indicator=box | ⚪ | OFF — corner is independent of `bordered` [S] | OFF [S] | **`4px`** (`corner-extra-small`, all four corners) [S] |
| cursor | ⚪ | **`text`** (`--salt-cursor-text`, an explicit declaration) [S] | OFF — no cursor class at rest; the native `<input>` default applies [S] | OFF — no token [S] |
| shadow | ⚪ | OFF — no `box-shadow` anywhere in `Input.css` [S] | **`0 1px 2px 0 rgb(0 0 0 / 0.05)`** (`shadow-xs`; same value already extracted in `button.shadcn.json`) [S] | OFF — no elevation token in either text-field file [S] |
| transition | ⚪ | OFF — no `transition`/`animation` rule in `Input.css`, the same total absence TOOLTIP-MATRIX.md found on Salt's tooltip [S] | **`color 150ms, box-shadow 150ms`** — `transition-[color,box-shadow]` with no duration/easing utility, so Tailwind's own defaults (150ms, `cubic-bezier(0.4,0,0.2,1)`) apply. Tailwind is not vendored in this clone, so those two numbers are `[R]` — the same unvendored-package caveat as the tooltip's `tw-animate-css` [S/R] | OFF — no motion token [S] |

**shadcn's responsive type, declared.** `input.tsx` says `text-base
md:text-sm`: **1rem/1.5rem below 768px, 0.875rem/1.25rem at and above**.
This generator emits flat rules and has **no `@media` channel** — a real
tooling limitation, recorded here rather than hidden. The cell carries the
≥768px value (0.875rem/1.25rem) because that is what the desktop
validation harness and shadcn's own docs site render; the <768px value is
recorded in the column's provenance. Declared, not silently dropped.

### the box border vs the activation indicator — two mechanisms, not one

This is the row where Input could have repeated the tooltip-arrow mistake:
collapsing "a line under the text" and "a rectangle around the text" into
one bordered box with a colour delta. They are different mechanisms and
they get different parts.

**The surprise, and it inverts the usual expectation:** Salt's default is
NOT a box. `bordered` defaults to `false`, and `Input.css` renders
`.saltInput-activationIndicator` — a bottom-only 1px rule that thickens to
2px on focus. That is *the same mechanism as M3's filled text field*, down
to the focus thickening. Salt's box border is the opt-in.

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| box border @indicator=box | ⚪ | **on** — `1px solid var(--border-current)`; `--input-borderColor` → `editable-borderColor` → `palette-neutral` → **`rgb(114,119,125)`, mode-invariant** [S] | **on** — `1px solid var(--border-current)`; `border-input` → `--input` → **`oklch(0.922 0 0)` / `oklch(1 0 0 / 15%)`** [S] | **on** — `1px solid var(--border-current)`; `outline-color` → `outline` → **`#79747e` / `#938f99`** [S] |
| box border @hover | ⚪ | **on** — recolour only, to `editable-borderColor-hover` → `palette-accent` → **`rgb(0,120,207)`, mode-invariant** [S] | **OFF — confirmed absent**: `input.tsx` has no `hover:` class of any kind [S] | **on** — `hover-outline-color` → `on-surface` → **`#1d1b20` / `#e6e0e9`**; `hover-outline-width` stays 1px [S] |
| box border @focus | 🔒 | **on** — recolour to `editable-borderColor-active` → `palette-accent-stronger` → **`rgb(0,69,126)` / `rgb(154,189,245)`**; width unchanged [S] | **on** — recolour to `--ring` → **`oklch(0.708 0 0)` / `oklch(0.556 0 0)`**; width unchanged [S] | **on** — recolour to `primary` **AND thicken to 3px** (`focus-outline-width`; 2px in v0.192 — the one edition divergence) [S] |
| activation indicator @indicator=underline | ⚪ | **on** — `border-bottom: 1px solid var(--border-current)`, same indirection as the box border, so one status reassignment recolours both [S] | **OFF** — no such part [S] | **on** — `active-indicator-height: 1px`, `active-indicator-color` → `on-surface-variant` → **`#49454f` / `#cac4d0`** (note: a *different* role from the outlined variant's `outline`) [S] |
| activation indicator @hover | ⚪ | **on** — `--input-borderColor-hover` (accent) [S] | OFF | **on** — `hover-active-indicator-color` → `on-surface` [S] |
| activation indicator @focus | 🔒 | **on — thickens to 2px** (`size-fixed-200`) and recolours to accent-stronger [S] | OFF | **on — thickens to 2px** (`focus-active-indicator-height`) and recolours to `primary` [S] |
| activation indicator @indicator=box, focused | ⚪ | **on — 1px** (`.saltInput-bordered.saltInput-focused .saltInput-activationIndicator { border-bottom-width: var(--salt-size-fixed-100) }`). Salt zeroes the indicator whenever `bordered`, *except* when also focused, where it comes back at 1px on top of the border. A small, easily-missed source detail, modelled rather than dropped [S] | OFF | OFF — an outlined M3 field has no indicator at all [S] |

**Focus is a genuine three-way structural split.** Salt draws a **2px
dotted outline outside the box** (`focused-outlineWidth`=`size-fixed-200`,
`focused-outlineStyle`=`borderStyle-dotted`, `focused-outlineColor`=
`palette-accent-stronger`) *in addition to* recolouring the border/
indicator. shadcn draws a **3px translucent ring**
(`ring-[3px] ring-ring/50` → a `box-shadow`, with `outline-none`). M3 draws
**nothing extra at all** — focus is expressed entirely by the indicator or
outline thickening and recolouring; its `focus-indicator-outline-*` tokens
exist but are stamped `@deprecated — instead use focus outline tokens`, so
they are recorded as off, not merely unfound.

### control (the `<input>` element)

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `::placeholder` | ⚪ | **on** — colour `content-secondary-foreground` → `palette-foreground-secondary` → gray-700 **`rgb(76,81,87)`** / gray-300 **`rgb(177,181,185)`**, **plus `font-weight: 300`** (`--salt-text-fontWeight-small` → `fontWeight-light`) — the only system that changes the placeholder's *weight* [S] | **on** — `placeholder:text-muted-foreground` → **`oklch(0.556 0 0)` / `oklch(0.708 0 0)`**, colour only [S] | **on** — `input-text-placeholder-color` → `on-surface-variant` → **`#49454f` / `#cac4d0`**, colour only [S] |
| caret colour | ⚪ | OFF — no `caret-color` declaration [S] | OFF [S] | **on** — `caret-color` → `primary`, and `error-focus-caret-color` → `error`. The only system that tokenises the text cursor's colour [S] |
| text-align | ⚪ | **on** — `--input-textAlign`, default `left` [S] | OFF | OFF |

**Declared rendering approximation, one:** Salt's placeholder weight 300
(`fontWeight-light`) cannot render faithfully — this repo self-hosts Open
Sans at 400 and 600 only (`fonts/`), so a 300 request resolves to the 400
face. The cell keeps the sourced 300 (source truth) and the shortfall is
declared here rather than the value being quietly rounded to 400.

### disabled

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | ⚪ | ⟡ `bg-current-disabled` → `editable-primary-background-disabled` → `palette-background-primary-disabled` → **snow-40a `rgba(255,255,255,0.4)` / jet-40a `rgba(16,24,32,0.4)`** [S] | **OFF** — one blanket `opacity-50` on the whole element instead [S] | **`on-surface` @ 4%** (`disabled-container-opacity: 0.04`) → `color-mix(in oklab, #1d1b20 4%, transparent)` [S] |
| text colour | ⚪ | ⟡ `content-primary-foreground-disabled` → black-40a / white-40a [S] | OFF (opacity) [S] | **`on-surface` @ 38%** (`disabled-input-text-opacity`) [S] |
| box border colour | ⚪ | `editable-borderColor-disabled` → `palette-neutral-disabled` → gray-500-40a **`rgba(114,119,125,0.4)`**, mode-invariant [S] | OFF (opacity) [S] | **`on-surface` @ 12%** (`disabled-outline-opacity`) [S] |
| indicator colour | ⚪ | same `editable-borderColor-disabled` [S] | OFF | **`on-surface` @ 38%** (`disabled-active-indicator-opacity`) [S] |
| other | ⚪ | `cursor: not-allowed` (`--salt-cursor-disabled`); `::selection { background: none }` (not modelled — micro-property scope trim) [S] | **`opacity: 0.5; cursor: not-allowed; pointer-events: none`** [S] | OFF [S] |

Three answers to "how do I look disabled": Salt **retokenises every
colour** to a 40%-alpha sibling; shadcn applies **one blanket 50%
opacity**; M3 applies **four different per-element opacities** (4% / 12% /
38% / 38%) over the enabled colour. Same silhouette, three mechanisms —
the CALENDAR "today marker" pattern again.

### read-only

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | ⚪ | **`transparent`** — `editable-background-readonly` → `color-transparent`. Salt's read-only input dissolves into the page [S] | OFF — no read-only style at all [S] | OFF — no token [S] |
| border / indicator colour | ⚪ | `editable-borderColor-readonly` → `palette-neutral-readonly` → gray-500-10a **`rgba(114,119,125,0.1)`**, mode-invariant [S] | OFF [S] | OFF [S] |
| cursor | ⚪ | `--salt-cursor-readonly`, which resolves to **`text`** — the *same* value as `--salt-cursor-text`. A tokenised distinction with no visual consequence; recorded here, not given a row [S] | OFF | OFF |

### adornments

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| adornment box height | ⚪ | **formula**: `calc(size-base − spacing-100)` → **16/20/24/28px** by density — this is Salt sizing a *composed Button* (`--saltButton-height`), a DECLARED COMPOSITION [S] | OFF [S] | **24px** (`leading-icon-size` / `trailing-icon-size`) [S] |
| status adornment size | ⚪ | ⟡ `size-adornment` → **6/8/10/12px** by density (`StatusAdornment.css` `height`/`min-height`) [S] | OFF | OFF |
| status adornment colour | ⚪ | ⟡ `border-current` — `status-{s}-foreground-decorative` → `palette-{negative,warning,positive}`, which is **the identical value** the border/indicator resolves to for that status, so it rides the same indirection (exactly the reuse ALERT-MATRIX.md's `tone-active` slot made) [S] | OFF | OFF |

### the axes, as generated rows

Every non-default axis value is a real CSS row that reassigns an
indirection custom property the base rows above consume — **mirroring each
system's own mechanism**, not duplicating properties. Salt's `Input.css`
literally does this: `.saltInput-secondary { --input-background: … }`,
`.saltInput-error { --input-borderColor: …; --input-borderColor-active: …;
--input-outlineColor: …; --input-background: … }`. Modelling it any other
way would need six overrides per status per state.

| row | Salt | shadcn | Material 3 |
|---|---|---|---|
| `style.root.variant@secondary` | **on** — `--bg-current` → marble `rgb(245,247,248)` / granite `rgb(26,34,41)`; `--bg-current-disabled` → its 40a sibling [S] | OFF | OFF |
| `style.root.variant@tertiary` | **on** — limestone `rgb(250,248,242)` / leather `rgb(38,41,43)` + 40a sibling [S] | OFF | OFF |
| `style.root.status@error` | **on** — reassigns SIX properties in one block, exactly as `.saltInput-error` does: border, border-hover, border-active, focus-outline colour, background AND read-only background, all to `palette-negative` `rgb(229,33,53)` / `negative-weakest` `rgb(255,236,234)`–`rgb(69,0,2)` [S] | **on** — reassigns border, focus-border and the ring colour to `--destructive`, plus the ring's alpha from 50% to **20% light / 40% dark** (`aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40`). Background untouched [S] | **on** — reassigns outline, outline-hover (`on-error-container`!), outline-focus, indicator, indicator-hover (`on-error-container`), indicator-focus and the caret. M3 is the only system whose *hover* colour in the error state is a different role from its rest colour [S] |
| `style.root.status@warning` | **on** — `palette-warning` `rgb(199,83,0)` / `warning-weakest` [S] | **OFF — no warning state exists**, the same coverage gap already recorded for Button and Alert [S] | **OFF — no warning token in either text-field file**, confirmed by direct grep [S] |
| `style.root.status@success` | **on** — `palette-positive` `rgb(0,135,93)` / `positive-weakest` [S] | OFF [S] | OFF [S] |

**Accent scope trim.** Salt's `editable-borderColor-hover`/`-active`
resolve through `palette-accent*`, which has a `data-accent` axis
(`blue` default, `teal` alternate). This column pins **blue**, the default,
matching `button.salt.json`'s precedent; only `calendar.salt.json` models
`byAccent` so far. Recorded, not modelled.

---

## Findings from building this matrix

1. **Salt's default input is an underline, not a box — and it is the same
   mechanism as M3's filled text field.** The brief for this component
   expected the split to be "M3's activation indicator versus Salt's and
   shadcn's box border." Source says otherwise: `Input.css` renders
   `.saltInput-activationIndicator` unconditionally, `bordered` defaults to
   `false`, and the indicator thickens from 1px to 2px on focus. M3's
   filled field does the identical thing with the identical numbers
   (`active-indicator-height: 1px` → `focus-active-indicator-height: 2px`).
   So the real alignment is **Salt-default + M3-filled = underline** versus
   **Salt-bordered + shadcn + M3-outlined = box**, a 2-way mechanism split
   that cuts across all three systems rather than isolating one. Had the
   matrix been written from the expectation instead of the grep, Salt's
   default rendering would have been wrong.
2. **shadcn's input has no wrapper element, and that is structure.** It is
   a bare `<input>` carrying every box style itself. Salt and M3 both need
   a wrapper (adornments and an indicator have to live inside the box).
   Modelled as a `chrome: wrapper | control` axis with union selectors and
   `display: contents` on the unused wrapper, so shadcn's rendered box
   model is genuinely one element. Wrapping shadcn in a styled div would
   have been the DOM-shaped version of the tooltip's one-rotated-square
   arrow: invisible in a screenshot, wrong in the box model, and it would
   have quietly imported Salt's DOM into a "neutral" chassis (CLAUDE.md
   rule 1).
3. **Every system models its status/variant axis as ONE reassigned
   indirection property, and Salt's is the most explicit yet.**
   `.saltInput-error` sets six custom properties in a single block —
   `--input-borderColor`, `-hover`, `-active`, `--input-outlineColor`,
   `--input-background`, `--input-background-readonly` — that eleven
   separate rules elsewhere in the file consume. Following that shape
   (TOOLTIP-MATRIX.md's lesson 3) turned what would have been ~30
   status-override rows into 3.
4. **Validation coverage is 3 / 1 / 1, and Salt's own `info` is
   deliberately excluded.** Salt's Input takes `FormFieldValidationStatus`,
   which is literally `Omit<ValidationStatuses, "info">` — so error/warning/
   success only, even though Banner and Tooltip both accept `info`. shadcn
   has a single boolean (`aria-invalid`). M3 has a single `error-*` token
   family. One design system, two different status enums for two of its own
   components, is a finding in itself: "grep the source" has to mean
   grepping *this* component's type, not the system's general one.
5. **Hover is absent from shadcn entirely.** Not "unfound" — every class in
   `input.tsx` was read; there is no `hover:` anything. Salt recolours to
   accent on hover; M3 recolours to `on-surface`. shadcn's input does not
   react to the pointer at all until it is focused. Recorded as a confirmed
   absence, the same treatment TOOLTIP-MATRIX.md gave M3's missing arrow.
6. **Three mechanisms for "disabled," and M3's is the most granular
   design system has yet shown in this pipeline.** Salt retokenises each
   colour to a 40%-alpha sibling; shadcn drops one `opacity: 0.5` over
   everything; M3 specifies **four different opacities for four different
   elements** (container 4%, outline 12%, indicator 38%, text 38%) layered
   over the enabled colours. A single "disabled = fade it" assumption is
   wrong for all three in different directions.
7. **M3 is the only system that tokenises the caret.** `caret-color →
   primary`, and `error-focus-caret-color → error`. Salt and shadcn both
   leave the text cursor to the platform. A one-cell row, but a real one —
   and the kind of detail a "similar enough" chassis silently drops.
8. **A content-formatting behavior nobody else has:** Salt renders `"—"`
   inside an empty read-only input (`emptyReadOnlyMarker`, default `"—"`).
   This is exactly the class of character CALENDAR-MATRIX.md's post-mortem
   identified as living outside CSS, so it is a first-class config row, not
   a footnote — a column that turns it on and a skeleton that cannot render
   it would be a failing build under CLAUDE.md rule 3.
9. **A real generator gap, declared: no `@media` channel.** shadcn's input
   is `text-base md:text-sm` — its type size genuinely changes at 768px.
   The template's row model emits flat rules with no at-rule support, so
   only one of the two values can be expressed. The desktop value is used
   (matching the harness and shadcn's own docs); the mobile value is in the
   column's provenance. Logged as a tooling gap for the owner rather than
   fixed silently, the same way ALERT-MATRIX.md finding 10 logged the
   missing config-discrimination gate.
10. **No frozen-token literals found in Salt's input — checked, and the
    check mattered.** TOOLTIP-MATRIX.md's lesson was that a bare px literal
    may be a density token snapshotted at medium. Every Salt value in this
    component was tested against that: `size-base` (20/28/36/44),
    `spacing-100` (4/8/12/16), `curve-100` (2/4/6/8), `size-adornment`
    (6/8/10/12) and the text ramp all scale properly; the two remaining
    literals are `size-fixed-100`/`-200` (1px/2px), which are
    **density-invariant by design** (`docs/foundations/sizes.md`: "fixed
    scale … density-invariant, all 5 densities identical"), and
    `--saltInput-minWidth: 4em`, which is em-relative and therefore already
    scales with the density-driven font size. Nothing was tokenised against
    source and nothing was left frozen. The one literal that *would* have
    been suspicious — an arrow-style bare pixel size on the status
    adornment — turned out to be `--salt-size-adornment`, already a density
    token.
11. **Axis self-audit (ALERT-MATRIX.md finding 10, run deliberately this
    time).** Every `channel: "config"` row whose cell is a list of two or
    more values was checked for a discriminating CSS row or skeleton
    branch. All pass, with **one deliberate exception**: shadcn's
    `prop.read-only` is `[true, false]` and **no CSS discriminates the two**
    — because none exists in source. The skeleton branch does discriminate
    (the control receives the real `readOnly` attribute and stops being
    editable), and the identical rendering is the sourced non-variation
    itself, the same shape as ALERT-MATRIX.md finding 5's "shadcn's
    background never varies by tone." It is recorded here so a future
    reader does not mistake it for the dead-axis bug the audit exists to
    catch. Full audit list, per axis: `indicator` (Salt, M3) → underline
    rows vs box rows; `variant` (Salt ×3) → default + `@secondary` +
    `@tertiary`; `status` (Salt ×3) → `@error`/`@warning`/`@success`;
    `textAlign` (Salt ×3) → the three theme-invariant `[data-text-align]`
    base rules; `disabled` (all three) → four/five colour rows plus
    `style.control.disabled`; `readOnly` (Salt) → three `@readonly` rows,
    (shadcn) → skeleton branch only, as above.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/input.template.json` against every system, read from `columns/input.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 28 light, 13 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `field-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `field-bg-secondary` | rgb(245, 247, 248) | rgb(26, 34, 41) | **no** |
| `field-bg-tertiary` | rgb(250, 248, 242) | rgb(38, 41, 43) | **no** |
| `field-bg-disabled` | rgba(255, 255, 255, 0.4) | rgba(16, 24, 32, 0.4) | **no** |
| `field-bg-secondary-disabled` | rgba(245, 247, 248, 0.4) | rgba(26, 34, 41, 0.4) | **no** |
| `field-bg-tertiary-disabled` | rgba(250, 248, 242, 0.4) | rgba(38, 41, 43, 0.4) | **no** |
| `field-bg-readonly` | transparent | — | yes |
| `fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `fg-disabled` | rgba(0, 0, 0, 0.4) | rgba(255, 255, 255, 0.4) | **no** |
| `placeholder-fg` | rgb(76, 81, 87) | rgb(177, 181, 185) | yes |
| `border` | rgb(114, 119, 125) | — | yes |
| `border-hover` | rgb(0, 120, 207) | — | yes |
| `border-active` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `border-readonly` | rgba(114, 119, 125, 0.1) | — | **no** |
| `border-disabled` | rgba(114, 119, 125, 0.4) | — | **no** |
| `status-error` | rgb(229, 33, 53) | — | **no** |
| `status-warning` | rgb(199, 83, 0) | — | **no** |
| `status-success` | rgb(0, 135, 93) | — | **no** |
| `status-error-bg` | rgb(255, 236, 234) | rgb(69, 0, 2) | **no** |
| `status-warning-bg` | rgb(255, 236, 217) | rgb(66, 32, 0) | **no** |
| `status-success-bg` | rgb(234, 245, 242) | rgb(0, 41, 21) | **no** |
| `bg-current` | var(--field-bg) | — | **no** |
| `bg-current-disabled` | var(--field-bg-disabled) | — | **no** |
| `bg-current-readonly` | var(--field-bg-readonly) | — | **no** |
| `border-current` | var(--border) | — | **no** |
| `border-current-hover` | var(--border-hover) | — | **no** |
| `border-current-active` | var(--border-active) | — | **no** |
| `outline-current` | var(--border-active) | — | **no** |

**shadcn** — 16 light, 7 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `field-bg` | transparent | color-mix(in oklab, oklch(1 0 0 / 15%) 30%, transparent) | yes |
| `fg` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `placeholder-fg` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `border-base` | oklch(0.922 0 0) | oklch(1 0 0 / 15%) | yes |
| `focus` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `danger` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | yes |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | yes |
| `radius-control` | calc(0.625rem * 0.8) | — | yes |
| `type-body` | 400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif | — | yes |
| `ring-alpha` | 50% | — | **no** |
| `ring-alpha-invalid` | 20% | 40% | **no** |
| `bg-current` | var(--field-bg) | — | **no** |
| `border-current` | var(--border-base) | — | **no** |
| `border-current-active` | var(--focus) | — | **no** |
| `ring-current` | var(--focus) | — | **no** |
| `ring-alpha-current` | var(--ring-alpha) | — | **no** |

**m3** — 25 light, 16 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `filled-bg` | #e6e0e9 | #36343b | yes |
| `fg` | #1d1b20 | #e6e0e9 | yes |
| `placeholder-fg` | #49454f | #cac4d0 | yes |
| `indicator` | #49454f | #cac4d0 | **no** |
| `indicator-hover-color` | #1d1b20 | #e6e0e9 | **no** |
| `indicator-focus-color` | #6750a4 | #d0bcff | **no** |
| `outline` | #79747e | #938f99 | **no** |
| `outline-hover-color` | #1d1b20 | #e6e0e9 | **no** |
| `outline-focus-color` | #6750a4 | #d0bcff | **no** |
| `caret` | #6750a4 | #d0bcff | yes |
| `status-error` | #b3261e | #f2b8b5 | **no** |
| `status-error-hover` | #410e0b | #f9dedc | **no** |
| `bg-disabled` | color-mix(in oklab, #1d1b20 4%, transparent) | color-mix(in oklab, #e6e0e9 4%, transparent) | **no** |
| `fg-disabled` | color-mix(in oklab, #1d1b20 38%, transparent) | color-mix(in oklab, #e6e0e9 38%, transparent) | **no** |
| `outline-disabled` | color-mix(in oklab, #1d1b20 12%, transparent) | color-mix(in oklab, #e6e0e9 12%, transparent) | **no** |
| `indicator-disabled` | color-mix(in oklab, #1d1b20 38%, transparent) | color-mix(in oklab, #e6e0e9 38%, transparent) | **no** |
| `type-body` | 400 1rem/1.5rem 'Roboto', sans-serif | — | yes |
| `bg-current` | var(--filled-bg) | — | **no** |
| `border-current` | var(--outline) | — | **no** |
| `border-current-hover` | var(--outline-hover-color) | — | **no** |
| `border-current-active` | var(--outline-focus-color) | — | **no** |
| `indicator-current` | var(--indicator) | — | **no** |
| `indicator-current-hover` | var(--indicator-hover-color) | — | **no** |
| `indicator-current-active` | var(--indicator-focus-color) | — | **no** |
| `caret-current` | var(--caret) | — | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.root-wrapper` | structure | locked | `wrapper` | `control` | `wrapper` |
| 2 | `structure.indicator` | structure | switchable | `underline, box` | `box` | `underline, box` |
| 3 | `structure.start-adornment` | structure | switchable | `True` | **off** | `True` |
| 4 | `structure.end-adornment` | structure | switchable | `True` | **off** | `True` |
| 5 | `structure.status-adornment` | structure | switchable | `True` | **off** | **off** |
| 6 | `behavior.native-control` | behavior | locked | — | — | — |
| 7 | `behavior.focus-tracking` | behavior | locked | — | — | — |
| 8 | `behavior.status-inheritance` | behavior | switchable | `True` | **off** | **off** |
| 9 | `behavior.empty-readonly-marker` | behavior | switchable | `—` | **off** | **off** |
| 10 | `behavior.disabled-tabindex` | behavior | locked | — | — | — |
| 11 | `prop.variant` | prop | switchable | `primary, secondary, tertiary` | **off** | **off** |
| 12 | `prop.validation-status` | prop | switchable | `error, warning, success` | `error` | `error` |
| 13 | `prop.text-align` | prop | switchable | `left, center, right` | **off** | **off** |
| 14 | `prop.disabled` | prop | locked | `True, False` | `True, False` | `True, False` |
| 15 | `prop.read-only` | prop | switchable | `True, False` | `True, False` | **off** |
| 16 | `slot.value` | slot | locked | — | — | — |
| 17 | `slot.start-adornment` | slot | switchable | `True` | **off** | `True` |
| 18 | `slot.end-adornment` | slot | switchable | `True` | **off** | `True` |
| 19 | `slot.composes` | slot | default | — | — | — |
| 20 | `state.rest-hover-focus` | state | locked | — | — | — |
| 21 | `state.disabled` | state | locked | — | — | — |
| 22 | `state.read-only` | state | switchable | `True` | **off** | **off** |
| 23 | `state.validation` | state | locked | — | — | — |
| 24 | `style.root.background` | style | locked | ⟡ `bg-current` | ⟡ `bg-current` | ⟡ `bg-current` |
| 25 | `style.root.background@box` | style | switchable | **off** | **off** | `transparent` |
| 26 | `style.root.color` | style | locked | ⟡ `fg` | ⟡ `fg` | ⟡ `fg` |
| 27 | `style.root.font` | style | default | ⟡ `type-body` | ⟡ `type-body` | ⟡ `type-body` |
| 28 | `style.root.letter-spacing` | style | switchable | `0` | **off** | `0.03125rem` |
| 29 | `style.root.height` | style | default | ⟡ `control-height` | `36px` | **off** |
| 30 | `style.root.min-width` | style | switchable | `4em` | `0` | **off** |
| 31 | `style.root.padding` | style | default | ⟡ `field-padding` | `4px 12px` | `16px` |
| 32 | `style.root.gap` | style | switchable | ⟡ `field-gap` | **off** | `16px` |
| 33 | `style.root.shape` | style | default | ⟡ `corner-weak` | ⟡ `radius-control` | `4px 4px 0 0` |
| 34 | `style.root.shape@box` | style | switchable | **off** | **off** | `4px` |
| 35 | `style.root.cursor` | style | switchable | `text` | **off** | **off** |
| 36 | `style.root.shadow` | style | switchable | **off** | `0 1px 2px 0 var(--shadow-color)` | **off** |
| 37 | `style.root.transition` | style | switchable | **off** | `color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)` | **off** |
| 38 | `style.control.placeholder` | style | switchable | `color: var(--placeholder-fg); font-weight: 300` | `color: var(--placeholder-fg)` | `color: var(--placeholder-fg)` |
| 39 | `style.control.caret-color` | style | switchable | **off** | **off** | ⟡ `caret-current` |
| 40 | `style.root.border@box` | style | switchable | `border-width: 1px; border-style: solid; border-color: var(--border-current)` | `border-width: 1px; border-style: solid; border-color: var(--border-current)` | `border-width: 1px; border-style: solid; border-color: var(--border-current)` |
| 41 | `style.indicator.border@underline` | style | switchable | `border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: var(--border-current)` | **off** | `border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: var(--indicator-current)` |
| 42 | `style.root.border@box-hover` | style | switchable | `border-color: var(--border-current-hover)` | **off** | `border-color: var(--border-current-hover)` |
| 43 | `style.indicator.border@underline-hover` | style | switchable | `border-bottom-color: var(--border-current-hover)` | **off** | `border-bottom-color: var(--indicator-current-hover)` |
| 44 | `style.root.border@box-focus` | style | switchable | `border-color: var(--border-current-active)` | `border-color: var(--border-current-active)` | `border-width: 2px; border-color: var(--border-current-active)` |
| 45 | `style.indicator.border@underline-focus` | style | switchable | `border-bottom-width: 2px; border-bottom-color: var(--border-current-active)` | **off** | `border-bottom-width: 2px; border-bottom-color: var(--indicator-current-active)` |
| 46 | `style.indicator.border@box-focus` | style | switchable | `border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: var(--border-current-active)` | **off** | **off** |
| 47 | `style.root.focus` | style | switchable | `outline: 2px dotted var(--outline-current)` | `outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring-current) var(--ring-alpha-current), transparent), 0 1px 2px 0 var(--shadow-color)` | **off** |
| 48 | `style.root.background@readonly` | style | switchable | ⟡ `bg-current-readonly` | **off** | **off** |
| 49 | `style.root.border-color@readonly` | style | switchable | ⟡ `border-readonly` | **off** | **off** |
| 50 | `style.indicator.border-color@readonly` | style | switchable | ⟡ `border-readonly` | **off** | **off** |
| 51 | `style.root.background@disabled` | style | switchable | ⟡ `bg-current-disabled` | **off** | ⟡ `bg-disabled` |
| 52 | `style.root.background@box-disabled` | style | switchable | — | — | `transparent` |
| 53 | `style.root.color@disabled` | style | switchable | ⟡ `fg-disabled` | **off** | ⟡ `fg-disabled` |
| 54 | `style.root.border-color@disabled` | style | switchable | ⟡ `border-disabled` | **off** | ⟡ `outline-disabled` |
| 55 | `style.indicator.border-color@disabled` | style | switchable | ⟡ `border-disabled` | **off** | ⟡ `indicator-disabled` |
| 56 | `style.control.disabled` | style | switchable | `cursor: not-allowed` | `opacity: 0.5; cursor: not-allowed; pointer-events: none` | **off** |
| 57 | `style.adornment.size` | style | switchable | ⟡ `adornment-button-height` | **off** | `24px` |
| 58 | `style.status-adornment.size` | style | switchable | `height: var(--adornment-size); width: var(--adornment-size)` | **off** | **off** |
| 59 | `style.status-adornment.color` | style | switchable | ⟡ `border-current` | **off** | **off** |
| 60 | `style.root.variant@secondary` | style | switchable | `--bg-current: var(--field-bg-secondary); --bg-current-disabled: var(--field-bg-secondary-disabled)` | **off** | **off** |
| 61 | `style.root.variant@tertiary` | style | switchable | `--bg-current: var(--field-bg-tertiary); --bg-current-disabled: var(--field-bg-tertiary-disabled)` | **off** | **off** |
| 62 | `style.root.status@error` | style | switchable | `--border-current: var(--status-error); --border-current-hover: var(--status-error); --border-current-active: var(--status-error); --outline-current: var(--status-error); --bg-current: var(--status-error-bg); --bg-current-readonly: var(--status-error-bg)` | `--border-current: var(--danger); --border-current-active: var(--danger); --ring-current: var(--danger); --ring-alpha-current: var(--ring-alpha-invalid)` | `--border-current: var(--status-error); --border-current-hover: var(--status-error-hover); --border-current-active: var(--status-error); --indicator-current: var(--status-error); --indicator-current-hover: var(--status-error-hover); --indicator-current-active: var(--status-error); --caret-current: var(--status-error)` |
| 63 | `style.root.status@warning` | style | switchable | `--border-current: var(--status-warning); --border-current-hover: var(--status-warning); --border-current-active: var(--status-warning); --outline-current: var(--status-warning); --bg-current: var(--status-warning-bg); --bg-current-readonly: var(--status-warning-bg)` | **off** | **off** |
| 64 | `style.root.status@success` | style | switchable | `--border-current: var(--status-success); --border-current-hover: var(--status-success); --border-current-active: var(--status-success); --outline-current: var(--status-success); --bg-current: var(--status-success-bg); --bg-current-readonly: var(--status-success-bg)` | **off** | **off** |

<details><summary>Citations — 133 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.root-wrapper` | salt | Input.tsx renders <div class="saltInput"> containing the adornment containers, <input class="saltInput-input">, the StatusAdornment and <div class="saltInput-activationIndicator"> |
| `structure.root-wrapper` | shadcn | input.tsx renders a bare <input data-slot="input"> — there is no wrapper element, so every box style (border, background, padding, radius, height, shadow) sits on the input element itself |
| `structure.root-wrapper` | m3 | [R] — no live component; a container element is implied by the field token family (leading/trailing content spaces, an activation indicator, a container colour), all of which need somewhere to live beside the text |
| `structure.indicator` | salt | Input.tsx bordered?: boolean, default false; Input.css .saltInput-bordered / .saltInput-activationIndicator |
| `structure.indicator` | shadcn | input.tsx: `border border-input` |
| `structure.indicator` | m3 | _md-comp-filled-text-field.scss active-indicator-* vs _md-comp-outlined-text-field.scss outline-* |
| `structure.start-adornment` | salt | Input.tsx startAdornment prop -> .saltInput-startAdornmentContainer |
| `structure.start-adornment` | shadcn | no adornment slot on the bare input; adornments are the separate `input-group` component (docs/COMPONENTS.md), out of scope |
| `structure.start-adornment` | m3 | leading-icon-size 24px, leading-icon-color, with-leading-content-leading-space |
| `structure.end-adornment` | salt | Input.tsx endAdornment prop -> .saltInput-endAdornmentContainer |
| `structure.end-adornment` | shadcn | same as structure.start-adornment |
| `structure.end-adornment` | m3 | trailing-icon-size 24px, trailing-icon-color, error-trailing-icon-color, with-trailing-content-trailing-space |
| `structure.status-adornment` | salt | Input.tsx: {!isDisabled && validationStatus && <StatusAdornment status={validationStatus} />} — inserted by the component itself, note the explicit suppression while disabled |
| `structure.status-adornment` | shadcn | no icon concept on input at all |
| `structure.status-adornment` | m3 | M3 recolours a trailing icon on error (error-trailing-icon-color) but never inserts one — the glyph is always consumer-supplied. A precise distinction, not a gap; see the icons provenance entry. |
| `behavior.status-inheritance` | salt | Input.tsx useFormFieldProps() — see the form-field-context provenance entry for the exact (non-uniform) precedence rules |
| `behavior.status-inheritance` | shadcn | no context channel. shadcn's Field marks itself data-invalid; the input's own aria-invalid is set per instance by the consumer (content/docs/components/radix/input.mdx Invalid section) |
| `behavior.status-inheritance` | m3 | [R] — no context mechanism exists in a tokens-only clone |
| `behavior.empty-readonly-marker` | salt | Input.tsx emptyReadOnlyMarker = "—"; isEmptyReadOnlyValue() treats null/undefined/''/[] as empty and substitutes the marker for the value |
| `behavior.empty-readonly-marker` | shadcn | no equivalent — an empty read-only shadcn input renders empty |
| `behavior.empty-readonly-marker` | m3 | no equivalent concept |
| `prop.variant` | salt | Input.tsx variant?: "primary" \| "secondary" \| "tertiary", default "primary" |
| `prop.variant` | shadcn | no background-intensity axis |
| `prop.variant` | m3 | M3's only variant axis IS filled-vs-outlined, already modelled as structure.indicator. Recording it here as well would invent a second axis M3 does not have and would let two harness toggles contradict each other. |
| `prop.validation-status` | salt | Input.tsx validationStatus?: FormFieldValidationStatus |
| `prop.validation-status` | shadcn | input.tsx aria-invalid:border-destructive aria-invalid:ring-destructive/20 |
| `prop.validation-status` | m3 | _md-comp-{filled,outlined}-text-field.scss error-* family |
| `prop.text-align` | salt | Input.tsx textAlign = "left", written as an inline --input-textAlign custom property that .saltInput-input's text-align reads |
| `prop.text-align` | m3 | no text-align token in either file |
| `prop.disabled` | salt | Input.tsx disabled (also OR-ed with form-field context) |
| `prop.disabled` | shadcn | input.tsx disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50; examples/input-disabled.tsx |
| `prop.disabled` | m3 | disabled-* opacity family (container 0.04, outline 0.12, active-indicator 0.38, input-text 0.38) |
| `prop.read-only` | salt | Input.tsx readOnly (also OR-ed with form-field context); .saltInput-readOnly has its own background, border colour and cursor |
| `prop.read-only` | shadcn | examples/input-group-button.tsx uses readOnly on an InputGroupInput; input.tsx has no read-only: variant |
| `prop.read-only` | m3 | no read-only token in either text-field file |
| `state.read-only` | shadcn | no distinct visual state — see prop.read-only |
| `style.root.background` | m3 | the filled variant's container-color |
| `style.root.background@box` | salt | `bordered` changes the border and nothing else — the background is untouched. A real non-variation, confirmed by reading .saltInput-bordered (Input.css 27-53): it declares border only. |
| `style.root.background@box` | shadcn | box is shadcn's only mode; already covered by style.root.background |
| `style.root.background@box` | m3 | _md-comp-outlined-text-field.scss has NO container-color token at all — a confirmed absence, and the outlined variant's defining difference |
| `style.root.color` | shadcn | ambient --foreground; input.tsx sets no text-colour class |
| `style.root.font` | shadcn | the >=768px value — see the type-body provenance entry's declared generator gap |
| `style.root.letter-spacing` | salt | Input.css letter-spacing: var(--salt-text-letterSpacing) -> next/characteristics/text.css: 0 |
| `style.root.letter-spacing` | shadcn | no tracking utility on the element |
| `style.root.letter-spacing` | m3 | input-text-tracking -> body-large-tracking |
| `style.root.height` | shadcn | input.tsx h-9; density-invariant (shadcn has no density capability — docs/foundations/density.md) |
| `style.root.height` | m3 | DECLARED GAP. Was 56px, sourced from container-height in versions/latest/sass/_md-comp-{filled,outlined}-text-field.scss — a token that arrives there already @deprecated ('Removing fixed height token due to conflicts with text fields variants requiring dynamic height (multi-line, text area).'). versions/v0_192 has NO height token in either text-field file; grep for container-height returns nothing |
| `style.root.min-width` | salt | Input.css min-width: var(--saltInput-minWidth, 4em) |
| `style.root.min-width` | shadcn | input.tsx min-w-0 |
| `style.root.min-width` | m3 | no width token in either file |
| `style.root.padding` | shadcn | input.tsx py-1 px-3 |
| `style.root.padding` | m3 | top/bottom/leading/trailing-space, tokens/_md-comp-{filled,outlined}-field.scss — a declared cross-edition borrow |
| `style.root.gap` | shadcn | no adornments and no wrapper for a gap to live on |
| `style.root.gap` | m3 | content-space, tokens/_md-comp-{filled,outlined}-field.scss |
| `style.root.shape` | m3 | filled container-shape -> md-sys-shape corner-extra-small-top = `4px 4px 0px 0px` |
| `style.root.shape@box` | salt | corner radius is independent of `bordered` — one border-radius declaration on .saltInput serves both |
| `style.root.shape@box` | shadcn | box is the only mode; already covered by style.root.shape |
| `style.root.shape@box` | m3 | outlined container-shape -> corner-extra-small = 4px, all four corners |
| `style.root.cursor` | salt | Input.css .saltInput:hover { cursor: var(--salt-cursor-text) } and .saltInput-focused { cursor: var(--salt-cursor-text) } |
| `style.root.cursor` | shadcn | no cursor class at rest — the native <input> default applies |
| `style.root.cursor` | m3 | no cursor token |
| `style.root.shadow` | salt | no box-shadow anywhere in Input.css — a confirmed absence |
| `style.root.shadow` | shadcn | input.tsx shadow-xs |
| `style.root.shadow` | m3 | no elevation/shadow token in either text-field file |
| `style.root.transition` | salt | no transition and no animation rule anywhere in Input.css — the same total absence TOOLTIP-MATRIX.md found on Salt's tooltip |
| `style.root.transition` | shadcn | input.tsx transition-[color,box-shadow] |
| `style.root.transition` | m3 | no motion token in either text-field file |
| `style.control.placeholder` | salt | Input.css .saltInput-input::placeholder { color: var(--salt-content-secondary-foreground); font-weight: var(--salt-text-fontWeight-small) } |
| `style.control.placeholder` | shadcn | input.tsx placeholder:text-muted-foreground — colour only, no weight change |
| `style.control.placeholder` | m3 | input-text-placeholder-color -> on-surface-variant; colour only, no weight change |
| `style.control.caret-color` | salt | no caret-color declaration in Input.css — the platform default applies |
| `style.control.caret-color` | shadcn | no caret-color utility — the platform default applies |
| `style.control.caret-color` | m3 | caret-color -> primary; reassigned to error by style.root.status@error |
| `style.root.border@box` | salt | Input.css .saltInput-bordered.saltInput { border: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--input-borderColor) } |
| `style.root.border@box` | shadcn | input.tsx `border border-input`; the 1px width is Tailwind's undeclared default (docs/foundations/border-style.md) |
| `style.root.border@box` | m3 | outlined: outline-width 1px, outline-color -> md-sys-color.outline |
| `style.indicator.border@underline` | salt | Input.css .saltInput-activationIndicator { border-bottom: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--input-borderColor) } — the SAME indirection the box border reads, so one status reassignment recolours both |
| `style.indicator.border@underline` | shadcn | no underline mechanism of any kind |
| `style.indicator.border@underline` | m3 | filled: active-indicator-height 1px, active-indicator-color -> on-surface-variant (a DIFFERENT sys-color role from the outlined variant's outline) |
| `style.root.border@box-hover` | salt | Input.css .saltInput-bordered.saltInput:hover { border-color: var(--input-borderColor-hover) } |
| `style.root.border@box-hover` | shadcn | CONFIRMED ABSENCE — there is no hover: class anywhere in input.tsx |
| `style.root.border@box-hover` | m3 | outlined: hover-outline-color -> on-surface; hover-outline-width stays 1px |
| `style.indicator.border@underline-hover` | salt | Input.css .saltInput:hover .saltInput-activationIndicator { border-bottom-color: var(--input-borderColor-hover) } |
| `style.indicator.border@underline-hover` | m3 | filled: hover-active-indicator-color -> on-surface; hover-active-indicator-height stays 1px |
| `style.root.border@box-focus` | salt | Input.css .saltInput-bordered.saltInput-focused { border-color: var(--input-borderColor-active) } — recolour only, width unchanged |
| `style.root.border@box-focus` | shadcn | input.tsx focus-visible:border-ring — recolour only, width unchanged |
| `style.root.border@box-focus` | m3 | versions/v0_192/_md-comp-outlined-text-field.scss 'focus-outline-width': 2px (hardcoded literal) and 'focus-outline-color' -> md-sys-color.primary. VALUE CHANGED BY THE PIN: latest binds focus-outline-width to md-sys-state-focus-indicator.$thickness = 3px, and that file does not exist in v0.192. The outlined variant's focus stroke now thickens 1px -> 2px, matching the filled variant's focus-active |
| `style.indicator.border@underline-focus` | salt | Input.css .saltInput-focused .saltInput-activationIndicator { border-bottom: var(--salt-size-fixed-200) var(--salt-borderStyle-solid) var(--input-borderColor-active) } — 1px -> 2px, the same thickening M3's filled field does with the same numbers |
| `style.indicator.border@underline-focus` | m3 | filled: focus-active-indicator-height 2px, focus-active-indicator-color -> primary |
| `style.indicator.border@box-focus` | salt | Input.css: .saltInput-bordered .saltInput-activationIndicator { border-bottom-width: 0 } EXCEPT .saltInput-bordered.saltInput-focused .saltInput-activationIndicator { border-bottom-width: var(--salt-size-fixed-100) } — the indicator returns at 1px on top of the box border when a bordered input is focused |
| `style.indicator.border@box-focus` | m3 | an outlined M3 field has no activation indicator at all |
| `style.root.focus` | salt | Input.css .saltInput-focused { outline: var(--salt-focused-outlineWidth) var(--salt-focused-outlineStyle) var(--input-outlineColor) } -> 2px dotted, colour = accent-stronger or the status colour |
| `style.root.focus` | shadcn | input.tsx outline-none + focus-visible:ring-[3px] focus-visible:ring-ring/50 — a translucent ring drawn as a box-shadow. The alpha is read through ring-alpha-current so the aria-invalid rule can change only the alpha (20% light / 40% dark) without duplicating the whole shadow. The shadow-xs layer is repeated after the ring because Tailwind v4 composes box-shadow as `var(--tw-ring-shadow), var(--tw |
| `style.root.focus` | m3 | no separate focus ring or overlay — focus is expressed entirely by the indicator/outline thickening and recolouring above. The focus-indicator-outline-* tokens exist but are explicitly @deprecated in favour of the focus outline tokens; see the no-focus-ring provenance entry. |
| `style.root.background@readonly` | salt | Input.css .saltInput.saltInput-readOnly { background: var(--input-background-readonly) } |
| `style.root.background@readonly` | shadcn | no read-only style — see the no-readonly-style provenance entry |
| `style.root.background@readonly` | m3 | no read-only token |
| `style.root.border-color@readonly` | salt | Input.css .saltInput-bordered.saltInput-readOnly { border-color: var(--salt-editable-borderColor-readonly) } |
| `style.indicator.border-color@readonly` | salt | Input.css .saltInput-readOnly .saltInput-activationIndicator { border-bottom-color: var(--salt-editable-borderColor-readonly) } |
| `style.root.background@disabled` | salt | Input.css .saltInput.saltInput-disabled { background: var(--input-background-disabled) } |
| `style.root.background@disabled` | shadcn | one blanket opacity:0.5 on the element does the whole job — see style.control.disabled |
| `style.root.background@disabled` | m3 | filled: disabled-container-color -> on-surface at disabled-container-opacity 0.04 |
| `style.root.background@box-disabled` | m3 | disabled-container-opacity is a FILLED-only token; the outlined variant has no container colour to fade, so it stays transparent when disabled. Without this row the shared disabled-background rule would tint it, inventing a value source does not have. |
| `style.root.color@disabled` | salt | Input.css .saltInput.saltInput-disabled { color: var(--saltInput-color-disabled, var(--salt-content-primary-foreground-disabled)) } |
| `style.root.color@disabled` | shadcn | same — opacity, not a recolour |
| `style.root.color@disabled` | m3 | disabled-input-text-color -> on-surface at disabled-input-text-opacity 0.38 |
| `style.root.border-color@disabled` | salt | Input.css .saltInput-bordered.saltInput-disabled { border-color: var(--salt-editable-borderColor-disabled) } |
| `style.root.border-color@disabled` | shadcn | same |
| `style.root.border-color@disabled` | m3 | outlined: disabled-outline-color -> on-surface at disabled-outline-opacity 0.12 |
| `style.indicator.border-color@disabled` | salt | Input.css .saltInput-disabled .saltInput-activationIndicator { border-bottom-color: var(--salt-editable-borderColor-disabled) } |
| `style.indicator.border-color@disabled` | m3 | filled: disabled-active-indicator-color -> on-surface at disabled-active-indicator-opacity 0.38 — three times the outline's 12% |
| `style.control.disabled` | salt | Input.css .saltInput.saltInput-disabled { cursor: var(--salt-cursor-disabled) } |
| `style.control.disabled` | shadcn | input.tsx disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none |
| `style.control.disabled` | m3 | no cursor or pointer-events token; M3's disabled treatment is entirely the per-element opacities already applied in the colour rows above |
| `style.adornment.size` | salt | DECLARED COMPOSITION — this is Salt sizing a composed Button, not an icon; see the byDensity.adornment-button-height provenance entry |
| `style.adornment.size` | m3 | leading-icon-size / trailing-icon-size |
| `style.status-adornment.size` | salt | StatusAdornment.css height/min-height: var(--salt-size-adornment) |
| `style.status-adornment.color` | salt | aliased to the border indirection because in source they resolve to the identical value: --statusAdornment-color -> status-{s}-foreground-decorative -> palette-{role}, and --input-borderColor -> status-{s}-borderColor -> the same palette-{role} |
| `style.root.variant@secondary` | salt | Input.css .saltInput-secondary { --input-background: var(--salt-editable-secondary-background); --input-background-disabled: var(--salt-editable-secondary-background-disabled) } |
| `style.root.variant@secondary` | shadcn | no variant axis |
| `style.root.variant@secondary` | m3 | no such axis — see prop.variant |
| `style.root.variant@tertiary` | salt | Input.css .saltInput-tertiary { --input-background: var(--salt-editable-tertiary-background); --input-background-disabled: var(--salt-editable-tertiary-background-disabled) } |
| `style.root.variant@tertiary` | shadcn | no variant axis |
| `style.root.variant@tertiary` | m3 | no such axis — see prop.variant |
| `style.root.status@error` | salt | Input.css .saltInput-error { --input-background; --input-background-readonly; --input-borderColor; --input-borderColor-active; --input-borderColor-hover; --input-outlineColor } — six properties in one block, reproduced one-for-one |
| `style.root.status@error` | shadcn | input.tsx aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40. Background is deliberately untouched — the same 'the tone axis does not move the background' non-variation alert.shadcn.json found. |
| `style.root.status@error` | m3 | error-outline-color / error-hover-outline-color / error-focus-outline-color; error-active-indicator-color / error-hover-active-indicator-color / error-focus-active-indicator-color; error-focus-caret-color. The hover entries resolve to on-error-container, NOT error — M3 is the only system whose hover colour in the error state is a different role from its rest colour. |
| `style.root.status@warning` | salt | Input.css .saltInput-warning |
| `style.root.status@warning` | shadcn | no warning state exists at all — shadcn's whole validation axis is the single aria-invalid boolean |
| `style.root.status@warning` | m3 | no warning-* token exists in either text-field file — confirmed by direct grep |
| `style.root.status@success` | salt | Input.css .saltInput-success |
| `style.root.status@success` | shadcn | no success state exists at all — see style.root.status@warning |
| `style.root.status@success` | m3 | no success-* token exists in either text-field file — confirmed by direct grep |

</details>

<!-- END GENERATED VALUES -->
