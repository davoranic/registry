# Toast / Sonner / Snackbar — component template matrix

*Eighteenth component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs, card, badge, progress,
chip, checkbox, switch, radio-group, slider came before). Same method as
[CALENDAR-MATRIX.md](CALENDAR-MATRIX.md): one master template (union of all
six pieces across systems), columns per design system, rows switched
on/off/inherited per column. First "Feedback & status" component since
alert/progress/spinner/tooltip — read as ALERT-MATRIX.md's closest sibling,
since a toast is essentially a dismissible, transient banner. Also the
pipeline's FIRST genuinely time-based component (auto-dismiss timers) and
first with real multi-instance STACKING — neither transfers cleanly from the
checkbox/switch/radio-group/slider family this session was warned not to
assume from.*

**Canonical name.** `1-intro/content/04-component-map.md`'s Feedback & status
table reads: `| sonner / toast | ✓ sonner | ✓ toast, toast-group | ✓ snackbar |`.
shadcn calls it "sonner" (after the underlying npm library); Salt splits it
into "toast" (the individual surface) + "toast-group" (the stacking manager,
a `packages/lab` component); M3 calls the whole thing "snackbar". This
document and the generated artifacts use "toast" as the canonical id, the
row's own leading name and the same convention alert's own doc used
against Salt/M3's "banner."

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `x-ds:` = system's native token, no shared slot yet ·
`OFF` = row switched off in this column · `[S]` = value extracted from
source this session · `[S-supplementary]` = extracted from a real, committed
sibling source in the SAME monorepo that is NOT the canonical file (see
§0) · `[R]` = inferred/external, not independently confirmable this session
— see the specific note on why.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

Sources: salt-ds clone `packages/core/src/toast/{Toast.tsx,Toast.css,
ToastContent.tsx,ToastContent.css}` [S] + `packages/lab/src/toast-group/
{ToastGroup.tsx,ToastGroup.css}` [S], `packages/core/stories/toast/
toast.stories.tsx` [S], `packages/lab/stories/toast-group/
toast-group.stories.tsx` [S], `site/docs/components/toast/{usage,
accessibility,index}.mdx` [S]; `ui/apps/v4/registry/new-york-v4/ui/
sonner.tsx` [S] (canonical, a thin wrapper — see §0), plus
`registry/new-york-v4/examples/sonner-{demo,types}.tsx` [S] and
`examples/radix/sonner-position.tsx` [S]; SUPPLEMENTARY,
cross-checked-not-canonical evidence from `registry/bases/base/ui/
{toast,sonner}.tsx` [S-supplementary] (a real, fully-inspectable sibling
Toast built on `@base-ui/react/toast`, in the same monorepo, used the exact
way alert.template.json used `registry/bases/radix/ui/alert.tsx`);
material-web `tokens/versions/v0_192/_md-comp-snackbar.scss` [S]
(tokens-only clone — no live M3 component) plus `_md-sys-color.scss`/
`_md-ref-palette.scss`/`_md-sys-shape.scss`/`_md-sys-elevation.scss`/
`_md-sys-typescale.scss` [S] for resolution.
`1-intro/content/foundations/{elevation,layers,spacing,sizes}.md` [S]
reused/cross-checked for shared foundation values (spacing-unit density
scale, the M3 dp→CSS shadow derivation table, `flyover` z-index) rather
than re-deriving them.

---

## 0 · Scope decisions

**The stacking/positioning manager IS in scope, as a structural PART of this
one chassis (`structure.group`), not a second top-level component.** Same
one-chassis-many-parts precedent dialog set for overlay+panel and select set
for trigger+popup. Salt's own architecture is the strongest evidence this is
the right call: `packages/lab/src/toast-group/ToastGroup.tsx` is a real,
separate, exported component — but it is PURELY a presentational flex-column
positioning wrapper (`position: fixed`, `placement` prop, density-driven
`width`), and `toast-group.stories.tsx` shows the consumer owning an array of
live toast entries with ordinary `useState`, no imperative API anywhere in
Salt's own source. `Toast`/`ToastGroup` are exported as two parts of ONE
skeleton file (`skeleton/toast.tsx`), matching that real shape.

**Imperative triggering (`toast()`, a global singleton manager) is
explicitly OUT of the reproduced surface** — a declared, SOURCED chassis
simplification, not an invented shortcut. `Toast` items each own their own
real, internal auto-dismiss timer (the closest correct DOM-observable
analogue to what the external sonner/Base UI managers do); `ToastGroup` stays
presentation-only and a consumer (the harness, standing in for a future
imperative wrapper) manages the live array — exactly Salt's own pattern.

**shadcn's canonical `sonner.tsx` is a thin wrapper around an external,
UNVENDORED npm package.** `package.json:95` lists `"sonner": "^2.0.0"` as a
dependency; `find 3-source/ui -path "*/node_modules/sonner*"` returns
nothing anywhere under the clone. The actual toast-surface DOM contract,
stacking math, swipe gesture and timer internals therefore live in an
external package this session cannot inspect — a real, structural [R]
boundary, the same class Radix was for behaviour-only reference elsewhere in
this pipeline. What IS real, sourced [S] evidence directly in the canonical
wrapper file itself: its theming CSS custom properties (`--normal-bg/-text/
-border`, `--border-radius`), its per-type `icons` prop (a literal element
per type, `className="size-4"`), and the public `toast()`/`Toaster` call
shapes visible in the canonical example files (`sonner-demo.tsx`,
`sonner-types.tsx`, `sonner-position.tsx`). As SUPPLEMENTARY, cross-checked
(NOT canonical) evidence, this SAME monorepo ships a second, real,
fully-inspectable 'base' style Toast (`registry/bases/base/ui/toast.tsx`,
built on `@base-ui/react/toast` — also external at the gesture/timer level,
but the WRAPPER's own CSS classes and data-attributes ARE real committed
source: `data-slot`, `data-expanded`, `data-limited`, `data-starting-style`,
`data-ending-style`, `data-swipe-direction`, the `--toast-index`/
`--toast-offset-y` stacking custom properties). Every style/structure row
below marks which bucket ([S] canonical / [S-supplementary] / [R]) each
shadcn cell falls into.

