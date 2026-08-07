<!-- docs
title: How the method was determined
nav: Discovery
group: Start here
badge: Discovery
description: The architecture came out of a diagnosis, ten research passes, and a stress test that caught a flaw in our own rules.
-->

# Discovery — how the method was determined

**Source.** Condensed from [`ARCHITECTURE-V2.md`](ARCHITECTURE-V2.md) (754 lines),
written 2026-08-01. Quotations are from that document. The use case that
motivates all of it is [`USE-CASE.md`](USE-CASE.md); the process it produced is
in [`../CLAUDE.md`](../CLAUDE.md).

---

## 1 · The diagnosis

The starting point was a failure, not a blank page. The previous registry had a
**semantic tier only** — and its own rulebook *forbade* component-scoped tokens
outright (*"slots don't belong to components"*). Per-component decisions had
nowhere legal to live, so they were hand-written into stylesheets instead.

<!-- stats -->

| count | what |
|---|---|
| 82 | hardcoded opacity lines | open |
| 66 | magic-number multipliers in calc() | open |
| 55 | CSS files carrying the values | open |
| 43 | places hardcoding one focus-ring alpha | open |
| 23 of 142 | "semantic" slots that were component tokens in disguise |

The focus-ring alpha is the tell: hardcoded in 43 places at **60%**, while
shadcn's actual value is **50%**. Nobody could have caught it, because per-slot
provenance existed only as prose strings that `build-themes.py` **stripped at
compile time**. Fidelity to the source was *"undocumented, unqueryable,
unchecked."*

> Everything in the current method — the citations, the `[S]`/`[R]` marks, the
> re-resolution gate — exists to make that one sentence false.

## 2 · How the method was found

Ten research passes were run. These five changed the design.

### 2.1 Survey what the industry actually does

Every mature multi-system token architecture converges on the same shape:
**three value tiers, with tier-skipping forbidden.**

| tier | Material 3 | Salt | what lives there |
|---|---|---|---|
| 1 Foundations | `md.ref.*` | foundations + palettes (1,973 tokens) | raw stock; per-system, no meaning |
| 2 Semantic | `md.sys.*` | characteristics (15 intent groups, 446 tokens) | the shared contract, named by *intent* |
| 3 Component | `md.comp.*` | `--saltButton-*` (189 public slots) | per-component, per-part decisions |

Salt writes it as one CSS pattern on every styleable property:

```css
height: var(--saltButton-height, var(--salt-size-base));
/*          ^ override switch (empty)   ^ semantic default */
```

The override slot is *deliberately never filled by Salt itself* — it exists so
someone plugging in can flip that one switch without forking the component. In
production at JPMorgan.

**Taken into the method:** the three-tier shape, and the idea that a design system
plugs in by filling switches rather than by being rewritten.

### 2.2 Read the clones — and find they are not peers

The audit changed the mental model. The five source systems occupy **different
layers** of what a design system even is.

| system | what it actually is |
|---|---|
| **salt-ds** | full visual identity — 1,973 tokens, 548 icons, 5 densities |
| **shadcn/ui** | visual identity; its current generation *extracted character out of components* into swappable style sheets — it hit our exact problem and solved it the same direction |
| **Radix** | behaviour chassis. **Zero CSS in any published package.** Not a theme |
| **MagicUI** | motion identity on shadcn's contract (23 `--animate-*` tokens) |
| **Animate UI** | motion identity, tokenless — ~100 inline physics literals, tightly clustered |

**Taken into the method:** motion becomes a first-class token category, and every
joining system declares its *layer* — so we *"stop translating apples into
orchestras."*

### 2.3 Find that our failure already has a name

The literature names the exact anti-pattern we had hit: **"semantic tokens that
are one brand's decisions in disguise."** With a published defence attached:

- prove the contract against **two or more visually divergent systems** before
  freezing it;
- promote a decision from component tier to semantic tier only when **three or
  more components** demonstrably share it.

