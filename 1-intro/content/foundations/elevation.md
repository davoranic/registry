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

## M3 dp → CSS shadow: the registry's canonical derivations

Because M3 tokenises elevation as a **dp number only**, every M3 `box-shadow`
string anywhere in this registry is a **registry-authored derivation, not a
sourced token** — grade them `[R]`, and cite this table rather than
re-deriving per component.

| level | dp | derived CSS shadow |
|---|---|---|
| level0 | 0 | `none` |
| level1 | 1 | `0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)` |
| level2 | 3 | `0 1px 2px 0 rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)` |
| level3 | 6 | `0 1px 3px 0 rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15)` |

Shape of the rule: **two layers, and the alphas differ** — a tight key shadow
at 0.30 and a wider ambient shadow at 0.15, key layer first. Levels 4–5 follow
the same pattern and are added here when a component first needs them.

> **Why this table exists.** It was added after `card` found that
> `button.m3.json` had derived level1 independently as
> `0 1px 3px 1px rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.3)` — **both layers
> at 0.30 and the order swapped** — while `select`, `dialog` and `card` had all
> derived the form above. Four components, two answers, no gate that could
> notice: the generator only rejects raw colours in *rule* chunks, and these
> are legal slot values. `button.m3.json` has been corrected to match.
>
> The transferable point: **when a source system tokenises a value in a
> different KIND than we emit** — a dp number where we need a shadow string, a
> role name where we need a family — the conversion is ours, and an unshared
> conversion will drift once per component. Publish the conversion here the
> first time it is needed, or pay for it silently N times.