**M3 snackbar is CONFIRMED tokens-only, like every M3 column in this
pipeline — but its token file is unusually thin.** `find 3-source/
material-web -maxdepth 1 -iname "*snackbar*"` returns nothing; only
`tokens/{v0_192,versions/v0_192,versions/latest}/sass/_md-comp-snackbar.scss`
exist, and (unlike checkbox/switch/radio-group/slider's own real Lit
component source) there is no live M3 snackbar component anywhere in this
clone, in any edition. Every M3 structure/behaviour row is `[R]`; every M3
style row is `[S]` from the token file.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| group (stacking/positioning container) | 🔒 | on — `ToastGroup` [S] | on — canonical `<Toaster>`'s own external viewport [R]; SUPPLEMENTARY `ToastViewport` [S-supplementary] | on — `[R]`, one implied default corner, no positioning token |
| item (single toast surface) | 🔒 | on — `Toast` [S] | on — canonical, external DOM [R]; SUPPLEMENTARY `Toast` (base) [S-supplementary] | on — `_md-comp-snackbar.scss`'s own `container-*` family [S] |
| icon (leading status/type glyph) | ⚪ | **on** — `StatusIndicator`, only when `status` is set [S] | **on** — canonical `Toaster`'s own `icons` prop, real per-type elements [S] | **OFF** — no leading-icon concept; the only icon token family carries hover/focus/pressed states, confirming it is the CLOSE button (see below), not a leading glyph [S] |
| message (primary text) | 🔒 | on — `ToastContent`'s children [S] | on — `toast(message, ...)`'s first argument [S] | on — `supporting-text-*` [S] |
| description (secondary text, distinct from message) | ⚪ | **OFF** — no title/description split; a two-line look is a content-formatting convention only, same shape as Alert's bold-first-line finding [S] | **on** — `toast(message, { description })`, real, sourced call shape [S] | **OFF** — exactly ONE text-run token family exists, grepped directly — no second text role [S] |
| action (dedicated action button) | ⚪ | **OFF as a dedicated part** — no `ToastActions` wrapper exists; action buttons in `toast.stories.tsx` are free children in a `FlowLayout`, no distinct data-slot [S] | **on** — `action: { label, onClick }`, real, sourced call shape [S] | **on** — `action-label-text-*` family with focus/hover/pressed states, the richest single part in the file [S] |
| close (dedicated dismiss button) | ⚪ | **OFF** — an ordinary composed `<Button appearance="transparent" aria-label="Dismiss">`, no distinct part, same convention as Banner [S] | **on** — canonical is silent [R]; SUPPLEMENTARY `ToastClose` (`data-slot="toast-close"`, `aria-label="Close toast"`) confirms the pattern [S-supplementary] | **on** — the `icon-*` token family IS this part (see above) [S] |

## 2 · Behavior

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| ARIA role | ⚪ | **`role="alert"`, HARDCODED**, always [S] — a real CONTRAST with Banner's own Salt column, which has NO default role at all | `role="status"` [R] — external, not visible in the wrapper; general APG convention | `role="status"` [R] — no live component, same APG convention |
| auto-dismiss | ⬜ | **CONFIRMED OFF** — no timer anywhere in `Toast.tsx`/`ToastContent.tsx`/`ToastGroup.tsx` (grepped); `usage.mdx`: "Users should always be able to close or dismiss a toast" — persistent by design [S] | **on** [R] — well-documented external convention, exact default duration not confirmable in this clone | **on** [R] — Material snackbar spec convention, no timing token in `_md-comp-snackbar.scss` (grepped, confirmed absent) |
| pause-on-interaction | ⬜ | off (no timer to pause) | **on** [R] — public sonner convention | **on** [R] — Material spec convention |
| dismiss (removal ownership) | 🔒 | consumer-owned `useState`, `toast-group.stories.tsx`'s own `closeToast` pattern [S] | library-owned internally [R], same OBSERVABLE contract | library-owned internally [R], same OBSERVABLE contract |
| swipe-dismiss | ⚪ | off, no gesture code anywhere [S] | SUPPLEMENTARY-only: `data-swipe-direction` etc. [S-supplementary]; canonical [R] | [R], general convention, no token evidence |
| stacking order | 🔒 | **on**, real, sourced newest-nearest-anchor timestamp sort [S] | SUPPLEMENTARY `--toast-index` peek/scale stack [S-supplementary]; canonical [R] | **[R] — typically ONE snackbar visible at a time, queued, not stacked simultaneously** — a genuinely different posture from Salt/shadcn |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `type` / `status` (semantic axis) | ⬜ | **4-value enum**: info/error/warning/success, no forced default [S] | **6-value enum**: default/success/info/warning/error/loading [S] | **OFF — no type/status axis at all.** Grepped directly: exactly ONE `container-color`, no colour axis of any kind — the SAME marquee finding ALERT-MATRIX.md recorded for M3's banner, recurring here |
| `position` | ⚪ | **2-value enum**: top-right/bottom-right, default bottom-right [S] | **6-value enum**: every corner + both centers [S] — a real capability gap vs Salt, not fabricated | **OFF** — no positioning token; layout is not a token-file concern here |
| `duration` (ms, numeric) | ⬜ | N/A — auto-dismiss is off | [R] boundary, registry default (5000ms) applied, LABELLED | [R] boundary, registry default (5000ms) applied, LABELLED |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| icon | ⚪ | consumer-owned glyph; Salt fixes it to status via `StatusIndicator`, shadcn's `icons` prop is per-type but consumer-suppliable, M3 has none |
| message | 🔒 | consumer-owned primary text; all three accept it |
| description | ⚪ | consumer-owned secondary text, shadcn only (see structure.description) |
| action | ⚪ | consumer-owned action button/label, where the system has the part |
| close | ⚪ | consumer-owned close affordance, composed everywhere except M3 (first-class) |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest (the item's own ambient state) | 🔒 | on | on | on |
| swipe-drag | ⚪ | off, no gesture code [S] | SUPPLEMENTARY-only evidence [S-supplementary], canonical [R] | [R], general convention |

## 6 · Styles — the cell matrix (per part × attribute)

All cells below are shown at each system's DEFAULT type (Salt: no status set;
shadcn: default; M3: only value there is) — the same "one representative
value, declared deferral" pattern Alert's own tone grid used. Three extra
rows (`style.item.type@error/@warning/@success`) demonstrate the non-default
type axis, mirroring `alert.template.json`'s own `style.root.tone@*` rows
exactly — Salt's `Toast.css` reassigns the SAME `--toast-borderColor`/
`--toast-iconColor` indirection mechanism Banner's own tone rows use.

