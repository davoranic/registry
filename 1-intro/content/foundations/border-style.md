# Border style foundations

| token | Salt | shadcn | M3 |
|---|---|---|---|
| style | `--salt-borderStyle-solid`: `solid` · `-dashed`: `dashed` · `-dotted`: `dotted` | not tokenized — components write `border` (Tailwind default = `solid`) directly, no style token exists | not tokenized in the sys files checked (color/shape/elevation/motion/state/typescale); M3 borders are typically `outline` shorthand literals in `_md-comp-*.scss`, always solid, no style token |
| width | `--salt-size-fixed-100`: 1px (the standard hairline; also reused as border width) · `--salt-size-fixed-200`: 2px (used for the focus outline width) | `border` = 1px (Tailwind default, undeclared) | `date-today-container-outline-width`: 1px (component-literal, no shared width token) |

Source: `salt-ds/packages/theme/css/foundations/borderStyle.css` (full
file — 3 tokens total, this is genuinely all Salt declares); size tokens
cross-referenced from `foundations/size.css`.

**Flag.** Salt is the only system that tokenizes border *style* at all
(solid/dashed/dotted as named values) — this directly explains why Salt's
calendar uses a real `dotted` focus ring (`characteristics/focused.css`)
while shadcn and M3 only ever produce solid outlines: there's no dashed/
dotted token to reach for in those systems, not a stylistic choice made
per-component.
