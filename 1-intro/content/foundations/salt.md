<!-- docs
title: Salt — foundation spec
nav: Salt
group: Foundations
badge: Foundation
description: Two tiers, 513 foundation tokens and 446 characteristics named by behavioural intent.
-->

# Salt — foundation spec

*What Salt's foundation layer contains, how a value resolves through it, and how
a component slot in this registry cites into it. Edition: **theme-next**,
`data-corner="rounded"`, default `data-accent="blue"` — the configuration the
official site runs. Measured from `salt-ds/packages/theme/css/` on 2026-08-03.*

## Shape: two tiers, plus a per-component override slot

```
foundations  (raw stock, no meaning)        513 tokens / 11 categories
      ↓
characteristics (named by INTENT)           446 tokens / 15 groups
      ↓
--saltButton-height  (component override, deliberately empty)
```

Salt writes the resolution as one CSS pattern on every styleable property:

```css
height: var(--saltButton-height, var(--salt-size-base));
/*          ^ override switch, empty by default    ^ characteristic */
```

**The override slot is never filled by Salt itself.** It exists so a consumer
can flip one switch without forking the component. That mechanism is the reason
this registry can treat Salt as a theme at all.

## Tier 1 — foundations

Raw values with no meaning attached. `theme-next` is **base foundations plus
next overrides**; colour is almost entirely replaced in next (5 base tokens
become 345).

| category | tokens | what it holds |
|---|---|---|
| color | 345 | palette ramps, per accent |
| alpha | 54 | opacity steps, including disabled |
| spacing | 33 | the spacing scale |
| animation | 20 | named animations |
| size | 16 | control and icon sizes |
| typography | 12 | families, weights, scale |
| cursor | 10 | per interaction kind |
| zindex | 9 | layer order |
| curve | 7 | easing curves |
| duration | 4 | motion durations |
| borderStyle | 3 | style, width |

## Tier 2 — characteristics, named by intent

This is the tier that matters. Salt names its semantic groups by **behavioural
intent** — not by visual role — which is what makes them hard for one brand's
aesthetics to contaminate.

| group | tokens | intent |
|---|---|---|
| actionable | 150 | anything you can act on |
| category | 100 | categorical colour, for data |
| text | 78 | text treatment, incl. `textTransform` |
| status | 23 | info / warning / error / success |
| container | 14 | surfaces that hold things |
| selectable | 14 | can be chosen |
| sentiment | 13 | positive / negative / caution |
| editable | 12 | fields that accept input |
| overlayable | 11 | things that float above |
| content | 9 | content treatment |
| separable | 8 | dividers and separators |
| focused | 6 | focus indication |
| navigable | 4 | things you move between |
| layout | 2 | layout primitives |
| target | 2 | hit targets |

**Density is a fourth axis over all of it.** `high` / `medium` / `low` / `touch`
rescale the foundation layer globally — no other system in this registry has an
equivalent, which is why `prop.size` is `off` in every Salt column.

## How a registry slot cites into this

A slot's `provenance` names the Salt token it was read from, never a bare value:

```json
"accent": "rgb(0, 120, 207)"
"provenance": { "accent": "characteristics/actionable.css --salt-actionable-primary-background" }
```

`scripts/check-values.py` re-resolves that chain — characteristic → foundation →
literal — and diffs the result against the stored value. A citation that no
longer resolves is a failing gate, not a stale comment.

## Two findings worth carrying

**Salt violates its own prose rules.** 61 components reference the palette layer
directly, against their own documentation. But every rule they encode as
build-failing lint holds perfectly. Rules in prose decay; rules in CI hold.

**The legacy theme is a documented alternate, not covered here.** It was the
source of two fidelity bugs this pipeline exists to prevent, so `theme-next` is
pinned and `legacy` is out of scope by decision rather than by omission.
