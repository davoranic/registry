<!-- docs
title: Design systems as themes
nav: Overview
group: Start here
badge: Case study · 2026
description: Can any UI repository on GitHub be consumed as a theme? This is the project built to find out.
-->

# Design systems as themes — the use case

*Why this project exists, written as a case study rather than a spec. The
technical record is [`ARCHITECTURE-V2.md`](ARCHITECTURE-V2.md); the operating
manual is [`../CLAUDE.md`](../CLAUDE.md). This document answers a question
neither of those does: **why did anyone start this.***

**Provenance.** Reconstructed 2026-08-03 from evidence, because no goal
statement existed in this repo. Sources: the portfolio repo
(`~/Windsurf Projects/portfolio` — `README.md`,
`docs/decisions/adr-platform-portfolio-split.md` 2026-07-26,
`docs/archive/portfolio-platform-market-research.md` 2026-07-18), this repo's
own commit history (`b97c14c` first commit, `fcb48f6` the pivot), and the
session transcripts of 2026-06-27 → 2026-08-02. Inferences are marked as such
at the end — they are not presented as record.

---

## Background

The product is a **portfolio platform** — a multi-tenant service where creatives
publish their work. Its market is crowded: purpose-built portfolio tools
(Format, Pixpa, Cargo, Carrd) and general builders (Squarespace, Webflow,
Framer), against a baseline where the user's question is never *"which portfolio
tool"* but *"why pay anything at all when Behance is free."* [S: market
research, 2026-07-18]

**Tenant #1 is the owner's own portfolio** — a private, password-gated site with
a lightweight built-in CMS, Astro rendering server-side on Vercel, content and
projects stored as YAML. It is simultaneously a real product and the platform's
proving ground: features are built and hardened there before anyone else sees
them. [S: portfolio `README.md`]

Platform and portfolio are currently **one deployment sharing one credential**.
A decision record dated 2026-07-26 sets out separating them in four phases, with
one hard constraint: *finish before **tenant #2** exists.* Stores are already
partly tenant-scoped (`plan`, `projects`, `uploads`) and partly still global.
[S: `adr-platform-portfolio-split.md`]

**The interface was built in-house.** Status pills, stat cards, timelines, tags,
kanban boards, day accordions — written against a hand-maintained token set,
under a standing rule: *any pattern used **three or more times** is promoted to a
single ratified implementation and refactored everywhere it appears.*
[S: session record, 2026-06-30]

That rule surfaced the first problem. Patterns kept crossing the three-use line
and sitting unratified — copied into a new file, adjusted slightly, drifting from
the version beside it. A contemporaneous review names it directly: components
*"currently sitting unratified, which is exactly the drift the UI registry exists
to prevent."* [S: session record, 2026-06-27]

So a registry was created to hold the canonical implementation and make it
installable rather than re-copied. **This repo's first commit is exactly that** —
`registry.json` plus one component, described in its own README as *"a personal
shadcn registry… no server, no build step,"* installed with
`npx shadcn@latest add davoranic/registry/status-pill`. The component it shipped,
`status-pill`, was one of the drifting ones. [S: commit `b97c14c`, 2026-08-01]

## Problem

Then **tenant #2** came into view.

In this market, **look is the product**. A portfolio platform whose tenants all
resemble each other has nothing to sell. So the platform needed themes — and the
conventional route is to author one design system and give it several skins.

**A different bet was taken: don't author a design system, inherit them.** Treat
an existing published design system as a theme, so the theme catalogue grows by
adding a repository rather than by designing another system.

That turns a design problem into a research question, and it is the question this
entire project exists to answer:

> **Can any UI repository on GitHub be consumed as a theme?**

The pivot is visible two commits into this repo, where the README was rewritten
around *"a design system's **character** expressed as values for the contract plus
a `capabilities` declaration"* — already noting that `theme-salt` unlocks density
and fixes corners sharp while `theme-shadcn` has a free radius knob and no
density. [S: commit `fcb48f6`, 2026-08-01]

### Why these three systems

They were chosen for **distance from each other**, not convenience — to test the
approach at the extremes of maturity and complexity.

