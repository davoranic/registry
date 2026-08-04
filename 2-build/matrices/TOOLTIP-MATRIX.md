# Tooltip — component template matrix

*Third live component in the post-clean-slate pipeline (button, spinner
came before). Same method as [CALENDAR-MATRIX.md](CALENDAR-MATRIX.md) /
[SPINNER-MATRIX.md](SPINNER-MATRIX.md): one master template (union of all
six pieces across systems), columns per design system, rows switched
on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `x-ds:` = system's native token, no shared slot yet ·
`OFF` = row switched off in this column · `INHERIT` = system silent,
registry default applies (labeled) · `[S]` = value extracted from source
this session · `[R]` = no source file to grep (see note); needs
verification before treating as authoritative.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

## Scope note — plain tooltip only

shadcn calls its whole component "tooltip." Salt ships **two** related-but-
distinct components: `Tooltip` (hover/focus, no dismiss-persistence) and
`Toggletip` (click-triggered, stays open, has its own trigger/panel
components — `packages/core/src/toggletip/{Toggletip,ToggletipPanel,
ToggletipTrigger}.tsx`). Material 3's token schema likewise ships **two**
families: `_md-comp-plain-tooltip.scss` (container + supporting-text only)
and `_md-comp-rich-tooltip.scss` (adds a subhead, a longer supporting-text
role, and an `action` region with its own hover/focus/pressed state-layer
tokens — a materially bigger component, structurally closer to a compact
popover than a tooltip).

**This matrix scopes to the plain/basic hover tooltip only**: Salt's
`Tooltip` (not `Toggletip`) and M3's `plain-tooltip` (not `rich-tooltip`).
Both exclusions are declared, not silently dropped — same treatment
SPINNER-MATRIX.md gave M3's `wave`/`thick` variants and the determinate-
progress overlap:

- **Toggletip is out of scope.** It is click/keyboard-activated (not
  hover), persists until explicitly dismissed, and its `ToggletipPanel`
  carries its own arrow/positioning wiring independent of `Tooltip`'s. It
  is a future component in its own right, not a variant of this one.