### item (the single toast surface)

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `item-bg` → container-primary-background → snow/jet, does NOT vary by type [S] | ⟡ `item-bg` → `--normal-bg` → `--popover` [S, canonical] | ⟡ `item-bg` → `inverse-surface` → #e6e0e9/#322f35 [S] — a genuinely HIGH-CONTRAST inverted pairing, unique among M3 columns so far |
| border-color | ⚪ | **on**, status-driven indirection [S] | **on**, FIXED `--normal-border`→`--border`, non-variant [S, canonical] | **OFF** — no border/outline token anywhere, colour-fill only [S] |
| border-width | ⚪ | 1px, density-invariant [S] | 1px, Tailwind default [S-supplementary] | explicitly `0` [S] |
| shape | ⬜ | `palette-corner`, by density [S] | ⟡ `--border-radius`→`--radius`=10px [S, canonical] | `corner-extra-small`=4px [S] — the SMALLEST any M3 column has used |
| elevation | ⬜ | `overlayable-shadow-popout` (`shadow-mediumLow`) [S] | `shadow-lg` [S-supplementary] | `level3`=6dp → canonical derivation `0 1px 3px 0 rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15)` [S] — the HIGHEST any M3 column has used |
| padding | ⬜ | `spacing-100`, uniform, by density [S] | 16px [S-supplementary] | **OFF** — no padding token of any kind [S] |
| gap | ⬜ | `spacing-75`, by density [S] | 12px [S-supplementary] | **OFF** — no gap token [S] |
| margin | ⚪ | **on** — inter-toast spacing owned by the ITEM's own margin [S] | **OFF** — owned by the group instead | **OFF** — no token, no live component |
| min-height | ⚪ | `calc(size-base + spacing-100)`, by density [S] | **OFF** — content-driven, real gap [S] | `with-single-line-container-height`=48px [S] |
| width | ⚪ | **OFF** — the fixed width lives on the GROUP, not the item [S] | **OFF** — same, on the viewport [S-supplementary] | **OFF** — no token |
| font | ⬜ | `--salt-text-*` body role, by density [S] | `text-sm` [S-supplementary] | `body-medium`=400 0.875rem/1.25rem Roboto [S] |
| color | 🔒 | ⟡ `item-fg` → content-primary-foreground, does NOT vary by type [S] | ⟡ `item-fg` → `--normal-text`→`--popover-foreground` [S, canonical] | ⟡ `item-fg` → `inverse-on-surface` [S] |

### icon

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| color | ⚪ | status-driven indirection, independent of body text [S] | [R] — inherits `currentColor` by convention | **N/A — M3 has no leading icon** |
| size | ⚪ | `max(size-icon, 12px)`, clamped to 12/12/14/16 by density [S] | 16px (`size-4`), real, sourced directly in the canonical wrapper [S] | **N/A — M3 has no leading icon** (the 24px `icon-size` token belongs to the composed close button) |

### description

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| color | ⚪ | **OFF** — no description part | **on** — `text-muted-foreground` [S-supplementary], the ONLY system with a distinct description colour | **OFF** — no description part |

### group (stacking/positioning container)

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| position (default corner) | 🔒 | fixed, bottom-right (real source default) [S] | fixed, bottom-right [S-supplementary/R] | fixed, bottom-center (implied) [R] |
| width | ⚪ | **on**, `--toastGroup-width`, LITERAL per-density (210/260/310/360px, not derived) [S] | **on**, 384px (`max-w-sm`) [S-supplementary] | **OFF** — no token |
| gap | ⚪ | **OFF** — owned by the item's own margin instead [S] | **on**, 12px (`--gap`) [S-supplementary] | **OFF** — no token |
| z-index | ⚪ | `--salt-zIndex-flyover`=1500 [S] | 50 (`z-50`) [S-supplementary]; canonical [R], not cited as a number | **OFF** — no token |

