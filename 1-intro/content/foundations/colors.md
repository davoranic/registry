# Color foundations

*Salt data below is a full re-extraction (2026-08-02) of `theme-next`,
confirmed edition-accurate: default accent is **blue**, set in JS
(`SaltProvider.tsx:43,169` — `DEFAULT_ACCENT = "blue"`, not a CSS
fallback; both `[data-accent="blue"]` and `[data-accent="teal"]` require
the attribute explicitly in CSS). One correction to this pipeline's own
earlier working assumption: Salt's categorical/data-viz palette has
**20 series**, not ~12 as assumed during the calendar pilot.*

## Salt — 8 base color ramps (theme-next, mode-independent raw values)

9 stops each (100 lightest → 900 darkest). Source:
`salt-ds/packages/theme/css/next/foundations/color.css`.

| stop | gray | blue | brown | green | teal | orange | red | purple |
|---|---|---|---|---|---|---|---|---|
| 100 | #E6E9EB | #EAF6FF | #F3EEE8 | #EAF5F2 | #DBF5F7 | #FFECD9 | #FFECEA | #F6F0FA |
| 200 | #D3D5D8 | #C7DEFF | #EDE5D8 | #B8E5D1 | #AFE0ED | #FFC6A1 | #FFC1BA | #F0D6F5 |
| 300 | #B1B5B9 | #9ABDF5 | #D7BA9D | #89CCAD | #83C0D6 | #F7A06A | #FF938A | #DAAFE0 |
| 400 | #91959A | #669CE8 | #B88A67 | #53B087 | #4CA1C2 | #EB7B39 | #FF5D57 | #C388CC |
| 500 | #72777D | #0078CF | #996C48 | #00875D | #1B7F9E | #C75300 | #E52135 | #A25BAD |
| 600 | #5F646A | #005EA6 | #7D532F | #006B48 | #12647E | #9E4200 | #BA1729 | #85438F |
| 700 | #4C5157 | #00457E | #673F1B | #005637 | #094A60 | #813600 | #910D1E | #682D71 |
| 800 | #3A3F44 | #002D59 | #422407 | #003F25 | #033142 | #612900 | #690413 | #491552 |
| 900 | #292E33 | #001736 | #2E1905 | #002915 | #002538 | #422000 | #450002 | #33003B |

Plus `white` #FFFFFF, `black` #000000, `transparent` (shared
`foundations/color.css`, both editions) and 7 background-specific colors:
`background-snow` #FFFFFF, `-marble` #F5F7F8, `-limestone` #FAF8F2,
`-titanium` #E2E4E5 (defined but unused by any semantic mapping — a
genuine dead value, not an omission), `-jet` #101820, `-granite` #1A2229,
`-leather` #26292B (`next/foundations/color.css:74-81`).

## Salt — semantic layers (theme-next, light/dark)

**Status** (`next/palette/{info,positive,negative,warning}.css`):

| role | light | dark |
|---|---|---|
| info | #0078CF (strong #005EA6, weakest #EAF6FF) | #0078CF (strong #669CE8, weakest #001736) |
| positive | #00875D (stronger #005637 → weakest #EAF5F2) | #00875D (stronger #89CCAD → weakest #002915) |
| negative | #E52135 (stronger #910D1E → weakest #FFECEA) | #E52135 (stronger #FF938A → weakest #450002) |
| warning | #C75300 (stronger #813600 → weakest #FFECD9) | #C75300 (stronger #F7A06A → weakest #422000) |

**Accent** (`next/palette/accent.css` — the today-marker, focus ring, and
selection-border color throughout the calendar pilot):

| stop | blue light / dark | teal light / dark |
|---|---|---|
| base | #0078CF / #0078CF | #1B7F9E / #1B7F9E |
| strong | #005EA6 / #669CE8 | #12647E / #4CA1C2 |
| stronger (focus outline) | #00457E / #9ABDF5 | #094A60 / #83C0D6 |
| weaker (selected bg) | #C7DEFF / #002D59 | #AFE0ED / #033142 |
| weakest (hover bg) | #EAF6FF / #001736 | #DBF5F7 / #002538 |

**Neutral / background / foreground** (`next/palette/{neutral,background,foreground}.css`):

| role | light | dark |
|---|---|---|
| background primary | #FFFFFF (snow) | #101820 (jet) |
| background secondary | #F5F7F8 (marble) | #1A2229 (granite) |
| background tertiary | #FAF8F2 (limestone) | #26292B (leather) |
| foreground primary | #000000 | #FFFFFF |
| foreground secondary | #4C5157 (gray-700) | #B1B5B9 (gray-300) |
| foreground visited (links) | #491552 (purple-800) | #F0D6F5 (purple-200) |
| neutral (borders etc.) | #72777D (gray-500) | #72777D (gray-500, mode-invariant) |

## Salt — categorical / data-viz palette (20 series)

Base/strong/weakest per series, light mode (dark mode inverts the
strong↔weakest direction — see full 9-stop ramps in the extraction
transcript for any series not shown resolved here):

