# Spacing foundations

| token | high | medium | low | touch | mobile | shadcn | M3 |
|---|---|---|---|---|---|---|---|
| unit (`--salt-spacing-100`) | 4px | 8px | 12px | 16px | 16px | no shared unit; per-component literals (`p-3`=12px, `gap-4`=16px — Tailwind's 4px base grid, undeclared as a shadcn token) | no shared unit token in the tokens-only clone; M3 spacing is per-component dp literals in `_md-comp-*.scss` |
| derived (`--salt-spacing-25/50/75/150/200...950`) | all `calc(N × --salt-spacing-100)`, N = 0.25 to 9.5 in 0.5 steps, **except mobile**: linear ramp starting 4px, NOT proportional (25:4, 50:8, 75:12, 100:16, 150:18, 200:20...950:50) — a genuine density-model discontinuity, not an oversight | | | | | — | — |
| fixed (`--salt-spacing-fixed-100..1200`) | 1px–12px, identical across all 5 densities | | | | | — | — |

Source: `salt-ds/packages/theme/css/foundations/spacing.css` (full file).

**Flag.** Same pattern as Sizes: Salt has one spacing unit every
component multiplies from; shadcn has Tailwind's ungoverned 4px grid used
ad hoc; M3 has no shared spacing foundation at all in this clone — every
`_md-comp-*.scss` file states its own dp gaps/padding as literals with no
cross-reference to a spacing scale token.
