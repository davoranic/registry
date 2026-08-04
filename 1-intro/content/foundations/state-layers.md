# State / opacity-layer foundations

M3 is the only system with dedicated, named interaction-state opacity
tokens — this page exists mainly to document that structural difference,
which the calendar pilot already leaned on heavily (`interaction-hover`
for Salt/shadcn is a solid pre-mixed color; for M3 it's a live
`color-mix()` expression built from this table).

## M3 state-layer opacities (`_md-sys-state.scss`, complete set)

**These values are EDITION-DEPENDENT — always pair them with the adapter's
edition pin.** The table below was written without naming an edition; the
numbers are `v0.192`'s. Two of the four moved in `latest`:

| state | `v0.192` | `latest` |
|---|---|---|
| hover | 0.08 | 0.08 |
| focus | **0.12** | **0.1** |
| pressed | **0.12** | **0.1** |
| dragged | 0.16 | 0.16 |

Sources: `material-web/tokens/versions/v0_192/_md-sys-state.scss`
(`'focus-state-layer-opacity': 0.12`, `'pressed-state-layer-opacity': 0.12`)
vs `versions/latest/sass/_md-sys-state.scss` (`$focus-state-layer-opacity:
0.1`, `$pressed-state-layer-opacity: 0.1`). Re-grepped 2026-08-02 while
building the tabs matrix.

> **No component value is wrong because of this.** Audited at the time of
> the correction: `button` and `calendar` cite 0.12 for state layers and are
> both pinned to `v0.192`, where 0.12 is correct. `input` and `select` cite
> 0.12 for `disabled-outline-opacity` — a per-component token that is
> genuinely 0.12 in `latest` too (`_md-comp-outlined-text-field.scss:34`),
> not a state layer that merely shares the number. `tabs` pins `latest` and
> correctly uses 0.1. The defect was in this page's ambiguity, not in the
> columns that read it.
>
> The transferable point: **a foundations row without an edition pin is a
> latent error in every component that trusts it.** This is the second such
> case (see the Roboto correction in `typography.md`); both were found by a
> component build re-grepping rather than reusing, which is why rule 4's
> "verify from the clone" applies to our own foundations pages too, not just
> to the design systems'.

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