Semantic tokens are *earned by reuse*, never designed speculatively from one
system.

**Taken into the method:** the two-system proof requirement, and the rule that
nothing enters shared vocabulary because one system wants it.

### 2.4 Notice which of Salt's own rules survived

Salt violates its own written rules — **61 components reference the palette layer
directly**, against their own documentation. But the rules they encode as
**build-failing lint** (cross-theme token parity) hold perfectly.

> **Rules in prose decay. Rules in CI hold.**

**Taken into the method:** the vocabulary is a JSON schema that fails the build,
not a convention in a document. Every rule that matters got a gate.

### 2.5 Stress-test against three systems we don't ship

Before committing, the model was tested against **Material 3, Apple's HIG, and
Microsoft Fluent 2** — deliberately including one that is not a token system on
purpose.

**The four-layer model held against all three.** M3 maps almost one-to-one
(ref/sys/comp ↔ L1/L2/L3); Fluent's global/alias tiers are L1/L2; Apple's
semantic colour API *is* an intent-named L2 — *"Apple essentially invented that
idiom."* Nothing required a redesign.

But it caught one structural flaw, and eleven additive schema extensions.

## 3 · The flaw the stress test caught

Our own anti-retrofit gate — *"no semantic slot without proof across two or more
systems"* — **would have recreated the retrofit disease one layer up.**

Material 3 has **51 semantic colour roles**: a five-step surface-container
ladder, fixed roles, inverse roles. No second system has most of them. The gate
would have barred them from the shared tier *forever*, and their values would
have had nowhere to live except per-component switches — destroying sparse
overrides for every container-shaped component.

> Same failure, new address.

**The fix: adapter-private semantic namespaces.** A design system may declare its
own semantic slots (`x-m3-surface-container-high`) that live one level above its
component switches and resolve only inside its own fallback chains. The shared
contract stays lean and proven; a rich system keeps its full vocabulary without
leaking it into components. Promotion to the shared contract still requires the
two-system proof.

This is the clearest evidence the stress test earned its cost: the flaw was in
*our own rule*, it looked like a safeguard, and it would only have surfaced after
building against a system rich enough to trip it.

## 4 · What each system taught us

**Material 3** — the easiest and most dangerous adapter. Three of its most
characterful subsystems are **functions, not values**: colour is derived
(seed → HCT → tonal palettes → scheme). You cannot copy a Material 3 colour and
claim fidelity; you have to record which computation produced it. Hence the
edition pin to `v0.192`.

**Apple** — the boundary test, not a token system on purpose. **"Declared
absence" must exist beside "declared gap."** A contract has to distinguish *this
system chose not to have this* from *we haven't looked yet*. Fallback chains also
had to become capability-conditional.

**Fluent 2** — the friendliest adapter, 8 of 12 findings fitting as-is. No
component-token tier exists at all; 467 alias tokens flow straight into
components. High contrast is a first-class **third** mode, not a dark variant.
And **density models are genuinely plural** — Salt rescales global foundations,
others do not — so density cannot be one shared axis.

## 5 · Setting up the process

The research produced a shape; the process turns it into work. Three phases, in
order, no skipping ahead.

| phase | what | state |
|---|---|---|
| **1 · Foundations** | one reference page per raw-value category; rows are the union of that category's tokens across every system, every cell citing the system's own token name | 12 pages |
| **2 · Per-component matrices** | one matrix per component in six segments, then generate and validate the render against the real system's own code before moving on — extraction work, not design work | 18 of 79 |
| **3 · Building** | the same loop, unattended; when a judgement call has no source-backed answer, record a declared gap and move on rather than stopping | not started |

Phase 2 is where nearly all the work lives, and it is the only layer that
repeats — the ten-step build loop, run once per component, each step existing
because skipping it produced a real bug.

**One honest note on the phases.** They are not as clean as the ordering implies.
Three foundations pages were later found wrong by a component re-reading the
source, so phase 1 is not "finished" before phase 2 begins. Foundations are
evidence, not scripture.
