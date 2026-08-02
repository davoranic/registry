# Elevation foundations

## Salt — shadow values (`next/palette/shadow.css`, theme-next edition)

| level | light | dark |
|---|---|---|
| lowest | `0 1px 3px 0 rgba(0,0,0,0.1)` | `0 1px 3px 0 rgba(0,0,0,0.5)` |
| lower | `0 2px 4px 0 rgba(0,0,0,0.1)` | `0 2px 4px 0 rgba(0,0,0,0.5)` |
| low | `0 4px 8px 0 rgba(0,0,0,0.15)` | `0 4px 8px 0 rgba(0,0,0,0.55)` |
| mediumLow | `0 6px 10px 0 rgba(0,0,0,0.2)` | `0 6px 10px 0 rgba(0,0,0,0.55)` |
| medium | `0 12px 40px 0 rgba(0,0,0,0.3)` | `0 12px 40px 0 rgba(0,0,0,0.65)` |

Shadow color is always literal black at varying opacity in every stop —
not derived from any `--salt-color-*` token, and dark mode simply raises
the opacity (0.1→0.5, 0.15→0.55, etc.) rather than changing hue.

## M3 — elevation levels (`_md-sys-elevation.scss`, dp values)

| level | dp |
|---|---|
| level0 | 0 |
| level1 | 1 |
| level2 | 3 |
| level3 | 6 |
| level4 | 8 |
| level5 | 12 |

M3's elevation is a **numeric height value** (dp), not a pre-composed
shadow string — the actual shadow rendering (blur/spread/color) is
computed per-component from this height plus the component's own
`container-shadow-color` token (typically `--md-sys-color-shadow`,
usually black), unlike Salt which ships complete shadow shorthand
strings. This is a real structural difference in *kind*, not just value.

shadcn: no elevation foundation — components use bare Tailwind
`shadow-xs`/`shadow-sm` utility classes per-instance, undeclared.

Source: `salt-ds/packages/theme/css/next/palette/shadow.css` (full file);
`material-web/tokens/_md-sys-elevation.scss` (full file, 6 levels).
