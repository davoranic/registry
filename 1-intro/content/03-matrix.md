<!-- docs
title: The matrix
nav: The matrix
group: Reference
badge: Reference
description: One row per attribute, one column per design system. What it is, and how it got that shape.
-->

# The matrix

*The artifact every other document points at. Thirteen component matrices, the
schema that validates them, and every template and column refer back to what is
defined here. The operating version lives in [`../CLAUDE.md`](../CLAUDE.md)
§ THE ANATOMY, written for whoever builds next; this page is written to be
understood first.*

---

## How we got to the matrix

The six segments were not designed up front. They arrived in three moves, each
forced by something that failed.

**1 · The old anatomy files recorded the wrong thing.** They listed *which*
slots a part consumed, and never what for:

```
"root": [action, radius-control]
```

That cannot answer the only question anyone actually asks — *what is this part's
background?* It names ingredients without saying which dish.

**2 · So they became an attribute inventory** — per part, per attribute, per
state, with the system's own token beside each one:

```json
"root": {
  "background":       { "token": "button-background",         "semantic": "action" },
  "height":           { "token": "button-height",             "semantic": "control-height-md" },
  "opacity@disabled": { "token": "button-disabled-opacity",   "semantic": "opacity-disabled" }
}
```

The consequence is larger than it looks. Once the CSS is *generated* from that
file, **inventory-first stops being a preference and becomes the only possible
order.** You cannot write the stylesheet first, because the stylesheet is an
output.

**3 · Then the calendar pilot failed in a way that added two segments.** The
style layer validated cleanly — colours, sizes, spacing all correct. And the
component still failed the *native-speaker test*: it did not read as a Salt
calendar to someone who knows Salt, because the differences were in **structure**
and **content formatting**, neither of which the style layer could express.

That failure produced two rules that outrank convenience:

- **No inherited chassis.** The renderer is generated from the union of every
  system's parts. "Theme-invariant structure" is only what remains *after* every
  per-system structural difference has been made a row.
- **A coverage report that counts only style cells is lying.** Structure and
  content rows must be counted too, and a switched-on row the implementation
  cannot express fails the build.

Which is why there are six segments rather than one. Character does not live
only in colour.

## What a matrix is

A table.

- **Rows are attributes** — one row is one addressable characteristic of one
  part, optionally in one state.
- **Columns are design systems** — salt, shadcn, m3.
- **A cell is one system's answer** for one attribute.

The vocabulary is deliberately narrow. Say *row* and *cell*. Never say "token"
for a row — a token is a resolved value. Never say bare "attribute" for a DOM
`data-*` hook — that is a *data attribute*.

### Row names

Grammar: `<piece>.<part>[.<subpart>].<property>[@state]`, validated by
`contract/template.schema.json` against
`^[a-z]+\.[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*(@[a-z][a-z0-9-]*)?$`

Narrowest part last. The `@suffix` narrows to exactly one state or one
non-default axis value.

| example | reads as |
|---|---|
| `style.day.background@hover` | the day cell's background, when hovered |
| `structure.today-marker` | does a today-marker element exist at all |
| `behavior.range-selection` | can a range be selected |
| `prop.density` | the density axis a consumer sets |

## The six segments

Each has a test. If you cannot answer the test, the row is in the wrong segment.

| segment | holds | the test |
|---|---|---|
| `structure` | parts — does this element exist at all | would removing it change the DOM tree? |
| `behavior` | what it does — ARIA, keyboard, focus, dismissal | is it invisible in a screenshot? |
| `prop` | the instance API — axes a consumer sets | does the consumer choose it? |
| `slot` | consumer-owned content, and its formatting | who supplies the words? |
| `state` | interaction states the component recognises | hover / focus / selected / disabled |
| `style` | everything CSS — colour, size, shape, motion | does it resolve to a declaration? |

**Character lives in `structure` and `slot` as much as in `style`.** Salt
clamping a badge count to `999+` while shadcn prints `1000` is a `slot`
difference, and it is the entire personality of the component.

## Answering a row

### Policy — who may switch it off

| policy | meaning |
|---|---|
| `locked` | every column must express it. Turning it off is a failing build |
| `switchable` | on where the system has it, `off` — with a citation — where it does not |
| `default` | on with a registry default when a column is silent; must be labelled |

### Cell kinds

| kind | meaning |
|---|---|
| `value` | a literal |
| `alias` | points at a shared slot |
| `expression` | a `color-mix()` or `calc()` |
| `native` | the system's own token, with no shared slot yet |
| `off` | the system genuinely lacks it — **requires a note** |
| `inherit` | a registry default applies — must be labelled |

### Evidence marks

`[S]` means grepped from the clone. `[R]` means inferred from a spec page, an
APG convention, or published docs — and the reason must be given.

All Material 3 structure and behaviour is `[R]`, because `material-web` ships
tokens with no component to read. This is not a formality: **three of the
twenty-one `[R]` cells in the calendar were wrong.** `[R]` is a debt, not a
citation.

## One row, all three systems

`style.root.opacity@disabled` — the ordinary disabled state.

| | answer | kind | evidence |
|---|---|---|---|
| **Salt** | `0.4` | value | `--salt-palette-opacity-disabled` [S] |
| **shadcn** | `0.5` | value | `disabled:opacity-50` in the `cva` call [S] |
| **Material 3** | `0.12` container, `0.38` label | value ×2 | `md-comp-filled-button-disabled-*-opacity` [S] |

Three systems, three answers, and the third is not even the same *kind* of
answer — Material 3 dims the container and the text by different amounts, so
"disabled" is a different mechanism rather than a different number. A contract
that stored one opacity per component could not hold this row without lying.

## The seven ways this drifts

All seven have been observed in this repo, not imagined.

1. **A retrofit** — building on one system's component and draping the others
   over it. `check-anatomy.mjs` is the tripwire.
2. **A dead axis** — `prop` declares values that no style row discriminates, so
   three of four tones render identically and the generator still reports OK.
3. **A structure row with no size** — the part renders with no dimensions, and
   an `<svg width="100%">` inside it silently inherits 300px.
4. **Cascade inversion** — a state row emitted before the axis row it overrides,
   so it loses at equal specificity and never applies.
5. **A documented-but-unimplemented behaviour** — `info` rows have no gate.
6. **An unshared derivation** — when a system tokenises in a different *kind*
   than we emit (M3 gives dp, we need a shadow string), the conversion is ours.
   Publish it in `foundations/` the first time or it drifts once per component.
7. **An unstated denominator** — a check reporting what it examined as though it
   were everything. This has bitten three separate times and is the most
   dangerous, because the output looks clean.

## Where the matrices live

<!-- stats -->

| | | |
|---|---|---|
| 13 | component matrices written | |
| 9,723 | lines across them | |
| 8,807 | template rows behind them | |
| 246 | value slots still uncited | open |

Every `docs/<NAME>-MATRIX.md` carries a generated **Resolved values** block —
every row against every system, read from the column files by
`scripts/sync-matrix-values.py`. The prose above that block is hand-written. If
the two ever disagree, the block is the data and the prose is the claim.
