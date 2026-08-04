# Foundations — cross-system raw-value reference

*Phase 1 of the pipeline (see CLAUDE.md). One page per category. Every
value on every page cites the design system's own token name and source
file — never a bare number invented or recalled from memory. Where a
system doesn't tokenize a category (hardcodes it) or has no equivalent at
all, that is stated explicitly as a finding, not silently omitted.*

**Systems covered**: Salt (`salt-ds`, edition-pinned to **theme-next,
`data-corner="rounded"`, default `data-accent="blue"`** — the
configuration the official saltdesignsystem.com site runs; the older
`legacy` theme is a documented alternate, not covered value-by-value here
since it was the source of two fidelity bugs this pipeline exists to
prevent), shadcn/ui (`ui`, the New York v4 style), Material 3
(`material-web` tokens, v0.192 snapshot, Web/3P/Dynamic scheme
context). Radix primitives, MagicUI, and Animate UI are noted per page
but ship no foundation layer of their own (confirmed by direct source
read, not assumed) — Radix is headless (58 read-only measurement
variables only, zero styling), MagicUI and Animate UI both consume
shadcn's exact token set as their base.

## Per-system specs

Each system's own foundation layer — its tiers, what each holds, and how a
registry slot cites into it. The three are shaped differently: Salt has two
tiers, Material 3 has three, shadcn has one.

- [Salt](salt.md) — 513 foundation tokens, 446 characteristics in 15 intent groups
- [shadcn/ui](shadcn.md) — 41 custom properties; everything else is a utility class
- [Material 3](m3.md) — 76 tonal stops, 49 computed colour roles, 84 component families

## Pages

1. [Colors](colors.md)
2. [Typography](typography.md) — font families, weights, type scale
3. [Sizes](sizes.md) — control/icon size scale
4. [Spacing](spacing.md)
5. [Border style](border-style.md) — style, width
6. [Shape / corner radius](shape.md)
7. [Cursors](cursors.md)
8. [Density](density.md) — the capability itself: which systems have one, how it rescales
9. [Motion](motion.md) — duration, easing, keyframes
10. [Elevation](elevation.md) — shadow values
11. [State / opacity layers](state-layers.md) — hover/focus/press/drag overlay opacities
12. [Z-index / layers](layers.md)

## How to use this in the per-component pipeline (phase 2)

A component's matrix cells should **alias into these pages**, not
re-derive values. If a component needs a color, look it up here by
family+stop; if it needs a size, look it up here by density; if the value
genuinely isn't here, that's a signal either the category needs a new row
(edit the relevant foundations page) or the value is truly
component-specific (and must still carry its own direct source citation —
see CLAUDE.md § The law, rule 4).
