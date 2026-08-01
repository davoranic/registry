# Report: What two-way translation needs beyond semantic tokens

Requested analysis: if the registry must translate designs, patterns, and
future components between themes in BOTH directions, what is required outside
the semantic token contract? Answer: **five additional contracts**. Tokens
are the vocabulary; these are the grammar. Each is listed with the exact
scenario where its absence gets us stuck, and where it now lives.

## 1 · Anatomy contract — what a component IS

**Stuck scenario:** You design a new "search field" pattern in the Salt theme.
Tokens translate its colors and sizes to shadcn — but nothing says a search
field HAS a leading icon slot, a clear button, and an input part. Without a
parts list, the translator doesn't know what to rebuild, only what to paint.

**Solution:** every component gets a parts/slots definition that is
THEME-INVARIANT (a select is trigger + value + indicator + listbox + option
everywhere; themes change the recipe per part, never the parts).
→ `contract/anatomy/` (format + worked examples: button, select).

## 2 · Canonical variant axes — what a variant MEANS

**Stuck scenario:** shadcn button: default/destructive/outline/secondary/
ghost/link. Salt button: accented/neutral/negative × solid/outline/
transparent. Translate "ghost" to Salt by name and you fail; there is no
ghost. Name-to-name mapping explodes combinatorially with every new system.

**Solution:** variants decompose onto canonical axes — `emphasis`
(primary/secondary/danger), `prominence` (solid/outline/ghost/link), `size`
(sm/md/lg). Each theme maps ITS names onto the axes once. shadcn "ghost" =
prominence:ghost; Salt renders prominence:ghost as its "transparent". Missing
cells (Salt has no `link` prominence) use the declared fallback ladder — never
a silent guess. → `contract/variants.md`.

## 3 · State model + behavior contract — what a component DOES

**Stuck scenario:** A future date-picker authored here works with mouse in
one theme, breaks keyboard navigation when re-skinned, and each theme
reinvents disabled/loading/invalid treatment inconsistently.

**Solution:** (a) one canonical state list (rest, hover, active,
focus-visible, disabled, loading, selected, indeterminate, invalid, readonly,
open, dragging) — themes provide a token recipe per state, components may not
invent states; (b) behavior (keyboard, ARIA roles, focus, dismissal) is
adopted from the WAI-ARIA Authoring Practices patterns and declared
THEME-INVARIANT — behavior never translates because it never varies.
→ `contract/states.md`.

## 4 · Pattern & layout contract — how components COMPOSE

**Stuck scenario:** You design a login pattern; tokens and components
translate, but the pattern itself — regions, ordering, label placement,
responsive behavior — lives only as pixels in one theme. Rebuilding it per
theme is manual and drifts. This is the exact gap the user flagged
("patterns, layouts").

**Solution:** patterns are data: named regions, contract components with
canonical variants, layout tokens (stack/inline gaps by role), breakpoints,
content slots, responsive rules. A pattern references ONLY contract names —
so it renders into any theme automatically, inheriting each theme's
characteristics (Salt density compresses it; shadcn radius rounds it).
→ `contract/patterns.md` (format + login worked example + breakpoints).

## 5 · Translation mechanics & governance — how it stays two-way

**Stuck scenario:** Theme B lacks a capability used by a design authored in
Theme A (density, a variant cell, an icon role). Silent substitution corrupts
the design; refusal blocks work. Later the contract itself evolves and old
adapters break without warning.

**Solution:** (a) the authoring rule — everything new is authored AGAINST THE
CONTRACT, previewed through themes, never authored inside a theme; (b) the
lift procedure for the reverse direction (design captured in a theme →
decomposed into anatomy + axes + token recipe → anything unmappable becomes a
proposed contract extension or a flagged anatomy-specific item); (c) a
fallback ladder (declared per-theme fallback → canonical default → omit with
warning) and a machine-readable TRANSLATION REPORT listing every
substitution/omission, so lossiness is visible, never silent; (d) contract
versioning (semver) + adapter conformance checks so evolution doesn't strand
old themes. → `contract/translation.md`.

## Elements checked and deliberately NOT separate contracts

- **Content/voice** (case, tracking of action text): carried by the `action`
  typography role token; terminology tables can be added later per theme if
  copy translation is ever needed.
- **Motion choreography** (modal fades vs drawer slides): expressed per
  anatomy part as `motion` references to duration/easing roles — lives inside
  anatomy files, not a sixth contract.
- **Iconography**: already covered — roles + set + mechanism in the token
  contract (§8) and adapters.
- **Assets/fonts**: adapter concern (Salt's Amplitude is licensed — recorded
  as a constraint; Open Sans free). No new contract needed.
- **Design-tool bridge** (Claude Design / Figma variables): the token
  contract IS the bridge; Figma modes map 1:1 to theme+mode+density when that
  step comes. No new contract needed now.

## Standards adopted (so we don't invent what exists)

- **W3C DTCG token format** — token types/serialization (future tooling interop)
- **WAI-ARIA Authoring Practices** — behavior contract per component pattern
- Anatomy/parts model per **Open UI** research and Radix part naming

## Conclusion

With these five in place, the system holds the user's requirement: design in
our own semantic layer in Claude Design, switch themes freely, author new
patterns/components once, translate them anywhere, and when translation must
lose something, it says so out loud. The registry structure:

```
tokens/    semantic.md · base.css          — the vocabulary
contract/  anatomy/ · states.md · variants.md · patterns.md · translation.md
                                           — the grammar
themes/    theme-<ds>.json                 — the accents
docs/      token-research.md · LINKING.md · translation-report.md — the law
registry/  components                      — the things themselves
```
