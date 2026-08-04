# Density foundations

Density is not a value — it's a **capability model**, and the three
systems implement genuinely different ones. Recorded here as its own page
because a design system's density *mechanism* is itself foundational
information a component matrix must know before it can declare a
`prop.density` row correctly.

| | Salt | shadcn | M3 |
|---|---|---|---|
| model | **global foundation rescale** — a `.salt-density-{high,medium,low,touch,mobile}` class on any ancestor rescales `size`, `spacing`, `curve` (radius), and the `text`/`layout` characteristics simultaneously for every descendant | **none** — no density concept exists; every component ships one fixed size | **per-component height arithmetic** — `height = baseline − 4px × scale` (MDC density model), applied per-component via a density-class hook (`comfortable`/`compact` etc. in some components), not a global cascading rescale |
| levels | 5: high, medium, low, touch, mobile (mobile is the newest, replaces `touch` per Salt's own docs — `touch` is documented deprecated) | — | ~3-4 discrete steps per component that supports it (not all M3 components do) |
| what rescales | control height, icon/bar/indicator/adornment sizes, spacing unit, corner radius steps, full type scale (see Typography, Sizes, Spacing, Shape pages — same source) | — | component height only; typography, corner radius, and spacing do NOT rescale with M3 density |
| a11y interaction | none documented — Salt's touch-target sizing is baked into the touch/mobile density steps themselves | — | applying a denser M3 step can drop a component below the 48dp minimum touch target — density and accessibility compliance can conflict, an M3-documented tradeoff |
| propagation | global (cascades to all descendants of the class) | — | local (leaf component only; a denser button does not affect its siblings) |

Source: `salt-ds/packages/theme/css/foundations/{size,spacing,curve}.css`
+ `next/characteristics/{text,layout}.css` (this pipeline's own
extraction, this session); `salt-ds/packages/core/src/theme/Density.ts`
(the 5-level enum, `touch`-deprecated note); M3 density model per
`material-components/material-components-web` `packages/mdc-density`
(documented in this project's earlier research pass, §8c of
ARCHITECTURE-V2.md — not re-verified from a local clone since no MDC web
source is checked out; flagged as research-sourced, not source-verified,
pending a fuller M3 component clone).

**Consequence for the per-component pipeline**: a `prop.density` row's
cell kind isn't just "does this system have density" — the matrix schema
already anticipated this (`skeletonParams.densities` takes an array of
level names or `null`), but a future *M3* density row would need a
different shape entirely (per-component step count, not a shared level
list) — this is exactly the "density descriptor" extension flagged during
the Fluent/M3 stress tests in ARCHITECTURE-V2.md §8d, now confirmed
directly from source rather than research notes.