| | maturity | how it is built | the awkward part |
|---|---|---|---|
| **shadcn/ui** | young, copy-paste distribution | one file per component, Tailwind utilities in a single `cva` call | free radius knob, **no density concept at all** |
| **Salt** | enterprise, long-established | React + CSS, values indirected through shared `characteristics/` files | sizes everything from a system-wide **density** setting; corners fixed by the theme |
| **Material 3** | spec-first, very large | **tokens only — no component exists to read** | one of our components can be five of its token files |

**Material 3 was added specifically because it disagrees about what a colour
is.** Salt and shadcn treat colour as a *value* — a role points at a hex; read it
and you have it. Material 3 treats colour as a **computed position on a tonal
ramp**: `surface-container-high` does not name a colour, it names *neutral at
tone 17*, generated from a source colour under a scheme. The clone's own
generated header names the context — audience 3P, platform Web, scheme
**Dynamic** — and the ramps carry non-round stops (`neutral12`, `neutral17`,
`neutral22`) that are the signature of computation rather than hand-picking.
[S: `material-web/tokens/versions/v0_192/_md-ref-palette.scss`,
`_md-sys-color.scss`]

Two systems where colour is *stated*; one where colour is *derived*. A contract
that holds both has been tested against the widest available gap. If it only ever
had to reconcile Salt and shadcn, it would be a much easier and far less
interesting claim.

This also produced a rule now applied everywhere: **the Material 3 edition is
pinned to `v0.192`.** When values are computed rather than authored, they move
between editions, so "Material 3 says X" is meaningless without naming the
edition that computed it.

### What the three actually revealed

They are not three skins over one anatomy. **They disagree about which knobs
exist.** Salt has a density axis shadcn has never heard of; shadcn has a size axis
Salt does not have; Material 3 splits one of our components across five token
files. You cannot theme across them by swapping values, because the values do not
mean the same things — and anything that tries becomes one system wearing the
other two as paint.

That failure has a name here, and a history: **five rebuilds died of it** before
the current architecture. One system — usually shadcn, being easiest to read —
quietly became the chassis, and the other two were draped over it. The result
looks plausible and is wrong at the root, because it can never express a part the
chassis system does not have.

## Outcome

**A contract, not a stylesheet.** Every attribute of a component becomes a row;
every system answers every row in its own terms — including *"we don't have
this,"* which is recorded with evidence rather than left blank. Every value traces
back to the source file it came from.

Current state, measured from the working tree rather than asserted:

<!-- stats -->

| figure | what |
|---|---|
| 13 | components built, covering 14 of 79 canonical rows |
| 12/13 | render a genuinely different part-set per system |
| 2,334 | citations, resolving to 305 source files |
| 246 | value slots still carrying no citation | open |

That middle figure is the actual result. If all three produced the same markup,
the theme would be cosmetic and the premise false — so it is measured by a gate
(`scripts/check-anatomy.mjs`) that exists for no other purpose.

**The working answer to the research question is: yes, at a price.** Each design
system costs a column of cited values, and the differences that must be absorbed
are structural rather than decorative. Once that is paid, drift stops — there is
one implementation — and a fourth design system is a column, not a rewrite.

### What is not yet true

- **246 of 497 value slots carry no citation.** They were read from source, but
  the pointer back was never written down, so they cannot currently be
  re-verified. Concentrated in select, input, badge, card.
- **Four of the ten build steps have no automated check**, only judgement.
- **6 of 13 components have a behaviour test**; calendar was generated but never
  visually validated.
- The claim is proven at 13 components, not at 79. Nothing here says it holds at
  scale — only that it has not broken yet.

---

## Marked inferences

Two links above are reconstruction, not record, and should not harden into fact:

1. **"Tenant #2 needs a different look, therefore the registry."** The record
   shows multi-tenant theming explicitly *trigger-gated on tenant #2*, and shows
   this repo starting immediately afterward. No one wrote that causal sentence at
   the time.
2. **Maturity-and-complexity spread as the selection criterion** for the three
   systems. Confirmed by the owner in conversation (2026-08-03), not documented
   at the time of choosing.