---

## Findings from building this matrix

1. **The M3 type/status axis is CONFIRMED ABSENT — the exact same marquee
   finding ALERT-MATRIX.md recorded for M3's banner, recurring on a second,
   completely different component.** `_md-comp-snackbar.scss` has exactly
   one `container-color` (`inverse-surface`) and no colour-axis token of any
   kind. Two components, one system, the identical structural gap, found
   independently both times by grepping the component's OWN token family
   rather than assuming from the first result.

2. **The "icon" token family in M3's snackbar is a false friend — it names
   the CLOSE button, not a leading glyph.** `icon-color`/`-focus`/`-hover`/
   `-pressed` carry INTERACTION states, a property only a clickable element
   would need; a decorative leading glyph would need none. Confirmed by
   cross-referencing the Material snackbar spec's own anatomy (text +
   optional action + optional dismiss icon, no leading icon) — M3's
   snackbar is the mirror image of Salt/shadcn's own toast, which both DO
   lead with a status icon and neither has any interactive-icon token at
   all. Recorded as `structure.icon: off` / `structure.close: on` for M3,
   not the other way around, on this basis.

3. **Salt's `Toast` diverges from its own `Banner` sibling on TWO real,
   structural axes: default ARIA role, and whether actions/close get a
   dedicated wrapper.** Banner has NO default role (Salt's own
   `accessibility.mdx` tells the consumer to choose); `Toast.tsx` hardcodes
   `role="alert"` unconditionally. Banner has a real `BannerActions`
   subcomponent; `Toast.tsx` has NONE — every story's action/dismiss button
   is a free child with no distinct data-slot. Two components from the SAME
   design system, built by the same team, landing on opposite answers to
   both questions — a reminder that "Salt's convention" is not a single
   fact to memorise per system, it is per-component and must be re-grepped
   every time (CLAUDE.md's own "grep, never recall," applied at the
   cross-component level this session).

4. **A genuine three-way split on WHERE inter-toast spacing lives.** Salt
   puts it on the ITEM's own outer margin (`Toast.css`'s `margin: 0
   spacing-100 spacing-100 spacing-100`, plus a `:last-child` override);
   shadcn's supplementary 'base' evidence puts it on the GROUP's own flex
   `gap` (`--gap: 0.75rem`); M3 has no token for it at all in either
   location. Modelled as two separate rows (`style.item.margin`,
   `style.group.gap`) rather than one, precisely so this WHERE-question is
   visible rather than flattened into "some spacing value."

5. **M3's snackbar is the first M3 column in this pipeline whose container
   colour is a deliberately INVERTED, high-contrast surface.** Every prior
   M3 column (alert's banner, and every checkbox/switch/radio-group/slider
   surface) used a same-family-as-the-page role (`surface-container`,
   `surface`, etc.). Snackbar's `container-color` → `inverse-surface` and
   `supporting-text-color` → `inverse-on-surface` are a genuinely different
   family — a dark chip floating on a light page, or vice-versa — matching
   the real-world snackbar pattern (a temporary overlay meant to visually
   separate from the page) in a way this pipeline had not yet seen
   tokenised.

6. **A real bug found and fixed during this build, before any live
   verification: the salt column's `prop.position` value list violated
   CLAUDE.md rule 7 ("`value[0]` is the SOURCE DEFAULT").** The first draft
   listed `["top-right", "bottom-right"]`, but `ToastGroup.tsx`'s own
   default is `"bottom-right"` — the array had the non-default value first.
   Caught by re-reading the row-authoring rule while writing the harness
   (not by any of the five gates, none of which check list ORDER, only
   membership), fixed to `["bottom-right", "top-right"]` before the harness
   was built. shadcn's own position list carries the same convention
   (bottom-right first) on the honestly-labelled basis that the canonical
   wrapper itself sets no default position prop — [R], not [S], and said so
   in the cell's own note rather than presenting an unsourced order as fact.

