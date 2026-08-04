# Shape / corner radius foundations

| token | Salt (sharp / legacy) | Salt (rounded / theme-next, edition pin) | shadcn | M3 |
|---|---|---|---|---|
| smallest | `--salt-curve-50`: 0 (sharp maps every step to 0 except 999) | 1/2/3/4px (high/medium/low/touch) | `--radius-sm`: `calc(var(--radius) * 0.6)` | `corner-extra-small`: 4px |
| small–medium | `--salt-curve-100`: 0 | 2/4/6/8px | `--radius-md`: `calc(var(--radius) * 0.8)` | `corner-small`: 8px |
| medium | `--salt-curve-150`: 0 | 3/6/9/12px | `--radius-lg` (= base `--radius`): 0.625rem = 10px | `corner-medium`: 12px |
| large | `--salt-curve-200`: 0 | 4/8/12/16px | `--radius-xl`: `calc(var(--radius) * 1.4)` = 14px | `corner-large`: 16px |
| extra-large | `--salt-curve-250`: 0 | 5/10/15/20px | `--radius-2xl`: ×1.8 = 18px, `--radius-3xl`: ×2.2 = 22px, `--radius-4xl`: ×2.6 = 26px | `corner-extra-large`: 28px |
| pill/full | `--salt-curve-999`: 999px (all editions) | 999px | — (no pill token; components use `rounded-full`, a bare Tailwind utility) | `corner-full`: 9999px |
| none | `--salt-curve-0`: 0 (all editions) | 0 | `--radius-sm`... derive from 0 only if `--radius: 0` is set | `corner-none`: 0px |

Source: `salt-ds/packages/theme/css/foundations/curve.css` (sharp values,
all density blocks) + `salt-ds/packages/theme/css/next/palette/corner.css`
(`[data-corner="rounded"]` maps `corner-weak→curve-100`,
`corner→curve-150`, etc. — the mapping from semantic corner names to
these raw curve steps); `ui/apps/v4/app/globals.css` (`--radius: 0.625rem`
base + derived scale); `material-web/tokens/_md-sys-shape.scss` (also
carries 4 directional composite tokens — `corner-large-top`,
`corner-large-start/end`, `corner-extra-large-top` — 4-value tuples for
one-sided rounding, not simple radii; flagged as a value TYPE Salt/shadcn
don't have).

**Edition flag, stated once so it's never re-derived wrong**: Salt ships
BOTH a sharp scale (legacy, and `theme-next[data-corner="sharp"]`) and a
rounded scale (`theme-next[data-corner="rounded"]`, the official site's
configuration). This pipeline's Salt column is pinned to rounded — any
future Salt work must use the "rounded" numbers above, not the sharp
zeros, unless explicitly building the sharp variant.
