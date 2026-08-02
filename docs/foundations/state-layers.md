# State / opacity-layer foundations

M3 is the only system with dedicated, named interaction-state opacity
tokens — this page exists mainly to document that structural difference,
which the calendar pilot already leaned on heavily (`interaction-hover`
for Salt/shadcn is a solid pre-mixed color; for M3 it's a live
`color-mix()` expression built from this table).

## M3 state-layer opacities (`_md-sys-state.scss`, complete set)

| state | opacity |
|---|---|
| hover | 0.08 |
| focus | 0.12 |
| pressed | 0.12 |
| dragged | 0.16 |

Mechanism: `color-mix(in srgb, var(--content-color) N%, transparent)`
composited over the container — never a fixed hex. This is *the* reason
M3's hover/focus cells in the calendar pilot are `expression`-kind, not
`value`-kind.

## Salt and shadcn — no equivalent

Neither system tokenizes interaction-state opacity as a shared scale.
Salt's hover/selected states are pre-composed solid colors from the
`selectable`/`interact` palette (see [Colors](colors.md)); shadcn's are
also pre-composed (`bg-accent`, `hover:bg-accent`). Salt's **disabled**
opacity is the one exception worth flagging here even though it isn't a
foundation *file*: `0.4` (40%) recurs across Salt component states
(confirmed in the calendar pilot's disabled-day cell) but is not declared
as a named foundation token — it's a convention, cited per-component.
M3's disabled convention is `0.38` (38%) on content, `0.12` on
containers — also not a named token, a convention read off multiple
`_md-comp-*.scss` files.

**Flag for phase 2**: "disabled opacity" should probably become its own
promoted contract slot once 2+ systems demonstrate the pattern (Salt 40%,
M3 38%, both conventions not tokens) — exactly the earned-promotion rule
from ARCHITECTURE-V2.md §4b.
