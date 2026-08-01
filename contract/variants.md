# Canonical variant axes

Variants decompose onto shared axes. Theme variant NAMES map onto axes once;
translation is then axis-to-axis, never name-to-name.

## Axes

- `emphasis`: `primary` | `secondary` | `danger` — what the action means
- `prominence`: `solid` | `outline` | `ghost` | `link` — how loudly it shows
- `size`: `sm` | `md` | `lg` — bound to `control-height-*`; themes with a
  density axis may FREEZE this axis (Salt: size comes from density, per-item
  size not offered — declared, not silent)
- `orientation`: `horizontal` | `vertical` (groups, separators, tabs)
- `tone` (status components only): `info` | `success` | `warning` | `critical`

## Worked mapping — button

| Canonical (emphasis × prominence) | shadcn | Salt |
|---|---|---|
| primary × solid | `default` | `accented` + `solid` |
| secondary × solid | `secondary` | `neutral` + `solid` |
| danger × solid | `destructive` | `negative` + `solid` |
| primary × outline | `outline` | `accented` + `outline` |
| secondary × ghost | `ghost` | `neutral` + `transparent` |
| danger × ghost | — (compose) | `negative` + `transparent` |
| primary × link | `link` | **no cell** → fallback |

## Fallback ladder (when a target theme lacks a cell)

1. **Declared fallback** in the theme adapter (Salt: `prominence:link` →
   render as `Link` component with `link` color + `type-action` off).
2. **Canonical default** for the axis (prominence → `solid`).
3. **Omit + WARN** in the translation report. Never a silent guess.

## Rule

New components MUST express their variants on these axes (extending the axis
list requires a contract change, like tokens — see translation.md
versioning). Theme adapters add a `variantMap` section per component family
as components acquire them.