| # | family | base | strong | weakest |
|---|---|---|---|---|
| 1 | cobalt | #4676BF | #355FA1 | #EDF4FF |
| 2 | cider | #AB6528 | #8F521F | #FFEBD9 |
| 3 | plum | #9F55C2 | #8343A1 | #F5E0FF |
| 4 | aqua | #2A8285 | #1F6D6F | #DCF7F7 |
| 5 | slate | #697694 | #545F7A | #E1E8F7 |
| 6 | rose | #B0549D | #924382 | #FFE3F9 |
| 7 | olive | #6D7C4D | #58673A | #EAF0DF |
| 8 | salmon | #BD5558 | #9A4043 | #FFE8E9 |
| 9 | indigo | #7665CF | #6255AA | #E7E3FF |
| 10 | jade | #2D8543 | #216F35 | #E1F5E6 |
| 11 | citrine | #877410 | #72620C | #FFF9D9 |
| 12 | autumn | #BD5A13 | #994912 | #FFE9D9 |
| 13 | lavender | #946694 | #7E507E | #FAEBFA |
| 14 | ocean | #008094 | #006A7A | #E3FBFF |
| 15 | smoke | #72757A | #5D6065 | #F2F5FA |
| 16 | fuchsia | #C24795 | #A7367D | #FFE8F7 |
| 17 | lime | #667D15 | #556A10 | #EFF5DC |
| 18 | fur | #996A45 | #825534 | #FFF4EB |
| 19 | violet | #636EBF | #515A9F | #EDEFFF |
| 20 | forest | #23855E | #196F4D | #EDFAF5 |

Source: `next/palette/categorical.css` + `next/foundations/color.css:164-343`
(full 9-stop ramp per family). **Correction logged**: this pipeline's
calendar-era notes assumed ~12 categorical colors; the real count,
re-verified from source, is 20.

## shadcn/ui — full color set (`ui/apps/v4/app/globals.css:99-184`, oklch)

| role | light | dark |
|---|---|---|
| background | oklch(1 0 0) | oklch(0.145 0 0) |
| foreground | oklch(0% 0 0) | oklch(0.985 0 0) |
| card / popover | oklch(1 0 0) | oklch(0.205 0 0) |
| primary | oklch(0% 0 0) | oklch(0.922 0 0) |
| primary-foreground | oklch(0.985 0 0) | oklch(0.205 0 0) |
| secondary / muted / accent | oklch(0.97 0 0) | oklch(0.269 0 0) / oklch(0.371 0 0) for accent |
| destructive | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) |
| border | oklch(0.922 0 0) | oklch(1 0 0 / 10%) |
| ring | oklch(0.708 0 0) | oklch(0.556 0 0) |
| chart-1..5 | blue-300/500/600/700/800 | same (mode-invariant) |
| sidebar (+7 sub-roles) | see source | see source |
| surface / code / selection | oklch(0.98 0 0) / derived / oklch(0% 0 0) | oklch(0.2 0 0) / derived / oklch(0.922 0 0) |

133 custom properties total in this file — the table above covers every
role family; sidebar's 7 sub-roles and code's 4 sub-roles follow the same
light/dark pattern and are omitted here only for length, not dropped from
the system.

## Material 3 — sys-color roles (`material-web/tokens/versions/v0_192/_md-sys-color.scss`)

**50 roles declared** (full list, confirmed by direct grep — not
sampled): background, error, error-container, inverse-on-surface,
inverse-primary, inverse-surface, on-background, on-error,
on-error-container, on-primary, on-primary-container, on-primary-fixed,
on-primary-fixed-variant, on-secondary, on-secondary-container,
on-secondary-fixed, on-secondary-fixed-variant, on-surface,
on-surface-variant, on-tertiary, on-tertiary-container,
on-tertiary-fixed, on-tertiary-fixed-variant, outline, outline-variant,
primary, primary-container, primary-fixed, primary-fixed-dim, scrim,
secondary, secondary-container, secondary-fixed, secondary-fixed-dim,
shadow, surface, surface-bright, surface-container,
surface-container-high, surface-container-highest,
surface-container-low, surface-container-lowest, surface-dim,
surface-tint, surface-variant, tertiary, tertiary-container,
tertiary-fixed, tertiary-fixed-dim.

Resolved to hex for the baseline scheme (seed `#6750A4`, verified this
session for the calendar pilot; the remaining ~35 roles resolve through
the same `ref-palette` mechanism but were not individually re-resolved in
this pass — **flagged as incomplete, not silently assumed**):

| role | light | dark |
|---|---|---|
| primary | #6750A4 | #D0BCFF |
| on-primary | #FFFFFF | #381E72 |
| surface | #FEF7FF | #141218 |
| on-surface | #1D1B20 | #E6E0E9 |
| on-surface-variant | #49454F | #CAC4D0 |
| surface-container-high | #ECE6F0 | #2B2930 |
| secondary-container | #E8DEF8 | #4A4458 |
| on-secondary-container | #1D192B | #E8DEF8 |

**Every M3 color is algorithmically derived** (seed color → HCT color
space → tonal palettes → scheme role mapping), not independently
authored per role — see ARCHITECTURE-V2.md §8c/§9b for the full
derivation-vs-static-capture discussion. The values above are one
resolved snapshot (the published baseline scheme), cited as such.

## Radix / MagicUI / Animate UI

Radix: zero color tokens (headless, confirmed — no CSS ships in any
published package). MagicUI and Animate UI: both consume shadcn's exact
color set above as their base (`magicui/apps/www/styles/globals.css`,
`animate-ui/packages/ui/components.json` — `cssVariables: true`,
`baseColor: "neutral"`); MagicUI adds one small extension not present in
shadcn — a 5-stop brand ramp `--color-1`..`--color-5` (light+dark) used
by its `rainbow-button` component only.