7. **Live verification, stated plainly — Playwright/Chromium WAS available
   this session** (`executablePath: '/opt/pw-browsers/chromium'`, the same
   approach every recent component's build used) **and drove the actual
   TIME-BASED transitions this component is built around, not just static
   mounts.** Confirmed live against `out/toast-check.html`:
   (a) **a real mount→auto-dismiss transition**: adding a toast with a
   short (1.2s) duration shows it present, then confirms it is REMOVED from
   the DOM after real elapsed wall-clock time, in all three columns;
   (b) **a real mount→manual-dismiss transition**: clicking a toast's own
   close button removes it immediately, for shadcn/M3 (Salt has no close
   button by design — confirmed absent, not silently skipped);
   (c) **stacking**: three live toasts added to a real `ToastGroup` render
   with zero vertical overlap (`getBoundingClientRect` on each), newest
   last in document order, in all three columns;
   (d) **PAUSE-ON-HOVER, specifically** (this component's own novel
   behaviour, with no precedent in any prior component's gate): hovering an
   auto-dismissing toast for LONGER than its own nominal duration leaves it
   still present; moving the pointer away resumes the countdown and the
   toast is removed shortly after — verified with a real `.hover()`/mouse
   move via Playwright (`verify-pause.mjs`: `{ countBefore: 1,
   countWhileHovered: 1, countAfterResume: 0 }` across a 1.2s duration held
   through 1.6s of hover);
   (e) **position**: clicking each of shadcn's six position buttons moves
   the SAME live group to a genuinely different corner (`getBoundingClientRect`
   x/y both change correctly per direction) — `prop.position`'s config
   values are DISCRIMINATED by a real skeleton branch, not a dead axis
   (ALERT-MATRIX.md finding 10's warning, checked proactively);
   (f) **type/icon presence**: every Salt/shadcn type value renders its own
   icon; M3 (no type axis) renders none — confirmed per-instance, not
   assumed from the config;
   (g) **part geometry**: icon/message/description/action/close render with
   distinct, sequential, non-overlapping bounding boxes wherever a column
   has the part (RADIO-GROUP-MATRIX.md finding 8's lesson, applied
   proactively from the first draft — every part got its own `data-slot`
   before any selector was written, per rule 12/13).
   `harness/conformance.tsx`'s new `checkToast()` — 15 assertions across the
   three columns, using a REAL wall-clock `waitUntilReal()` helper (spins
   on the existing MessageChannel `tick()`, not throttled, while polling
   real `Date.now()` elapsed time, since this hidden tab's own
   `window.setTimeout` — which the SKELETON's timer also uses — is
   throttled to roughly 1/sec) — passed 15/15, bringing the harness total
   to **122/122, zero failures, zero regressions** on the prior 107.
   **Calibrated per rule 11 before trusting it**: `handlePointerEnter`'s
   remaining-time computation was deliberately broken (made a no-op), the
   `behavior.pause-on-interaction` assertion correctly went red in all
   three columns (`stillTherePastNominal=false` — the toast fired on
   schedule despite being hovered), then restored and re-verified green
   (byte-identical diff against the pre-mutation file). `check-toast-
   behavior.mjs` (the stopgap code-existence gate) was calibrated the same
   way: the `behavior.auto-dismiss` symbol was corrupted, confirmed the
   gate went red with the expected "cited code not found" message, then
   restored.

8. **`check-anatomy.mjs` reports `toast: 4 parts · 0 shared · 1
   system-unique`, correctly flagging genuine, near-total divergence rather
   than a retrofit.** Zero of the four counted structure categories
   (icon/description/action/close) are populated identically across all
   three columns — Salt has icon only, shadcn has all four, M3 has
   action+close only — the strongest per-part divergence this pipeline has
   recorded for any component so far, and exactly what rule 1 (never
   retrofit) demands: three genuinely different systems, reproduced as
   three genuinely different configurations of one union chassis.

9. **A real defect, found on orchestrator review after the build's own live
   verification had already passed — the same shape as
   RADIO-GROUP-MATRIX.md finding 8: a passing STATE check is not a passing
   LAYOUT check.** `style.item.padding` and `style.item.gap` are both
   `policy: "default"` — "on with a registry default when a column is
   silent" per CLAUDE.md's own row-policy table, the identical convention
   `tooltip.m3.json`'s delay row already established ("registry default
   applied, not fabricated as an M3-specific number"). The first draft set
   both to `off` for M3 with a correct, sourced absence note (no padding
   or gap token exists anywhere in `_md-comp-snackbar.scss`, confirmed) —
   but `off` is not a legitimate outcome for a `default`-policy row, only
   for `switchable`. The practical effect: a real M3 toast rendered with
   its message, action button and close button flush against each other
   at zero gap, confirmed live with `getBoundingClientRect` (the message's
   right edge exactly equalled the action button's left edge, and the
   action button's right edge exactly equalled the close button's left
   edge — no visual separation at all). Fixed by applying REGISTRY
   DEFAULTS — 16px padding, 12px gap — explicitly labelled as such rather
   than attributed to M3, chosen to match shadcn's own real, already-cited
   values (`p-4`/`gap-3`) rather than inventing unrelated numbers.
   Re-verified live after the fix: clean 12px gaps on both sides,
   screenshot-confirmed. **A broader, related finding surfaced while
   investigating this one, logged in CLAUDE.md's Known-open work rather
   than fixed here (out of scope for this component): a repo-wide sweep
   found 40 instances across 17 components where a `policy: "default"` row
   has an `off` cell for some system — most are probably fine (some
   channels other than `css` may not need a registry-default concept the
   same way), but at least one sibling case (`alert.m3.json`'s own
   `style.root.padding`/`style.root.gap`, cited almost verbatim by this
   component's own first-draft note) looks like the same class of bug,
   unverified.**

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/toast.template.json` against every system, read from `columns/toast.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 8 light, 3 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `item-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `item-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `type-info` | rgb(0, 120, 207) | — | **no** |
| `type-error` | rgb(229, 33, 53) | — | **no** |
| `type-warning` | rgb(199, 83, 0) | — | **no** |
| `type-success` | rgb(0, 135, 93) | — | **no** |
| `type-active` | var(--type-info) | — | **no** |
| `item-elevation` | 0 6px 10px 0 rgba(0,0,0,0.2) | 0 6px 10px 0 rgba(0,0,0,0.55) | yes |

**shadcn** — 6 light, 4 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `item-bg` | oklch(1 0 0) | oklch(0.205 0 0) | **no** |
| `item-fg` | oklch(0% 0 0) | oklch(0.985 0 0) | **no** |
| `item-border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `item-shape` | 10px | — | yes |
| `description-fg` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `item-elevation` | 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) | — | yes |

**m3** — 6 light, 2 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `item-bg` | #e6e0e9 | #322f35 | yes |
| `item-fg` | #322f35 | #f5eff7 | yes |
| `item-shape` | 4px | — | yes |
| `item-elevation` | 0 1px 3px 0 rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15) | — | yes |
| `item-min-height` | 48px | — | yes |
| `type-body` | 400 0.875rem/1.25rem 'Roboto', sans-serif | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.group` | structure | locked | — | — | — |
| 2 | `structure.icon` | structure | switchable | `True` | `True` | **off** |
| 3 | `structure.description` | structure | switchable | **off** | `True` | **off** |
| 4 | `structure.action` | structure | switchable | **off** | `True` | `True` |
| 5 | `structure.close` | structure | switchable | **off** | `True` | `True` |
| 6 | `behavior.role` | behavior | switchable | `alert` | `status` | `status` |
| 7 | `behavior.auto-dismiss` | behavior | default | **off** | — | — |
| 8 | `behavior.pause-on-interaction` | behavior | default | **off** | — | — |
| 9 | `behavior.dismiss` | behavior | locked | — | — | — |
| 10 | `behavior.swipe-dismiss` | behavior | switchable | **off** | — | — |
| 11 | `behavior.stacking-order` | behavior | locked | — | — | — |
| 12 | `prop.type` | prop | default | `info, error, warning, success` | `default, success, info, warning, error, loading` | **off** |
| 13 | `prop.position` | prop | switchable | `bottom-right, top-right` | `bottom-right, top-left, top-center, top-right, bottom-left, bottom-center` | **off** |
| 14 | `prop.duration` | prop | default | — | — | — |
| 15 | `slot.composes` | slot | default | — | — | — |
| 16 | `slot.message` | slot | locked | — | — | — |
| 17 | `slot.description` | slot | switchable | — | — | — |
| 18 | `state.rest` | state | locked | — | — | — |
| 19 | `state.swipe-drag` | state | switchable | — | — | — |
| 20 | `style.item.background` | style | locked | ⟡ `item-bg` | ⟡ `item-bg` | ⟡ `item-bg` |
| 21 | `style.item.border-color` | style | switchable | ⟡ `type-active` | ⟡ `item-border` | **off** |
| 22 | `style.item.border-width` | style | switchable | `1px` | `1px` | `0` |
| 23 | `style.item.shape` | style | default | ⟡ `item-shape` | ⟡ `item-shape` | ⟡ `item-shape` |
| 24 | `style.item.elevation` | style | default | ⟡ `item-elevation` | ⟡ `item-elevation` | ⟡ `item-elevation` |
| 25 | `style.item.padding` | style | default | ⟡ `item-padding` | `16px` | `16px` |
| 26 | `style.item.gap` | style | default | ⟡ `item-gap` | `12px` | `12px` |
| 27 | `style.item.margin` | style | switchable | ⟡ `item-margin` | **off** | **off** |
| 28 | `style.item.min-height` | style | switchable | ⟡ `item-min-height` | **off** | ⟡ `item-min-height` |
| 29 | `style.item.width` | style | switchable | **off** | **off** | **off** |
| 30 | `style.item.font` | style | default | ⟡ `type-body` | `400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif` | ⟡ `type-body` |
| 31 | `style.item.color` | style | locked | ⟡ `item-fg` | ⟡ `item-fg` | ⟡ `item-fg` |
| 32 | `style.icon.color` | style | switchable | ⟡ `type-active` | ⟡ `item-fg` | **off** |
| 33 | `style.icon.size` | style | switchable | ⟡ `icon-size` | `16px` | **off** |
| 34 | `style.description.color` | style | switchable | **off** | ⟡ `description-fg` | **off** |
| 35 | `style.group.position` | style | locked | `position: fixed; bottom: 0; right: 0; top: auto; left: auto; justify-content: flex-end` | `position: fixed; bottom: 0; right: 0; top: auto; left: auto` | `position: fixed; bottom: 0; left: 50%; top: auto; right: auto; transform: translateX(-50%)` |
| 36 | `style.group.width` | style | switchable | ⟡ `group-width` | `384px` | **off** |
| 37 | `style.group.gap` | style | switchable | **off** | `12px` | **off** |
| 38 | `style.group.z-index` | style | switchable | `1500` | `50` | **off** |
| 39 | `style.item.type@error` | style | switchable | `--type-active: var(--type-error)` | **off** | **off** |
| 40 | `style.item.type@warning` | style | switchable | `--type-active: var(--type-warning)` | **off** | **off** |
| 41 | `style.item.type@success` | style | switchable | `--type-active: var(--type-success)` | **off** | **off** |

<details><summary>Citations — 70 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.icon` | salt | Toast.tsx: {status && <div className={withBaseName("iconContainer")}>{icon ? icon : <StatusIndicator status={status} />}</div>} — rendered ONLY when `status` (this chassis's `type`) is set |
| `structure.icon` | shadcn | sonner.tsx (canonical): icons={{ success: <CircleCheckIcon/>, info: <InfoIcon/>, warning: <TriangleAlertIcon/>, error: <OctagonXIcon/>, loading: <Loader2Icon className="animate-spin"/> }} — real, sourced, directly in the canonical wrapper |
| `structure.icon` | m3 | no leading status icon concept — the ONLY icon token family in _md-comp-snackbar.scss carries hover/focus/pressed interaction states, confirming it is the trailing DISMISS icon-button (see structure.close), not a decorative leading glyph |
| `structure.description` | salt | no dedicated title/description split — ToastContent's children are freeform; a two-line look is a content-formatting convention only (toast.stories.tsx 'Info'/'Error'/'Warning' stories nest a bold <Text> and a plain <div> inside ONE ToastContent, same convention as Banner's bold-first-line) |
| `structure.description` | shadcn | sonner-demo.tsx: toast("Event has been created", { description: "Sunday, December 03, 2023 at 9:00 AM", ... }) — real, sourced call shape |
| `structure.description` | m3 | exactly ONE text-run token family ('supporting-text-*') exists — grepped directly, the string 'title' appears zero times, no second text-role family of any kind |
| `structure.action` | salt | NO dedicated actions wrapper exists in Toast.tsx (unlike Banner's BannerActions) — action buttons in toast.stories.tsx's Error/Warning exports are ordinary <Button> children composed inside ToastContent's own FlowLayout, no distinct data-slot hook. A real structural CONTRAST with alert/banner, not an oversight — see TOAST-MATRIX.md Findings. |
| `structure.action` | shadcn | sonner-demo.tsx: toast(message, { action: { label: "Undo", onClick: () => console.log("Undo") } }) — real, sourced call shape |
| `structure.action` | m3 | 'action-label-text-*' family (see provenance.action-family-unmodelled) — the richest single part in the whole snackbar token file |
| `structure.close` | salt | no dedicated close part — an ordinary <Button appearance="transparent" aria-label="Dismiss"> composed as a free child (toast.stories.tsx, toast-group.stories.tsx's closeToast pattern), same composition convention Banner's own close used |
| `structure.close` | shadcn | canonical sonner.tsx does not itself show a close-button element (it forwards {...props} into the external package) — [R] boundary. SUPPLEMENTARY evidence: base style's real ToastClose (data-slot="toast-close", aria-label="Close toast", render={<Button variant="ghost" size="icon-sm"/>}) confirms the pattern is a real shadcn-family convention, the same class of citation alert.shadcn.json made for s |
| `structure.close` | m3 | 'icon-*' family (see provenance.icon-family-is-the-close-button) — a first-class dedicated close affordance, mirroring alert.m3.json's own close-button finding |
| `behavior.role` | salt | Toast.tsx: role="alert" HARDCODED, always — <div ... role="alert" {...rest} ref={ref}>. A real CONTRAST with alert.salt.json's own Banner column, which has NO default role at all. |
| `behavior.role` | shadcn | [R] — canonical sonner is external; role not visible in the wrapper file. Treated as role="status" per the general APG live-region/toast convention, the same boundary alert.shadcn.json's own M3 role cell used (there for a different reason — no live component at all). |
| `behavior.role` | m3 | [R] — no live component in this tokens-only clone; treated as role="status" per the general APG toast/live-region convention, the same boundary alert.m3.json's own role cell used |
| `behavior.auto-dismiss` | salt | CONFIRMED OFF — no setTimeout/timer of any kind anywhere in Toast.tsx, ToastContent.tsx or ToastGroup.tsx (grepped directly). site/docs/components/toast/usage.mdx states directly: 'Users should always be able to close or dismiss a toast' — Salt toasts are PERSISTENT by design until manually dismissed. toast-group.stories.tsx's own ToastEntryType/useState array management confirms: every example to |
| `behavior.pause-on-interaction` | salt | no timer exists to pause (see behavior.auto-dismiss) |
| `behavior.swipe-dismiss` | salt | no swipe/gesture code anywhere in Toast.tsx/ToastContent.tsx (grepped, confirmed absent) |
| `prop.type` | salt | Toast.tsx status?: ValidationStatus -> status-indicator/ValidationStatus.ts ValidationStatusValues, no forced default (undefined status renders no icon/colour at all, unlike Banner's default "info") |
| `prop.type` | shadcn | sonner-types.tsx: toast(...), toast.success(...), toast.info(...), toast.warning(...), toast.error(...), toast.promise(...) (loading state) — six real, sourced call variants |
| `prop.type` | m3 | CONFIRMED ABSENCE — grepped directly: _md-comp-snackbar.scss has exactly ONE container-color (inverse-surface) and no colour-axis token of any kind. The SAME marquee finding alert.m3.json recorded for M3's banner, recurring here. |
| `prop.position` | salt | ToastGroup.tsx placement?: "top-right" \| "bottom-right", default "bottom-right" — bottom-right listed first per the value[0]-is-source-default convention |
| `prop.position` | shadcn | sonner-position.tsx: six real toast(message, { position }) calls, one per value — sonner-position.tsx itself does not indicate which is the DEFAULT (all six are shown as equal buttons); bottom-right is listed first per this chassis's own default (see style.group.position), matching the commonly-documented external sonner default, [R] since the wrapper file itself does not set a default position pr |
| `prop.position` | m3 | no positioning token exists — position is a layout concern this component's token file does not tokenise |
| `style.item.background` | salt | does NOT vary by type — only border/icon do (see style.item.type@error etc) |
| `style.item.border-color` | salt | status-driven indirection, identical mechanism to alert.salt.json's own border-color row |
| `style.item.border-color` | shadcn | FIXED regardless of type — no per-type border-color override anywhere in the canonical wrapper's own theming variables, a real non-variation (see style.item.type@error) |
| `style.item.border-color` | m3 | no border/outline token exists anywhere in _md-comp-snackbar.scss, confirmed by grep — M3's snackbar, like its banner, is colour-fill only |
| `style.item.border-width` | salt | Toast.css border-width: var(--saltToast-borderWidth, var(--salt-size-fixed-100)) = 1px, density-invariant |
| `style.item.border-width` | shadcn | [S-supplementary] base style's own `border` class -> Tailwind's undeclared default border-width |
| `style.item.border-width` | m3 | explicitly zeroed, not left off — base sets border-style:solid for cross-system layout convenience; an absent width would let the browser's initial ~3px border render unwanted, the same reasoning alert.m3.json's own border-width cell gives |
| `style.item.padding` | shadcn | [S-supplementary], see provenance.item-padding |
| `style.item.padding` | m3 | CORRECTED DURING ORCHESTRATOR REVIEW — this row is policy="default" ("on with a registry default when a column is silent", the same convention tooltip.m3.json's own delay row already established), not policy="switchable"; `off` is not a legitimate outcome and left a real M3 toast's message/action/close flush against each other with zero gap (confirmed live via getBoundingClientRect). No padding to |
| `style.item.gap` | shadcn | [S-supplementary], see provenance.item-padding |
| `style.item.gap` | m3 | CORRECTED DURING ORCHESTRATOR REVIEW, same reasoning as style.item.padding — no gap token exists in _md-comp-snackbar.scss (confirmed absent), so 12px is a REGISTRY DEFAULT matching shadcn's own real, cited `gap-3` value, not an M3-sourced number. |
| `style.item.margin` | salt | Salt-only: inter-toast spacing is owned by the ITEM's own margin, not the group (see style.group.gap being off for Salt) |
| `style.item.margin` | shadcn | inter-toast spacing is owned by the GROUP's own gap in this family, not the item's margin — see style.group.gap |
| `style.item.margin` | m3 | no token, no live component |
| `style.item.min-height` | shadcn | content-driven, no min-height concept in any shadcn toast source checked (canonical or supplementary), a real gap |
| `style.item.width` | salt | the fixed width lives on the GROUP (ToastGroup.css --toastGroup-width), not the item — see style.group.width |
| `style.item.width` | shadcn | the fixed width lives on the viewport/group, not the item — see style.group.width |
| `style.item.width` | m3 | no width token anywhere |
| `style.item.font` | shadcn | [S-supplementary], see provenance.item-font |
| `style.icon.color` | salt | StatusIndicator resolves to the SAME palette-{status} value as the border — genuinely independent of the body text colour, identical mechanism to alert.salt.json's own icon colour |
| `style.icon.color` | shadcn | [R] — canonical sonner's icons inherit currentColor by convention (external, not independently verified); modelled as the same indirection as style.item.color, the same convergence alert.shadcn.json's own icon colour row recorded |
| `style.icon.color` | m3 | structure.icon is off — M3 renders no leading icon slot at all; the token nominally named 'icon-color' is the CLOSE button's icon (see provenance.icon-family-is-the-close-button), out of scope under this row (slot.composes) |
| `style.icon.size` | shadcn | [S] see provenance.icon-size — a rare case where the canonical wrapper itself gives a real value |
| `style.icon.size` | m3 | same reason as style.icon.color — the 24px 'icon-size' token belongs to the composed close button, not this row's leading-icon slot |
| `style.description.color` | salt | structure.description is off — no description part to colour |
| `style.description.color` | m3 | structure.description is off — no description part to colour |
| `style.group.position` | salt | ToastGroup.css .saltToastGroup-bottom-right { bottom: 0; right: 0; justify-content: flex-end } (the default placement) |
| `style.group.position` | shadcn | [S-supplementary] base style's ToastViewport: fixed inset-x-4 bottom-4 ... sm:right-4 sm:left-auto. Canonical sonner's own default is [R] but publicly documented as bottom-right too. |
| `style.group.position` | m3 | [R] — no positioning token exists; one implied default corner per the general Material snackbar guidance (bottom-center on compact layouts), not grepped from any source in this clone |
| `style.group.width` | shadcn | [S-supplementary], see provenance.group-width |
| `style.group.width` | m3 | no width token anywhere |
| `style.group.gap` | salt | no gap property on ToastGroup.css's own root rule — inter-toast spacing is owned by the ITEM's own margin instead (see style.item.margin) |
| `style.group.gap` | shadcn | [S-supplementary], see provenance.group-gap |
| `style.group.gap` | m3 | no token, no live component |
| `style.group.z-index` | salt | ToastGroup.css z-index: var(--salt-zIndex-flyover) = 1500 |
| `style.group.z-index` | shadcn | [S-supplementary], see provenance.group-zindex |
| `style.group.z-index` | m3 | no token, no live component |
| `style.item.type@error` | salt | Toast.css .saltToast-error { --toast-borderColor: var(--salt-status-error-borderColor); --toast-iconColor: var(--salt-status-error-foreground-decorative) } |
| `style.item.type@error` | shadcn | canonical sonner's default (non-richColors) theming keeps --normal-bg/--normal-border FIXED regardless of type — only the ICON glyph itself changes per type (structure.icon), the container does not. A real non-variation, the same shape alert.shadcn.json's own destructive-only-recolors-text finding recorded. |
| `style.item.type@error` | m3 | M3 has no type axis at all (see prop.type) |
| `style.item.type@warning` | salt | Toast.css .saltToast-warning |
| `style.item.type@warning` | shadcn | same non-variation as style.item.type@error |
| `style.item.type@warning` | m3 | M3 has no type axis at all (see prop.type) |
| `style.item.type@success` | salt | Toast.css .saltToast-success |
| `style.item.type@success` | shadcn | same non-variation as style.item.type@error |
| `style.item.type@success` | m3 | M3 has no type axis at all (see prop.type) |

</details>

<!-- END GENERATED VALUES -->
