# Typography foundations

Cell format: token name → value. `—` = not applicable in this system.

## Font families

| role | Salt | shadcn | M3 |
|---|---|---|---|
| primary/body | `--salt-typography-fontFamily-openSans`: `"Open Sans"` | `--font-sans` → `--font-geist-sans`: `"Geist", sans-serif` (`ui/apps/v4/app/globals.css:8,103`) | `md.ref.typeface.plain` → Roboto (implied by material-web defaults; not a literal string token in the tokens-only clone — flag: family name not present as a value in the sparse `tokens/` checkout, only the role reference `plain`/`brand`) |
| display/heading | `--salt-typography-fontFamily-amplitude`: `"Amplitude"` | `--font-heading` → same Geist stack (no separate heading family declared) | `md.ref.typeface.brand` → distinct from `plain` (role exists; concrete family name not resolved from the tokens-only clone — same flag as above) |
| mono/code | `--salt-typography-fontFamily-ptMono`: `"PT Mono"` | `--font-mono` → `--font-geist-mono`: `"Geist Mono", monospace` | — (no mono role in M3 typescale) |
| secondary sans (MagicUI addition, not shadcn) | — | `--font-inter` (`magicui/apps/www/styles/globals.css:9`) — MagicUI-only addition on top of shadcn's set | — |

Source: `salt-ds/packages/theme/css/foundations/typography.css`;
`ui/apps/v4/app/globals.css:8,103-105`; `material-web/tokens/_md-ref-typeface.scss`
(role names only in this clone); `magicui/apps/www/styles/globals.css:8-9`.

**Flag**: Salt names its three families explicitly as literal strings —
easiest to cite. shadcn/MagicUI/Animate UI all resolve through Next.js
`next/font` at build time; the literal family strings live in font-loader
config, not in the CSS foundations, so `--font-sans` etc. are the correct
citation unit for this system. M3's `plain`/`brand` role split is real and
important (see Type scale below) but this tokens-only clone doesn't carry
the resolved family string — a gap to close if/when a fuller M3 clone is
added.

## Font weights

| Salt | shadcn/M3 |
|---|---|
| `--salt-typography-fontWeight-light`: 300 · `-regular`: 400 · `-medium`: 500 · `-semiBold`: 600 · `-bold`: 700 · `-extraBold`: 800 | Tailwind's standard `font-light/normal/medium/semibold/bold` (100–900 scale) — shadcn declares no custom weight tokens, uses Tailwind's defaults directly (flag: not tokenized by shadcn itself). M3 typescale roles each bind to `weight-regular` or `weight-medium` per role (see below) — no standalone weight scale token file in the clone. |

Source: `salt-ds/packages/theme/css/foundations/typography.css`.

## Type scale — role-by-role (Salt values at medium density; M3 in rem)

| role | Salt (medium) | shadcn (Tailwind default) | M3 |
|---|---|---|---|
| display / largest | `--salt-text-display1-fontSize`: 68px / `-lineHeight`: 88px | `text-6xl`+ (Tailwind default, not a shadcn token) | `display-large`: 3.5625rem/4rem, `brand` family, `weight-regular` |
| headline | `--salt-text-h1-fontSize`: 24px / `-lineHeight`: 32px | `text-2xl` | `headline-large`: 2rem/2.5rem, `brand`, `weight-regular` |
| title | `--salt-text-h2-fontSize`: 18px / `-lineHeight`: 24px | `text-lg` | `title-large`: 1.375rem/1.75rem, `brand`, `weight-regular` |
| body | `--salt-text-fontSize`: 12px / `-lineHeight`: 16px | `text-sm`: 0.875rem/1.25rem (`ui/apps/v4/app/globals.css`, `.dropdowns` etc. reference `text-sm`) | `body-large`: 1rem/1.5rem · `body-medium`: 0.875rem/1.25rem, `plain`, `weight-regular` |
| label | `--salt-text-label-fontSize`: 11px / `-lineHeight`: 14px | `text-sm font-medium` | `label-large`: 0.875rem/1.25rem · `label-medium`: 0.75rem/1rem, `plain`, `weight-medium` |
| caption/notation | `--salt-text-notation-fontSize`: 10px / `-lineHeight`: 13px | `text-xs`: 0.75rem/1rem | — (no distinct caption role; label-small covers it) |

Full Salt density scaling (h1/label/display1 shown; the pattern is
identical for h2/h3/h4/display2-4): touch is largest, high is smallest.

| density | h1 size/lh | label size/lh | display1 size/lh |
|---|---|---|---|
| touch | 42px / — | 14px / — | 102px / — |
| low | 32px / — | 12px / — | 84px / — |
| medium | 24px / 32px | 11px / 14px | 68px / 88px |
| high | 18px / — | 10px / — | 54px / — |
| mobile | 24px / — | 14px / — | 40px / — |

Source: `salt-ds/packages/theme/css/next/characteristics/text.css`
(density blocks `.salt-theme-next.salt-density-{touch,low,medium,high}`,
`.salt-density-mobile`); shadcn has no type-scale foundation file — every
size cited above is a bare Tailwind utility class read directly off
component source, flagged accordingly; `material-web/tokens/_md-sys-typescale.scss`
(`body-large-*`, `label-large-*` etc., full 15-role set — only the 6 most
cross-system-relevant roles shown here; all 15 exist and follow the same
`{role}-{font,size,line-height,weight}` grammar).

**Flag — shadcn has no typography foundation.** Every shadcn value in
this table is read off a specific component's Tailwind classes at time of
citation, not a declared scale. This is a real difference in kind, not
just value: Salt and M3 both *own* a type scale; shadcn inherits
Tailwind's, undeclared.