- **Rich-tooltip is out of scope.** `_md-comp-rich-tooltip.scss` defines
  `subhead-*`, a `body-medium`-sized (vs plain's `body-small`)
  `supporting-text-*`, an `action-*` family with focus/hover/pressed
  state-layer tokens, and its own `container-elevation`/`container-shadow-
  color` (plain-tooltip has no elevation token at all) — real structural
  additions, not a style variant of the plain family. Deferred to a future
  `rich-tooltip` (or `hover-card`-adjacent) matrix.

Sources: salt-ds clone `packages/core/src/tooltip/{Tooltip.tsx,
TooltipBase.tsx,Tooltip.css,useTooltip.ts,useAriaAnnounce.ts}` [S] (Salt's
`Toggletip` files exist in the same package and were read only far enough
to confirm the scope boundary above, not extracted); `ui/apps/v4/registry/
new-york-v4/ui/tooltip.tsx` [S] (built on `radix-ui`'s `Tooltip` primitive
— `primitives/packages/react/tooltip/src/tooltip.tsx` read for the
underlying behavior chassis: default delay durations, the ARIA role
mechanism — but shadcn's own file is the sole source for every *style*
cell); material-web `tokens/versions/latest/sass/_md-comp-plain-tooltip
.scss` [S] plus its `md-sys-color`/`md-sys-shape`/`md-sys-typescale`
dependencies, resolved to concrete values [S]. **material-web is a
tokens-only clone** — no live M3 tooltip component exists to read
structure/behavior from; every M3 structure/behavior row below is [R]
(APG `tooltip` pattern / m3.material.io convention), every M3 *style* row
sourced from the token file is [S], and the handful of M3 style values
with no token at all (padding, entrance motion) are marked [R] and
explicitly not fabricated as if tokenized. This mirrors Calendar's and
Spinner's M3 columns.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| root (floating panel) | 🔒 (invariant — not a switchable row; every style.root.\* row below implies it) | on — `<FloatingComponent>` wrapping `TooltipBase` [S] | on — `TooltipPrimitive.Content` via a `Portal` [S] | on [R] |
| content / supporting text | 🔒 (invariant) | on — `.saltTooltip-content` span, the `content` prop (`ReactNode`) [S] | on — `children` [S] | on — text-only per spec; richer content is exactly the rich-tooltip split (out of scope) [R] |
| arrow / pointer | ⚪ | **on** — `FloatingArrow` (`@floating-ui/react`), 12×6px triangle [S] | **on** — `TooltipPrimitive.Arrow`, a 10px rotated square (`size-2.5 rotate-45`), not a triangle [S] | **OFF** — no arrow token in `_md-comp-plain-tooltip.scss` (nor in rich-tooltip's); confirmed absent, not merely unfound [S] |
| status icon | ⚪ | **on** — conditional `StatusIndicator`, shown when a `status` is set and `hideIcon` is false [S] | OFF — no icon concept at all [S] | OFF [S] |

## 2 · Behavior

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| trigger events (open) | 🔒 | hover (`useHover` + `safePolygon()` grace-area dismiss) + focus (`useFocus`) [S] | hover + focus (Radix `Trigger`, native pointer/focus handling) [S] | hover + focus (+ long-press on touch, per APG) [R] |
| dismiss | 🔒 | `useDismiss` — Escape key, outside interaction [S] | Radix `DismissableLayer` — `onEscapeKeyDown`, `onFocusOutside` prevented (focus-triggered tooltips don't dismiss on their own content receiving focus) [S] | Escape + outside dismiss, APG convention [R] |
| ARIA role of the panel | 🔒 | `useRole(context, { role: "tooltip" })` [S] | content `role="tooltip"` (or, when an `ariaLabel` override is supplied, a visually-hidden `role="tooltip"` twin — shadcn's own file never passes that prop, so the plain path applies) [S] | `role="tooltip"`, APG convention [R] — **all three converge on the same role**, the inverse of Spinner's three-way role split |
| trigger↔panel wiring | 🔒 (info) | floating content id threaded to `aria-describedby` via `a11yProps` from form-field context when present [S] | Radix wires `aria-describedby` from trigger to content id automatically [S] | `aria-describedby`, APG convention [R] |
| supplementary live-region announce | ⚪ | **on** — `useAriaAnnounce`: on trigger `mouseenter`, reads the floating panel's `innerText` and pushes it through Salt's shared `aria-announcer` live region (respecting `enterDelay`) — a mechanism layered *on top of* the native `role="tooltip"`/`aria-describedby` wiring, not a replacement for it [S] | OFF — native ARIA wiring only [S] | OFF [R] |
| enter delay | ⬜ | **300ms**, `enterDelay` prop default [S] | **0ms** — shadcn's own `TooltipProvider` explicitly overrides Radix's package default (`delayDuration`, which is 700ms — `primitives/packages/react/tooltip/src/tooltip.tsx:30`) down to 0 [S] | [R] — no delay convention documented in the tokens-only clone |
| leave delay | ⬜ | **0ms**, `leaveDelay` prop default [S] | **0ms** — Radix has no distinct close-delay prop; it closes immediately on blur/pointerleave. `skipDelayDuration` (Radix default 300ms, not overridden by shadcn) is a **different mechanism** — a grace window that lets a pointer move between adjacent triggers without re-incurring the open delay — not a leave-delay, and not represented by this row's value [S] | [R] |
| disabled suppression | ⚪ | **on** — `disabled` prop fully suppresses (independent of hover/focus); `disableHoverListener`/`disableFocusListener` sub-toggle each trigger channel individually [S] | OFF — no equivalent prop; a consumer wanting this controls Radix's `open`/`onOpenChange` manually [S] | [R] — no documented equivalent |
| positioning engine | 🔒 (info) | **DECLARED GAP**: composes `@floating-ui/react` directly — `offset(8)`, `shift({limiter: limitShift()})`, `flip({fallbackStrategy: "initialPlacement"})`, `arrow()` middleware [S] | **DECLARED GAP**: composes Radix's own `Popper` primitive (architecturally similar — anchor + collision middleware — but a distinct implementation, not floating-ui) [S] | [R] — presumably a platform anchor-positioning API; not sourced. **None of the three is reimplemented here.** The skeleton (`skeleton/tooltip.tsx`) uses a minimal `getBoundingClientRect()` placement calculation with a fixed 8px offset and *no* flip/shift/collision detection — enough to make hover positioning real and checkable, honestly short of any of the three real engines. |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `status` | ⚪ | **on** — `info \| warning \| success \| error` (+ `undefined` = neutral default), also inherited from `useFormFieldProps` when the tooltip is attached to a form field [S] | OFF — no tone/status axis on tooltip at all [S] | OFF [S] |
| `placement` | ⬜ | **on** — full floating-ui placement enum (12 values: 4 sides × start/center/end); default `"right"`. This matrix models the 4 cardinal directions only (top/right/bottom/left), a scope trim consistent with Button's 20-combination precedent — the other 8 are real but not separately enumerated [S] | **on** — Radix `side` prop, `top \| right \| bottom \| left`; default `"top"` (a separate `align` prop exists — start/center/end along the cross-axis — not modeled, same scope trim) [S] | [R] — `"top"` only, per m3.material.io's docked convention; no placement enum in the tokens-only clone |
| `hideArrow` | ⚪ | **on** — boolean prop, default `false` [S] | **not a runtime prop** — the arrow is structurally always rendered in shadcn's `TooltipContent`; removing it is a source edit, not an instance toggle. Same class of expressibility gap as Spinner's shadcn stroke-width [S] | N/A — no arrow to hide |
| `hideIcon` | ⚪ | **on** — boolean prop, default `false`; icon also implicitly hidden when no `status` is set [S] | N/A — no icon | N/A |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| trigger (anchor) | 🔒 | consumer-owned in all three: Salt clones `children` and merges trigger props onto it; shadcn's `TooltipTrigger` wraps/`asChild`-clones its child; M3 [R] anchors to a view. Out of this component's own style/state scope — a real trigger element (e.g. a future `button`) supplies its own states. |
| content (supporting text) | 🔒 | consumer-owned in all three. Salt/shadcn accept arbitrary `ReactNode`; M3's plain-tooltip is text-only by spec — anything richer (headline, body, action buttons) is exactly what pushes a design into `rich-tooltip`, out of scope here. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| closed / open | 🔒 | on — floating-ui `open` boolean, controllable or internal [S] | on — Radix `open` state [S] | on [R] |
| panel non-interactive | 🔒 (info) | **confirmed**: `Tooltip.css` defines no `:hover`/`:focus`/`:active`/`:disabled` rule for the floating panel itself — those states belong to the *trigger* (out of this component's scope), not the tooltip bubble [S] | same — `tooltip.tsx` has no interaction-state class on `TooltipContent` [S] | same — no state-layer token exists for `plain-tooltip` in the token file (contrast rich-tooltip's `action.hover/focus/pressed` tokens, out of scope) [S] |

## 6 · Styles — the cell matrix (per part × attribute)

### root (floating panel)

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `surface` → `container-primary-background` → `palette-background-primary` → **#FFFFFF light / #101820 dark** [S] | ⟡ `surface` → `bg-foreground` → `--foreground` → **oklch(0% 0 0) light / oklch(0.985 0 0) dark** (an inverted role: the *foreground* token becomes the tooltip's *background*) [S] | ⟡ `surface` → `container-color` → `inverse-surface` → **#322f35 light / #e6e0e9 dark** (M3's own inverted role — `inverse-*` tokens are defined to flip relative to the ambient scheme) [S] — **three systems, three different mechanisms, same outcome**: a tooltip that visually inverts against its context |
| text color | 🔒 | ⟡ `on-surface` → `content-primary-foreground` → `palette-foreground-primary` → **#000000 light / #FFFFFF dark** [S] | ⟡ `on-surface` → `text-background` → `--background` → **oklch(1 0 0) light / oklch(0.145 0 0) dark** [S] | ⟡ `on-surface` → `supporting-text-color` → `inverse-on-surface` → **#f5eff7 light / #322f35 dark** [S] |
| border | ⚪ | **on** — 1px solid, color ⟡ `border` → `tooltop-status-borderColor` (default path) → `container-primary-borderColor` → `palette-alpha-contrast-medium` → **rgba(0,0,0,0.3) light / rgba(255,255,255,0.3) dark** [S] | OFF — no border utility class in source [S] | OFF — no outline/border token in `_md-comp-plain-tooltip.scss` [S] |
| border-color @ status=error (representative) | ⚪ | ⟡ `status-error` → `status-error-borderColor` → `palette-negative` → **#E52135, mode-invariant** — one representative non-default cell, same pattern as Button's `background@secondary`; `info`/`warning`/`success` follow identically via `status-{info,warning,success}` → `palette-{info,warning,positive}`, all also mode-invariant base stops [S] | OFF (no status axis) | OFF |
| shape / corner-radius | ⬜ | ⟡ `corner-weak` → `palette-corner-weak` → **rounded edition, curve-100, 2/4/6/8px by density** — same token/edition pin as Button's `style.root.shape` [S] | ⟡ `radius-control` → `rounded-md` → `calc(0.625rem × 0.8)` = **8px** [S] | **4px** (`corner-extra-small`) [S] |
| padding | ⬜ | **formula**: `calc(spacing-75 − border-width) spacing-100` → **2px 4px / 5px 8px / 8px 12px / 11px 16px** (high/medium/low/touch) [S] | **6px 12px** (`py-1.5 px-3`) [S] | **4px 8px** [R] — no padding/height token exists in `_md-comp-plain-tooltip.scss` (contrast Salt/shadcn, both fully tokenized here); value is m3.material.io's published plain-tooltip spec (24dp height around a 16px/1rem line-height ⇒ 4px vertical, 8dp horizontal), not grepped from this clone — flagged, not presented as [S] |
| font | ⬜ | ⟡ `tooltip-font` → **`400 12px/16px 'Open Sans', sans-serif` @medium** (2/4/6/8-density body ramp, same `--salt-text-*` family Button/Calendar use) [S] | **`400 0.75rem/1rem ui-sans-serif, system-ui, sans-serif`** (`text-xs`; family read as the generic Tailwind stack per Button's own precedent, since neither component sets an explicit `font-sans`/Geist utility — both inherit the ambient body font) [S] | **`400 0.75rem/1rem Roboto, sans-serif`** (`body-small`: size/line-height/weight tokenized [S]; family "Roboto" is `md.ref.typeface.plain`'s *implied* resolution — the literal string isn't in this tokens-only clone, same flag as Typography foundations' family row [R]). `tracking: 0.025rem` (letter-spacing) also exists on this role but is not modeled as a separate row — scope trim, consistent with prior components not modeling every micro-property. |
| shadow / elevation | ⚪ | **on** — ⟡ `shadow` → `overlayable-shadow-popout` → `shadow-mediumLow` → **`0 6px 10px 0 rgba(0,0,0,0.2)` light / `…rgba(0,0,0,0.55)` dark** [S] | OFF — no shadow utility on `TooltipContent` [S] | OFF — `_md-comp-plain-tooltip.scss` has no `container-elevation`/`container-shadow-color` token (contrast rich-tooltip, which has both — out of scope) [S] |
| max-width | ⚪ | **on** — `60ch`, hardcoded default (`saltTooltip-maxWidth` override point exists but ships this literal) [S] | OFF — `w-fit`, sized to content, no cap besides floating-ui/Popper collision (out of scope, see positioning-engine gap) [S] | OFF [R] — no width/wrap token; spec describes single-line-until-it-doesn't behavior, not tokenized |
| z-index | ⬜ | **1500** (`zIndex-flyover`, `foundations/zindex.css`) [S] | **50** (`z-50`, a bare Tailwind stacking index, not a px/CSS unit — undeclared as a shared token per Motion/Elevation foundations' own "shadcn has no X foundation" pattern) [S] | OFF [R] — no z-index token; platform-managed |
| entrance duration | ⬜ | **0s** — `Tooltip.css` defines no `animation`/`transition` rule at all; the panel appears/disappears on the open boolean with no transition. 0s is an honest literal (not a silent default), the mirror image of Spinner's "everyone hardcodes a duration" finding — here, one system has **no** entrance motion whatsoever [S] | **150ms** [R] — `tooltip.tsx` composes `tw-animate-css`'s `animate-in`/`animate-out`/`fade-in-0`/`zoom-in-95`/`slide-in-from-*` utility classes (confirming entrance/exit motion *exists*), but the package itself isn't vendored in this clone (`package.json` lists `"tw-animate-css": "^1.4.0"` as a dependency; no matching CSS file found under this checkout) — 150ms is the plugin's documented default utility duration, a REGISTRY RENDERING APPROXIMATION, not grepped | **100ms** [R] — no motion token in `_md-comp-plain-tooltip.scss`; derived from `docs/foundations/motion.md`'s general M3 duration scale (`short2`: 100ms) rather than fabricated outright — a principled placeholder, still flagged [R] |
| entrance easing | ⬜ | **linear** — inert given 0s duration; included only for schema completeness [S] | **ease-out** [R] — same unvendored-package caveat as duration above | **`cubic-bezier(0.2,0,0,1)`** [R] — `docs/foundations/motion.md`'s M3 "standard" easing curve, same cross-reference logic as duration |

### arrow

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| size | ⚪ | **⟡ `size-icon` → 10/12/14/16px by density** — a DELIBERATE DEVIATION from `TooltipBase.tsx`'s literal `width={12} height={6}`; see "Arrow size and density" below [S/deviation] | **10×10px** (`size-2.5`, rotated 45° into a diamond), density-invariant — shadcn has no density capability at all [S] | OFF |
| color | ⚪ | fill ⟡ `surface` (same as panel background), stroke ⟡ `status-active` (the same indirection the panel border reads, so a status recolours both), `strokeWidth=1` [S] | ⟡ `surface` (`bg-foreground fill-foreground` — same token as the panel background) [S] | OFF |
| shape (`structure.arrow-shape`) | ⚪ | **triangle** — a real SVG path, filled with the panel colour and stroked on its two OUTER edges only, base left open [S] | **diamond** — a borderless rotated square whose inner half the panel covers [S] | OFF |

**The two shapes are separate mechanisms, not one shape with a delta.**
Salt's `FloatingArrow` is a genuine triangle whose *open base* merges into
the panel's border; shadcn's is a square rotated 45° that reads as a pointer
only because it has **no border** and the panel hides its inner half. The
skeleton renders each accordingly — an `<svg>` with a fill path plus a
two-edge stroke path for `triangle`, a `<span>` for `diamond`.

**Corrected during validation (owner-reported).** The first build drew one
rotated square for *both* systems, described at the time as a declared
approximation. It was not merely approximate — it was **wrong for Salt**:
with a 1px border applied to a rotated rectangle, all four edges of a
rhombus were outlined instead of the two edges of a triangle, so the arrow
rendered as a floating diamond outline rather than a pointer. This is the
fidelity-oracle rule working as intended: the render, not the matrix, is
the judge. Two follow-on corrections came out of the same pass — the arrow's
stroke now reads the status indirection (Salt's `FloatingArrow` is passed
`stroke="var(--tooltip-status-borderColor)"`, so a warning tooltip's arrow
must go orange too, which it previously did not), and the seam offset was
reduced from 2px to 1px once measurement showed `top: 100%` already resolves
to the padding box, *inside* the 1px border.

### Arrow size and density — a declared deviation, and why it is source-backed

**Salt contradicts itself here, and the matrix follows the consistent half.**
`TooltipBase.tsx:56-57` hardcodes `height={6} width={12}` as JS literals, so
Salt's main tooltip arrow is density-**invariant** — verified exhaustively:
`arrowProps` (`useTooltip.ts:111-114`) carries only `ref` and `context`, no
dimensions; the explicit props are spread *after* it so nothing can override
them; and there is **no `.saltTooltip-arrow` CSS rule anywhere in the repo**.
Everything else on the tooltip (padding, font, icon margin, corner) does scale.

But Salt's *own sibling component* sizes the very same arrow off a density
token — `SliderTooltip.css:24-36`:
`.saltSliderTooltip-arrow { width: var(--salt-size-icon); height: var(--salt-size-icon) }`.
`--salt-size-icon` is **10/12/14/16px** by density (`foundations/sizes.md`),
which means **the main tooltip's hardcoded 12 is exactly `size-icon`'s medium
value baked in**. Read together, the literal looks like a frozen snapshot of
the token, not a considered decision to opt out of density.

So the arrow is aliased to `size-icon`. This **reproduces Salt's own literal
exactly at medium density** and follows Salt's own density-aware arrow pattern
at the other three. Owner-directed (fidelity oracle, CLAUDE.md rule 5) and
recorded here as a deviation rather than presented as a plain extraction —
the literal in `TooltipBase.tsx` is what source says, and a future
provenance canary diffing against it will flag this row. That is the intended
behaviour, not a drift to silence.

| density | arrow box | triangle depth | visible depth |
|---|---|---|---|
| high | 10px | 5px | 4px |
| medium | 12px | 6px | 5px (Salt's literal geometry) |
| low | 14px | 7px | 6px |
| touch | 16px | 8px | 7px |

**One residual, declared:** at medium density the visible triangle depth is
**5px against Salt's 6px**. The arrow overlaps the panel border by exactly 1px so its fill
covers that border segment and the base disappears into the panel — the same
seam-hiding overlap `FloatingArrow` performs. Recovering the last pixel would
mean either leaving a hairline of panel border across the arrow's base or
special-casing the geometry against the border width. Measured identically
across all four placements (1px overlap, 5px visible, 0px cross-axis drift).

### status icon (Salt only)

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| margin (icon → text gap) | ⚪ | **formula**: `marginTop = (text-lineHeight − max(icon-size, 12px)) / 2`, `marginRight = spacing-75` → **`1px 3px 0 0` / `2px 6px 0 0` / `2px 9px 0 0` / `2px 12px 0 0`** (high/medium/low/touch) [S] | OFF | OFF |

**Declared composition**: the icon's own internal color/shape (which glyph renders for each `status`, its own fill token) belongs to Salt's `StatusIndicator` — a not-yet-built registry component. Only the icon's *placement* (this margin) is modeled here, the same "declared composition, not duplication" pattern Calendar used for its nav buttons composing the future `button` component.

---

## Findings from building this matrix

1. **Tooltip's ARIA role converges instead of diverging** — all three
   systems answer "what role is the floating panel?" with `role="tooltip"`
   (Salt `useRole`, shadcn's Radix content, M3's APG convention). This is
   the mirror image of Spinner's headline finding (three different roles
   for the same concept) — worth recording precisely because it shows the
   three-way-divergence pattern isn't universal; sometimes the systems
   genuinely agree.
2. **All three background/text colors are "inverted against context,"
   independently arrived at.** Salt's answer is a flat palette pick
   (`background-primary`/`foreground-primary`, which happen to be
   contrast-appropriate); shadcn's is an explicit swap (`bg-foreground` +
   `text-background`, literally trading the two ambient roles); M3's is a
   dedicated token pair (`inverse-surface`/`inverse-on-surface`) built to
   flip relative to light/dark mode. Same visual outcome, three different
   *mechanisms* — the kind of structural-not-just-numeric divergence
   Calendar's "today marker" finding first surfaced.
3. **Only one of three systems has no entrance/exit animation at all.**
   Salt's `Tooltip.css` defines zero `animation`/`transition` rules —
   instant show/hide. shadcn ships a full fade+zoom+slide entrance via an
   external, unvendored package (`tw-animate-css` — confirmed as a
   dependency, but its actual CSS isn't checked into this clone, so its
   duration/easing are REGISTRY RENDERING APPROXIMATIONS, not grepped
   values). M3's tokens-only clone has no motion token for `plain-tooltip`
   at all; this matrix borrows a value from the general Motion foundations
   page rather than inventing one, flagged [R] regardless.
4. **The arrow is a genuine structural three-way split, this time 2-vs-1
   rather than the usual 1-vs-1-vs-1**: Salt and shadcn both draw an
   arrow (a real triangle vs. a rotated-square diamond — different SHAPES,
   not just different sizes), while M3's plain-tooltip has no arrow
   concept whatsoever, confirmed by the *absence* of any arrow token in
   its file (not merely "not found yet"). **This one nearly escaped as a
   "declared approximation."** Collapsing both to a single rotated square
   looked defensible on paper — the matrix even said so in writing — and
   it survived the generator, which reported `OK`. It did not survive the
   owner looking at the render. The lesson generalises past this row: a
   *shape* difference is structure, and CLAUDE.md's no-inherited-chassis
   rule applies to geometry exactly as it applies to parts. Two mechanisms
   that merely produce a similar silhouette in one system's palette are
   not one mechanism, and labelling the gap "declared" does not make the
   output correct — it only makes the error documented.
7. **A design system can contradict itself, and "grep the source" does not
   always return one answer.** Salt sizes the *same* arrow two different
   ways in two components: hardcoded `12×6` in `TooltipBase.tsx`,
   density-tokenised `var(--salt-size-icon)` in `SliderTooltip.css`. The
   pipeline's rule 4 ("values come from source or they don't come")
   silently assumes source is self-consistent; here, obeying it literally
   would have meant an arrow that stays 12px while the panel it points at
   grows from 20px to 44px — faithful to one file, wrong against the
   system's own evident intent, and wrong to a Salt-trained eye. What
   resolved it was not taste overriding source but **a second source
   reading**: `size-icon`'s medium value *is* 12, so the literal is a
   frozen token, and the two files stop disagreeing once you see that. The
   generalisable procedure when a value looks wrong on screen: before
   deviating, look for a sibling component in the same system that
   tokenises what this one hardcoded — the answer is often still in
   source, one file over.
5. **shadcn's `enterDelay`/`leaveDelay` mapping needed an honest
   mismatch note.** shadcn's `TooltipProvider` deliberately zeroes Radix's
   own 700ms default `delayDuration` — a real, sourced 0ms open-delay. But
   there is no shadcn/Radix *close*-delay at all; the nearest-sounding
   token, `skipDelayDuration` (300ms, Radix's own default, not overridden
   by shadcn), is a different mechanism (a grace window between adjacent
   triggers), not a leave-delay. Recording the real value (0ms, immediate
   close) while explaining why the tempting-looking `skipDelayDuration`
   number does NOT belong in this row avoids manufacturing a false
   cross-system parallel — the same discipline as Spinner's "two systems
   hardcode duration outside their own token systems" finding, applied to
   avoid a *wrong* citation rather than a missing one.
6. **M3's plain-tooltip token file is the sparsest style set matrixed so
   far** — nine entries total: eight `$` variables (`container-color`,
   `container-shape`, `supporting-text-color`, and five `supporting-text-*`
   typography tokens — font/size/weight/line-height/tracking) plus one
   composite `@mixin supporting-text-type`.
   No padding, no height, no z-index, no motion — a real difference in
   *how much* M3 tokenizes this particular component, not just which
   values it picks. Contrast Salt's fully-formula-derived padding and
   shadcn's fully-literal one; M3's padding here is the only [R] value in
   an otherwise-[S] style section, an honest gap rather than a smoothed-
   over one.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/tooltip.template.json` against every system, read from `columns/tooltip.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 9 light, 4 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | #FFFFFF | #101820 | yes |
| `on-surface` | #000000 | #FFFFFF | yes |
| `border` | rgba(0, 0, 0, 0.3) | rgba(255, 255, 255, 0.3) | yes |
| `shadow` | 0 6px 10px 0 rgba(0,0,0,0.2) | 0 6px 10px 0 rgba(0,0,0,0.55) | yes |
| `status-info` | #0078CF | — | **no** |
| `status-warning` | #C75300 | — | **no** |
| `status-success` | #00875D | — | **no** |
| `status-error` | #E52135 | — | **no** |
| `status-active` | var(--border) | — | **no** |

**shadcn** — 3 light, 2 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `on-surface` | oklch(1 0 0) | oklch(0.145 0 0) | yes |
| `radius-control` | calc(0.625rem * 0.8) | — | yes |

**m3** — 2 light, 2 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | #322f35 | #e6e0e9 | yes |
| `on-surface` | #f5eff7 | #322f35 | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.arrow` | structure | switchable | `True` | `True` | **off** |
| 2 | `structure.arrow-shape` | structure | switchable | `triangle` | `diamond` | **off** |
| 3 | `structure.status-icon` | structure | switchable | `True` | **off** | **off** |
| 4 | `behavior.trigger-events` | behavior | locked | — | — | — |
| 5 | `behavior.dismiss` | behavior | locked | — | — | — |
| 6 | `behavior.role` | behavior | locked | `tooltip` | `tooltip` | `tooltip` |
| 7 | `behavior.aria-describedby` | behavior | locked | — | — | — |
| 8 | `behavior.supplementary-announce` | behavior | switchable | `True` | **off** | **off** |
| 9 | `behavior.enter-delay` | behavior | default | `300` | `0` | `0` |
| 10 | `behavior.leave-delay` | behavior | default | `0` | `0` | `0` |
| 11 | `behavior.disabled-suppression` | behavior | switchable | — | — | — |
| 12 | `behavior.positioning-engine` | behavior | locked | — | — | — |
| 13 | `prop.status` | prop | switchable | `info, warning, success, error` | **off** | **off** |
| 14 | `prop.placement` | prop | default | `right, top, bottom, left` | `top, right, bottom, left` | `top` |
| 15 | `prop.hide-arrow` | prop | switchable | — | — | — |
| 16 | `prop.hide-icon` | prop | switchable | — | — | — |
| 17 | `slot.trigger` | slot | locked | — | — | — |
| 18 | `slot.content` | slot | locked | — | — | — |
| 19 | `state.closed-open` | state | locked | — | — | — |
| 20 | `state.panel-non-interactive` | state | locked | — | — | — |
| 21 | `style.root.background` | style | locked | ⟡ `surface` | ⟡ `surface` | ⟡ `surface` |
| 22 | `style.root.color` | style | locked | ⟡ `on-surface` | ⟡ `on-surface` | ⟡ `on-surface` |
| 23 | `style.root.border` | style | switchable | `border-width: 1px; border-style: solid; border-color: var(--status-active)` | **off** | **off** |
| 24 | `style.root.status@error` | style | switchable | `--status-active: var(--status-error)` | **off** | **off** |
| 25 | `style.root.status@info` | style | switchable | `--status-active: var(--status-info)` | **off** | **off** |
| 26 | `style.root.status@warning` | style | switchable | `--status-active: var(--status-warning)` | **off** | **off** |
| 27 | `style.root.status@success` | style | switchable | `--status-active: var(--status-success)` | **off** | **off** |
| 28 | `style.root.shape` | style | default | ⟡ `corner-weak` | ⟡ `radius-control` | `4px` |
| 29 | `style.root.padding` | style | default | ⟡ `tooltip-padding` | `6px 12px` | `4px 8px` |
| 30 | `style.root.font` | style | default | ⟡ `tooltip-font` | `400 0.75rem/1rem ui-sans-serif, system-ui, sans-serif` | `400 0.75rem/1rem Roboto, sans-serif` |
| 31 | `style.root.shadow` | style | switchable | ⟡ `shadow` | **off** | **off** |
| 32 | `style.root.max-width` | style | switchable | `60ch` | **off** | **off** |
| 33 | `style.root.z-index` | style | default | `1500` | `50` | **off** |
| 34 | `style.root.duration` | style | default | `0s` | `150ms` | `100ms` |
| 35 | `style.root.easing` | style | default | `linear` | `ease-out` | `cubic-bezier(0.2,0,0,1)` |
| 36 | `style.arrow.size` | style | switchable | `width: var(--arrow-size)` | `width: 10px; height: 10px` | **off** |
| 37 | `style.arrow.color` | style | switchable | `fill: var(--surface); stroke: var(--status-active); stroke-width: 1px` | `background: var(--surface); border: none` | **off** |
| 38 | `style.icon.margin` | style | switchable | ⟡ `tooltip-icon-margin` | **off** | **off** |

<details><summary>Citations — 64 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.arrow` | salt | TooltipBase.tsx: !hideArrow renders FloatingArrow by default |
| `structure.arrow` | shadcn | tooltip.tsx: TooltipContent always composes TooltipPrimitive.Arrow |
| `structure.arrow` | m3 | confirmed absent from _md-comp-plain-tooltip.scss (and rich-tooltip's, for reference) — no arrow concept in M3's tooltip spec |
| `structure.arrow-shape` | salt | TooltipBase.tsx:50-58 FloatingArrow width={12} height={6} strokeWidth={1} |
| `structure.arrow-shape` | shadcn | tooltip.tsx TooltipPrimitive.Arrow className="size-2.5 rotate-45 bg-foreground fill-foreground" - a rotated square, no border |
| `structure.arrow-shape` | m3 | no arrow at all in _md-comp-plain-tooltip.scss |
| `structure.status-icon` | salt | TooltipBase.tsx: !hideIcon && status renders StatusIndicator |
| `structure.status-icon` | shadcn | no icon concept on shadcn's tooltip |
| `structure.status-icon` | m3 | no icon concept |
| `behavior.role` | salt | useTooltip.ts: useRole(context, { role: "tooltip" }) |
| `behavior.role` | shadcn | Radix TooltipContent: role="tooltip" (the ariaLabel-override VisuallyHidden path is unused — shadcn's own file never passes that prop) |
| `behavior.role` | m3 | [R] — APG tooltip convention; material-web is tokens-only, no live component to grep |
| `behavior.supplementary-announce` | salt | useAriaAnnounce.ts |
| `behavior.supplementary-announce` | shadcn | native ARIA wiring only, no supplementary live-region mechanism |
| `behavior.supplementary-announce` | m3 | [R] — no documented equivalent |
| `behavior.enter-delay` | salt | Tooltip.tsx: enterDelay = 300 |
| `behavior.enter-delay` | shadcn | tooltip.tsx TooltipProvider: delayDuration = 0 (explicitly overriding Radix's own 700ms package default) |
| `behavior.enter-delay` | m3 | [R] DECLARED ABSENCE — no delay convention in the tokens-only clone; registry default (0ms, matching shadcn's own zeroed default) applied, not fabricated as an M3-specific number |
| `behavior.leave-delay` | salt | Tooltip.tsx: leaveDelay = 0 |
| `behavior.leave-delay` | shadcn | Radix closes immediately on blur/pointerleave, no distinct close-delay prop. skipDelayDuration (300ms, Radix default, not overridden) is a different mechanism (cross-trigger grace window) and is NOT represented by this value. |
| `behavior.leave-delay` | m3 | [R] DECLARED ABSENCE, same as enter-delay |
| `prop.status` | salt | TooltipProps.status: FormFieldValidationStatus \| ValidationStatus |
| `prop.status` | shadcn | no tone/status axis on shadcn's tooltip |
| `prop.status` | m3 | no tone/status axis on either M3 tooltip family |
| `prop.placement` | salt | Tooltip.tsx: placement = "right" |
| `prop.placement` | shadcn | primitives/packages/react/tooltip/src/tooltip.tsx: TooltipContent side default 'top' (overriding Popper.Content's own 'bottom' default) |
| `prop.placement` | m3 | [R] — m3.material.io's docked convention; no placement enum exists in this tokens-only clone |
| `style.root.border` | salt | Tooltip.css border-width/style/color; border-color resolves through --tooltip-status-borderColor, modelled here as the status-active indirection slot |
| `style.root.border` | shadcn | no border utility class on TooltipContent |
| `style.root.border` | m3 | no outline/border token in _md-comp-plain-tooltip.scss |
| `style.root.status@error` | salt | Tooltip.css .saltTooltip-error { --tooltip-status-borderColor: var(--salt-status-error-borderColor) } |
| `style.root.status@error` | shadcn | no status axis |
| `style.root.status@error` | m3 | no status axis |
| `style.root.status@info` | salt | Tooltip.css .saltTooltip-info { --tooltip-status-borderColor: var(--salt-status-info-borderColor) } |
| `style.root.status@info` | shadcn | no tone/status axis on tooltip in this system (see prop.status) |
| `style.root.status@info` | m3 | no tone/status axis on tooltip in this system (see prop.status) |
| `style.root.status@warning` | salt | Tooltip.css .saltTooltip-warning { --tooltip-status-borderColor: var(--salt-status-warning-borderColor) } |
| `style.root.status@warning` | shadcn | no tone/status axis on tooltip in this system (see prop.status) |
| `style.root.status@warning` | m3 | no tone/status axis on tooltip in this system (see prop.status) |
| `style.root.status@success` | salt | Tooltip.css .saltTooltip-success { --tooltip-status-borderColor: var(--salt-status-success-borderColor) } |
| `style.root.status@success` | shadcn | no tone/status axis on tooltip in this system (see prop.status) |
| `style.root.status@success` | m3 | no tone/status axis on tooltip in this system (see prop.status) |
| `style.root.padding` | shadcn | tooltip.tsx: py-1.5 px-3 |
| `style.root.padding` | m3 | [R] — not tokenized in this clone; m3.material.io spec convention, see provenance |
| `style.root.font` | shadcn | tooltip.tsx: text-xs; family inherited (no explicit font-sans utility), cited as the generic Tailwind stack per Button's own precedent |
| `style.root.font` | m3 | size/line-height/weight [S] from body-small; family "Roboto" is [R] (role-only in this clone, see provenance) |
| `style.root.shadow` | shadcn | no shadow utility on TooltipContent |
| `style.root.shadow` | m3 | no container-elevation/container-shadow-color token on plain-tooltip (contrast rich-tooltip, which has both — out of scope) |
| `style.root.max-width` | shadcn | w-fit — content-sized, no explicit cap besides Popper collision (out of scope, see positioning-engine gap) |
| `style.root.max-width` | m3 | no width/wrap token |
| `style.root.z-index` | shadcn | tooltip.tsx: z-50 |
| `style.root.z-index` | m3 | no z-index token; platform-managed |
| `style.root.duration` | salt | no animation exists in source; 0s is an honest literal representing the real instant show/hide, not an inherited default |
| `style.root.duration` | shadcn | REGISTRY RENDERING APPROXIMATION — tw-animate-css isn't vendored in this clone; 150ms is the plugin's commonly documented default utility duration, not a grepped value |
| `style.root.duration` | m3 | [R] — no motion token on this component; borrowed from docs/foundations/motion.md's short2 tier (100ms) rather than fabricated |
| `style.root.easing` | salt | inert given 0s duration; present only for schema completeness |
| `style.root.easing` | shadcn | same unvendored-package caveat as duration |
| `style.root.easing` | m3 | [R] — docs/foundations/motion.md's M3 'standard' easing curve, same cross-reference logic as duration |
| `style.arrow.size` | salt | DELIBERATE, SOURCE-BACKED DEVIATION from Tooltip's literal. Salt is internally inconsistent about this: TooltipBase.tsx hardcodes width={12} height={6} (density-invariant), but Salt's OWN sibling SliderTooltip.css sizes the same arrow off a density token (.saltSliderTooltip-arrow { width: var(--salt-size-icon); height: var(--salt-size-icon) }). --salt-size-icon is 10/12/14/16 by density (foundatio |
| `style.arrow.size` | shadcn | tooltip.tsx: size-2.5 (0.625rem = 10px), rotate-45 — the skeleton's neutral rotated-square arrow matches this shape closely (unlike Salt's true triangle) |
| `style.arrow.color` | salt | FloatingArrow fill="var(--salt-container-primary-background)" stroke="var(--tooltip-status-borderColor)" strokeWidth={1} |
| `style.arrow.color` | shadcn | tooltip.tsx: bg-foreground fill-foreground — same token as the panel background, no separate stroke |
| `style.icon.margin` | shadcn | no icon |
| `style.icon.margin` | m3 | no icon |

</details>

<!-- END GENERATED VALUES -->
