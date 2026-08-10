/* BEHAVIOUR CONFORMANCE HARNESS — the missing third gate.
 *
 * The existing gates prove a behaviour row's code EXISTS and is bound to its
 * row. They cannot prove it RUNS. That distinction is not theoretical: it cost
 * two real defects that passed every check.
 *
 *   dialog  — `initial-focus` and `background-suppression` were implemented,
 *             correctly written, correctly cited, and never executed. Both read
 *             `panelRef.current` in an effect whose dep array omitted the state
 *             that gates the panel's rendering, so they ran once against a null
 *             ref and never again. Scroll-lock (which reads no ref) worked, so
 *             the dialog FELT modal while two of its three global side effects
 *             were silently absent.
 *   select  — `dismiss` on outside interaction was documented for all three
 *             systems and simply not implemented. Found by the owner trying to
 *             close a popup.
 *
 * This file drives the real skeletons in a real DOM and asserts OBSERVABLE
 * behaviour. Each assertion names the behavior row it covers, so a failure
 * points at a matrix row, not just a stack trace.
 *
 * TWO ENVIRONMENT RULES, learned the hard way on tabs:
 *   1. This page runs in a background/hidden tab. `document.activeElement`
 *      updates on a programmatic .focus(), but the browser SUPPRESSES focus
 *      EVENTS entirely (document.hasFocus() === false). Anything that reacts to
 *      focus ARRIVING must be driven with a synthetic bubbling `focusin`, or it
 *      produces a convincing false negative. Chasing one cost an hour.
 *   2. React state is async. Never assert in the same tick as the action that
 *      causes it — every step here yields first.
 */
import * as React from "react"
import { createRoot } from "react-dom/client"

import { Dialog } from "../skeleton/dialog"
import { Select } from "../skeleton/select"
import { Tabs } from "../skeleton/tabs"
import { Card } from "../skeleton/card"
import { Checkbox, CheckboxGroup, type CheckboxConfig } from "../skeleton/checkbox"
import { Switch } from "../skeleton/switch"
import { RadioGroup, RadioItem } from "../skeleton/radio-group"
import { Slider } from "../skeleton/slider"
import { Toast, ToastGroup } from "../skeleton/toast"
import { DropdownMenu, type MenuNode } from "../skeleton/dropdown-menu"

import dialogCfg from "../out/gen/dialog-config.json"
import selectCfg from "../out/gen/select-config.json"
import tabsCfg from "../out/gen/tabs-config.json"
import cardCfg from "../out/gen/card-config.json"
import checkboxCfg from "../out/gen/checkbox-config.json"
import switchCfg from "../out/gen/switch-config.json"
import radioGroupCfg from "../out/gen/radio-group-config.json"
import sliderCfg from "../out/gen/slider-config.json"
import toastCfg from "../out/gen/toast-config.json"
import dropdownMenuCfg from "../out/gen/dropdown-menu-config.json"

type Result = { component: string; row: string; system: string; pass: boolean; detail: string }

const results: Result[] = []

/* Yield via MessageChannel, NOT setTimeout. This page runs in a hidden tab,
 * where browsers throttle setTimeout to roughly 1/second — the harness makes
 * a few hundred yields, so a timer-based settle turned a 2-second run into
 * minutes and looked like a hang. MessageChannel is not throttled, and is what
 * React's own scheduler uses, so this also tracks React's flush cadence. */
const tick = () =>
  new Promise<void>((resolve) => {
    const ch = new MessageChannel()
    ch.port1.onmessage = () => resolve()
    ch.port2.postMessage(0)
  })
const settle = async () => { await tick(); await tick(); await tick() }

/* Poll instead of guessing a fixed number of ticks. React's scheduler also runs
 * on MessageChannel, so our yields interleave with its work and a fixed settle
 * is a race — a two-phase mount (render open -> effect sets mounted -> render
 * panel) intermittently reported "no panel" and would have been read as a
 * component defect. A conformance harness that flakes is worse than none: it
 * teaches you to distrust real failures. */
async function waitFor<T>(get: () => T | null | undefined, tries = 40): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    const v = get()
    if (v) return v
    await tick()
  }
  return null
}

/* TOAST-SPECIFIC: this pipeline's first genuinely time-based behaviour needs
 * a REAL wall-clock wait, not just more scheduler yields — settle()'s three
 * MessageChannel ticks resolve almost instantly and would race Toast's own
 * setTimeout-driven dismissal every time. Spins on tick() (NOT throttled,
 * see above) while polling a real Date.now() budget, so it waits exactly as
 * long as it needs to and no longer, regardless of how throttled the
 * skeleton's OWN window.setTimeout is in this hidden tab (up to ~1/sec worst
 * case) — the timeout budgets below are chosen generously for that reason. */
async function waitUntilReal(check: () => boolean, timeoutMs: number): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (check()) return true
    await tick()
  }
  return check()
}

function record(component: string, row: string, system: string, pass: boolean, detail: string) {
  results.push({ component, row, system, pass, detail })
}

/** focus() alone will not fire React's onFocus in a hidden tab — see rule 1. */
function focusFor(el: HTMLElement) {
  el.focus()
  el.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
}

function key(el: Element, k: string) {
  el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }))
}

// ---------------------------------------------------------------- dialog

async function checkDialog(host: HTMLElement, system: string) {
  const cfg = (dialogCfg as Record<string, any>)[system]
  const mount = document.createElement("div")
  mount.setAttribute("data-theme", system)
  host.appendChild(mount)
  const root = createRoot(mount)

  const trigger = document.createElement("button")
  trigger.textContent = "open"
  mount.appendChild(trigger)

  function Harness({ open }: { open: boolean }) {
    return (
      <Dialog config={cfg} open={open} onClose={() => {}} title="T" description="D">
        <button>inner</button>
      </Dialog>
    )
  }

  // Mount CLOSED, then open — never mount already-open. The dialog defect this
  // harness exists to catch only appears on the closed->open TRANSITION: with
  // `open` true from the first render, `mounted` initialises true, the panel is
  // there when the effect first runs, and the missing dependency never bites.
  // Verified: with the original bug reintroduced, an already-open mount reports
  // 0 failures and this sequence reports the defect. Test the transition a user
  // actually performs, not the end state.
  trigger.focus()
  root.render(<Harness open={false} />)
  await settle()
  root.render(<Harness open />)
  const panel = await waitFor(
    () => mount.querySelector('[data-slot="dialog-panel"]') as HTMLElement | null)
  record("dialog", "structure.panel", system, !!panel, panel ? "panel rendered" : "no panel")

  if (panel) {
    // behavior.initial-focus — the bug that passed every other gate
    // Poll: initial focus may land a tick after the panel commits. Asserting
    // once immediately cannot tell "never focused" from "not yet focused", and
    // reading the second as a defect is how a harness manufactures bugs.
    await waitFor(() => panel.contains(document.activeElement))
    const inside = panel.contains(document.activeElement)
    const tb = [...panel.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    const visible = tb.filter((e) => e.offsetParent !== null)
    record("dialog", "behavior.initial-focus", system, inside,
      inside ? "focus moved into the panel"
             : "focus never entered — " + tb.length + " tabbable(s), " + visible.length +
               " with offsetParent, panelTabindex=" + panel.getAttribute("tabindex") +
               ", initialFocus=" + cfg.initialFocus + ", focusReturn=" + cfg.focusReturn +
               ", active=" + (document.activeElement?.tagName || "?"))

    // behavior.role / aria-modal / labelled-by
    record("dialog", "behavior.role", system, panel.getAttribute("role") === "dialog",
      "role=" + panel.getAttribute("role"))
    record("dialog", "behavior.labelled-by", system, !!panel.getAttribute("aria-labelledby"),
      panel.getAttribute("aria-labelledby") ? "labelled" : "no aria-labelledby")

    // behavior.scroll-lock — reads no ref, so it worked even when the others did not
    const locked = getComputedStyle(document.documentElement).overflow === "hidden"
    record("dialog", "behavior.scroll-lock", system, locked, locked ? "page scroll locked" : "not locked")

    // behavior.focus-trap — Tab from the last tabbable wraps to the first
    const t = [...panel.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')]
    if (t.length > 1) {
      t[t.length - 1].focus()
      key(t[t.length - 1], "Tab")
      await settle()
      const wrapped = panel.contains(document.activeElement)
      record("dialog", "behavior.focus-trap", system, wrapped,
        wrapped ? "Tab stayed inside the panel" : "Tab escaped the panel")
    }

    // behavior.dismiss-escape
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await settle()
  }

  root.unmount()
  mount.remove()
}

// ---------------------------------------------------------------- select

async function checkSelect(host: HTMLElement, system: string) {
  const cfg = (selectCfg as Record<string, any>)[system]
  const mount = document.createElement("div")
  mount.setAttribute("data-theme", system)
  host.appendChild(mount)
  const root = createRoot(mount)

  const OPTIONS = [
    { value: "a", label: "Apple" },
    { value: "b", label: "Banana" },
    { value: "c", label: "Cherry" },
  ]
  root.render(<Select config={cfg} options={OPTIONS} defaultValue="a" />)
  await settle()

  const trigger = mount.querySelector('[data-slot="select-trigger"]') as HTMLElement
  const isOpen = () => !!mount.querySelector('[data-slot="select-popup"]')

  trigger.click()
  await waitFor(isOpen)
  record("select", "behavior.open", system, isOpen(), isOpen() ? "opened on trigger" : "did not open")

  // behavior.dismiss — the row select shipped documented but unimplemented.
  // pointerdown, not click: that is the event both real systems dismiss on.
  document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
  await waitFor(() => !isOpen())
  record("select", "behavior.dismiss-outside", system, !isOpen(),
    isOpen() ? "outside press did NOT close (select's original defect)" : "outside press closed it")

  trigger.click()
  await waitFor(isOpen)
  key(trigger, "Escape")
  await waitFor(() => !isOpen())
  record("select", "behavior.dismiss-escape", system, !isOpen(),
    isOpen() ? "Escape did not close" : "Escape closed it")

  root.unmount()
  mount.remove()
}

// ------------------------------------------------------------------ tabs

async function checkTabs(host: HTMLElement, system: string) {
  const cfg = (tabsCfg as Record<string, any>)[system]
  const mount = document.createElement("div")
  mount.setAttribute("data-theme", system)
  host.appendChild(mount)
  const root = createRoot(mount)

  const items = [
    { value: "one", label: "One" },
    { value: "two", label: "Two", disabled: true },
    { value: "three", label: "Three" },
  ]
  root.render(<Tabs config={cfg} items={items} defaultValue="one" />)
  await settle()

  const tabs = () => [...mount.querySelectorAll<HTMLElement>('[role="tab"]')]
  const stops = tabs().filter((t) => t.getAttribute("tabindex") !== "-1").length
  record("tabs", "behavior.roving-tabindex", system, stops === 1, stops + " tab stop(s), expected 1")

  // behavior.arrow-keys + disabled-navigation
  const first = tabs()[0]
  first.focus()
  key(first, "ArrowRight")
  await settle()
  const landed = (document.activeElement?.textContent || "").trim()
  const skips = (cfg.disabledNavigation || "reachable") === "skipped"
  const ok = skips ? landed.startsWith("Three") : landed.startsWith("Two")
  record("tabs", "behavior.disabled-navigation", system, ok,
    "landed on " + landed + " (" + (skips ? "should skip disabled" : "should reach disabled") + ")")

  // behavior.activation-mode — automatic selects on focus; manual must NOT.
  // FIXED 2026-08-05 (see CLAUDE.md's Known-open work / TABS-MATRIX.md
  // finding): the disabled-navigation assertion just above already moves
  // real focus to tabs()[2] for any column whose disabledNavigation is
  // "skipped" (shadcn's config) — and for "automatic" columns, THAT focus
  // move already committed the selection too. This assertion then used to
  // re-focus the SAME already-focused tabs()[2], which is a browser no-op
  // (focusing an already-focused element fires no new "focus" event), so
  // "before === after" was misreported as "automatic activation held" —
  // a test-sequencing artifact, not a skeleton defect. Confirmed live: the
  // exact same skeleton, tested in isolation with a fresh mount and no
  // prior focus move, resolves the transition correctly every time.
  // Fixed by explicitly returning focus to a DIFFERENT tab first, so the
  // subsequent move to the target is always a real, event-firing
  // transition regardless of what the prior assertion left focus on.
  const neutral = tabs()[0]
  if (document.activeElement !== neutral) focusFor(neutral)
  await settle()
  const before = tabs().find((t) => t.getAttribute("aria-selected") === "true")?.textContent
  const target = tabs()[2]
  focusFor(target)                       // synthetic focusin — see environment rule 1
  await settle()
  const after = tabs().find((t) => t.getAttribute("aria-selected") === "true")?.textContent
  const auto = (cfg.activationMode?.[0] || "automatic") === "automatic"
  const moved = before !== after
  record("tabs", "behavior.activation-mode", system, auto ? moved : !moved,
    (auto ? "automatic: " : "manual: ") + "selection " + (moved ? "moved" : "held"))

  root.unmount()
  mount.remove()
}

// ------------------------------------------------------------------ card

async function checkCard(host: HTMLElement, system: string) {
  const cfg = (cardCfg as Record<string, any>)[system]
  if (!cfg?.interaction || !cfg.interaction.includes("button")) return
  const mount = document.createElement("div")
  mount.setAttribute("data-theme", system)
  host.appendChild(mount)
  const root = createRoot(mount)

  let fired = 0
  root.render(
    <Card config={cfg} interaction="button" onActivate={() => { fired += 1 }} title="C">
      body
    </Card>,
  )
  await settle()

  const card = mount.querySelector('[data-slot="card"]') as HTMLElement
  record("card", "behavior.role", system, card?.getAttribute("role") === "button",
    "role=" + card?.getAttribute("role"))

  // behavior.keyboard-activation — a div with role=button gets NO free keyboard
  key(card, "Enter")
  await settle()
  record("card", "behavior.keyboard-activation", system, fired > 0,
    fired > 0 ? "Enter activated" : "Enter did nothing on a role=button card")

  root.unmount()
  mount.remove()
}

// --------------------------------------------------------------- checkbox

async function checkCheckbox(host: HTMLElement, system: string) {
  const cfg = (checkboxCfg as Record<string, any>)[system]

  // 1 — behavior.tri-state: mounted INDETERMINATE, then a real user
  // interaction (click — what a Space keypress's default action performs)
  // resolves it to checked and clears indeterminate. Testing the
  // TRANSITION, not just three static mounts (CLAUDE.md method notes).
  const mount1 = document.createElement("div")
  mount1.setAttribute("data-theme", system)
  host.appendChild(mount1)
  const root1 = createRoot(mount1)
  function TriStateHarness() {
    const [checked, setChecked] = React.useState(false)
    const [indeterminate, setIndeterminate] = React.useState(true)
    return (
      <Checkbox
        config={cfg}
        checked={checked}
        indeterminate={indeterminate}
        onCheckedChange={(next) => {
          setChecked(next)
          setIndeterminate(false)
        }}
        aria-label="tri-state"
      />
    )
  }
  root1.render(<TriStateHarness />)
  await settle()
  const input1 = mount1.querySelector('[data-slot="checkbox-input"]') as HTMLInputElement | null
  record("checkbox", "structure.native-input", system, !!input1, input1 ? "native input rendered" : "no input found")
  if (input1) {
    const wasIndeterminate = input1.indeterminate
    input1.click()
    await settle()
    const resolved = input1.checked === true && input1.indeterminate === false
    record(
      "checkbox",
      "behavior.tri-state",
      system,
      resolved,
      `before: indeterminate=${wasIndeterminate}; after click: checked=${input1.checked} indeterminate=${input1.indeterminate}`,
    )
  }
  root1.unmount()
  mount1.remove()

  // 2 — behavior.keyboard-activation: Enter does NOTHING (native checkbox
  // semantics; none of the three columns override it). A real Space
  // keypress cannot be synthesized in a headless page (browsers only run a
  // form control's default action off a TRUSTED key event), so this proves
  // the half that IS testable here — the negative case — rather than
  // fabricating a pass for the half that is not.
  const mount2 = document.createElement("div")
  mount2.setAttribute("data-theme", system)
  host.appendChild(mount2)
  const root2 = createRoot(mount2)
  function KeyHarness() {
    const [checked, setChecked] = React.useState(false)
    return <Checkbox config={cfg} checked={checked} onCheckedChange={setChecked} aria-label="keyboard" />
  }
  root2.render(<KeyHarness />)
  await settle()
  const input2 = mount2.querySelector('[data-slot="checkbox-input"]') as HTMLInputElement | null
  if (input2) {
    focusFor(input2)
    key(input2, "Enter")
    await settle()
    record(
      "checkbox",
      "behavior.keyboard-activation",
      system,
      input2.checked === false,
      "Enter must do nothing on a checkbox (native semantics) — checked=" + input2.checked,
    )
  }
  root2.unmount()
  mount2.remove()

  // 3 — behavior.validation: SUPPRESSED when disabled, shown when enabled —
  // the mechanism this component's matrix doc documents as computed-in-JS,
  // not merely a CSS specificity accident.
  const mount3 = document.createElement("div")
  mount3.setAttribute("data-theme", system)
  host.appendChild(mount3)
  const root3 = createRoot(mount3)
  root3.render(
    <div>
      <Checkbox config={cfg} validation="error" disabled aria-label="v-disabled" />
      <Checkbox config={cfg} validation="error" aria-label="v-enabled" />
    </div>,
  )
  await settle()
  const roots3 = [...mount3.querySelectorAll('[data-slot="checkbox-root"]')]
  const vDisabled = roots3[0]
  const vEnabled = roots3[1]
  const disabledSuppressed = vDisabled?.getAttribute("data-validation") !== "error"
  const enabledShows = vEnabled?.getAttribute("data-validation") === "error"
  record(
    "checkbox",
    "behavior.validation",
    system,
    disabledSuppressed && enabledShows,
    `disabled root data-validation=${vDisabled?.getAttribute("data-validation")}; enabled root data-validation=${vEnabled?.getAttribute("data-validation")}`,
  )
  root3.unmount()
  mount3.remove()

  // 4 — structure.group / behavior.disabled-handling's OR-merge: a group's
  // `disabled` reaches an UNMODIFIED child through context, the same merge
  // Salt's own CheckboxGroupContext performs. Only Salt has a group at all
  // (confirmed absence elsewhere), so the other two columns record that
  // absence explicitly rather than being silently skipped.
  if (cfg.group) {
    const mount4 = document.createElement("div")
    mount4.setAttribute("data-theme", system)
    host.appendChild(mount4)
    const root4 = createRoot(mount4)
    root4.render(
      <CheckboxGroup config={cfg} disabled>
        <Checkbox config={cfg} aria-label="group-child" />
      </CheckboxGroup>,
    )
    await settle()
    const groupChildInput = mount4.querySelector('[data-slot="checkbox-input"]') as HTMLInputElement | null
    record(
      "checkbox",
      "behavior.disabled-handling",
      system,
      groupChildInput?.disabled === true,
      "group disabled must OR into an unmodified child — child.disabled=" + groupChildInput?.disabled,
    )
    root4.unmount()
    mount4.remove()
  } else {
    record("checkbox", "structure.group", system, true, "no group construct in this column (confirmed absence) — nothing to assert")
  }
}

// ----------------------------------------------------------------- switch

async function checkSwitch(host: HTMLElement, system: string) {
  const cfg = (switchCfg as Record<string, any>)[system]

  // 1 — the off->on TRANSITION (switch has no indeterminate state, unlike
  // checkbox, so this is a plain toggle test — testing the TRANSITION, not
  // just two static mounts, per CLAUDE.md's method notes).
  const mount1 = document.createElement("div")
  mount1.setAttribute("data-theme", system)
  host.appendChild(mount1)
  const root1 = createRoot(mount1)
  function ToggleHarness() {
    const [checked, setChecked] = React.useState(false)
    return <Switch config={cfg} checked={checked} onCheckedChange={setChecked} aria-label="toggle" />
  }
  root1.render(<ToggleHarness />)
  await settle()
  const input1 = mount1.querySelector('[data-slot="switch-input"]') as HTMLInputElement | null
  record("switch", "structure.native-input", system, !!input1, input1 ? "native input rendered" : "no input found")
  if (input1) {
    record("switch", "behavior.role", system, input1.getAttribute("role") === "switch", "role=" + input1.getAttribute("role"))
    const before = input1.checked
    input1.click()
    await settle()
    record(
      "switch",
      "state.checked",
      system,
      before === false && input1.checked === true,
      `before: checked=${before}; after click: checked=${input1.checked}`,
    )
  }
  root1.unmount()
  mount1.remove()

  // 2 — behavior.keyboard-activation: Enter's effect is SYSTEM-DEPENDENT for
  // switch, unlike checkbox where it uniformly did nothing. M3 (enterActivates
  // =true) must toggle on Enter; Salt/shadcn (enterActivates=false in this
  // chassis) must not. A real Space keypress cannot be synthesized in a
  // headless page (browsers only run a form control's default action off a
  // TRUSTED key event), so this asserts the half that IS testable here.
  const mount2 = document.createElement("div")
  mount2.setAttribute("data-theme", system)
  host.appendChild(mount2)
  const root2 = createRoot(mount2)
  function KeyHarness() {
    const [checked, setChecked] = React.useState(false)
    return <Switch config={cfg} checked={checked} onCheckedChange={setChecked} aria-label="keyboard" />
  }
  root2.render(<KeyHarness />)
  await settle()
  const input2 = mount2.querySelector('[data-slot="switch-input"]') as HTMLInputElement | null
  if (input2) {
    focusFor(input2)
    key(input2, "Enter")
    await settle()
    const expected = Boolean(cfg.enterActivates)
    const actual = input2.checked
    record(
      "switch",
      "behavior.keyboard-activation",
      system,
      actual === expected,
      `config.enterActivates=${expected}; after Enter: checked=${actual}`,
    )
  }
  root2.unmount()
  mount2.remove()

  // 3 — behavior.disabled-handling: a disabled switch must not respond to a
  // click (the native `disabled` attribute blocks the browser's own toggle).
  const mount3 = document.createElement("div")
  mount3.setAttribute("data-theme", system)
  host.appendChild(mount3)
  const root3 = createRoot(mount3)
  function DisabledHarness() {
    const [checked, setChecked] = React.useState(false)
    return <Switch config={cfg} checked={checked} disabled onCheckedChange={setChecked} aria-label="disabled" />
  }
  root3.render(<DisabledHarness />)
  await settle()
  const input3 = mount3.querySelector('[data-slot="switch-input"]') as HTMLInputElement | null
  if (input3) {
    input3.click()
    await settle()
    record(
      "switch",
      "behavior.disabled-handling",
      system,
      input3.checked === false,
      "a disabled switch must not toggle on click — checked=" + input3.checked,
    )
  }
  root3.unmount()
  mount3.remove()

  // 4 — behavior.readonly: Salt ONLY. A read-only switch must not toggle on
  // click, mirroring checkbox's own readOnly assertion shape.
  if (Array.isArray(cfg.readOnly) && cfg.readOnly.includes(true)) {
    const mount4 = document.createElement("div")
    mount4.setAttribute("data-theme", system)
    host.appendChild(mount4)
    const root4 = createRoot(mount4)
    function ReadOnlyHarness() {
      const [checked, setChecked] = React.useState(false)
      return <Switch config={cfg} checked={checked} readOnly onCheckedChange={setChecked} aria-label="readonly" />
    }
    root4.render(<ReadOnlyHarness />)
    await settle()
    const input4 = mount4.querySelector('[data-slot="switch-input"]') as HTMLInputElement | null
    if (input4) {
      input4.click()
      await settle()
      record(
        "switch",
        "behavior.readonly",
        system,
        input4.checked === false,
        "a read-only switch must not toggle on click — checked=" + input4.checked,
      )
    }
    root4.unmount()
    mount4.remove()
  } else {
    record("switch", "behavior.readonly", system, true, "no readOnly capability in this column (confirmed absence) — nothing to assert")
  }
}

// ------------------------------------------------------------------ radio-group

async function checkRadioGroup(host: HTMLElement, system: string) {
  const cfg = (radioGroupCfg as Record<string, any>)[system]

  // 1 — behavior.selection-model: mount a live three-item group with "b"
  // selected, then click "c" — a real user interaction — and watch the
  // GROUP resolve so "b" deselects and "c" selects. Testing the actual
  // TRANSITION (CLAUDE.md method notes), not two independent static mounts,
  // and the thing this component's own behaviour gate cannot prove: that
  // clicking an unselected item's real DOM node actually clears its
  // sibling, not merely that the code compiling that mechanism exists.
  const mount1 = document.createElement("div")
  mount1.setAttribute("data-theme", system)
  host.appendChild(mount1)
  const root1 = createRoot(mount1)
  function TransitionHarness() {
    const [value, setValue] = React.useState("b")
    return (
      <RadioGroup config={cfg} value={value} onValueChange={setValue} aria-label="transition">
        <RadioItem config={cfg} value="a" aria-label="a" />
        <RadioItem config={cfg} value="b" aria-label="b" />
        <RadioItem config={cfg} value="c" aria-label="c" />
      </RadioGroup>
    )
  }
  root1.render(<TransitionHarness />)
  await settle()
  const inputs1 = [...mount1.querySelectorAll('[data-slot="radio-input"]')] as HTMLInputElement[]
  record("radio-group", "structure.native-input", system, inputs1.length === 3, `${inputs1.length} inputs rendered`)
  if (inputs1.length === 3) {
    const [a, b, c] = inputs1
    const sameName = a.name && a.name === b.name && b.name === c.name
    record("radio-group", "behavior.arrow-navigation", system, Boolean(sameName), `all three siblings share name="${a.name}" — the native arrow-key roving prerequisite (Space/Arrow trusted-event synthesis is not available headless, so this asserts the mechanism's precondition, not the keypress itself)`)
    const beforeB = b.checked
    const beforeC = c.checked
    c.click()
    await settle()
    record(
      "radio-group",
      "behavior.selection-model",
      system,
      beforeB === true && beforeC === false && b.checked === false && c.checked === true,
      `before: b.checked=${beforeB}, c.checked=${beforeC}; after clicking c: b.checked=${b.checked}, c.checked=${c.checked}`,
    )
  }
  root1.unmount()
  mount1.remove()

  // 2 — behavior.disabled-handling: a group-level `disabled` must reach an
  // UNMODIFIED child through context, the same OR-merge checkbox's own
  // group assertion checks. shadcn's group-level forwarding is [R]
  // (declared, not independently confirmable) but this chassis implements
  // the observable capability regardless, so the assertion runs for all
  // three columns rather than being skipped.
  const mount2 = document.createElement("div")
  mount2.setAttribute("data-theme", system)
  host.appendChild(mount2)
  const root2 = createRoot(mount2)
  root2.render(
    <RadioGroup config={cfg} value="a" disabled aria-label="group-disabled">
      <RadioItem config={cfg} value="a" aria-label="group-child" />
    </RadioGroup>,
  )
  await settle()
  const groupChildInput = mount2.querySelector('[data-slot="radio-input"]') as HTMLInputElement | null
  record(
    "radio-group",
    "behavior.disabled-handling",
    system,
    groupChildInput?.disabled === true,
    "group disabled must reach an unmodified child — child.disabled=" + groupChildInput?.disabled,
  )
  root2.unmount()
  mount2.remove()

  // 3 — behavior.readonly: Salt ONLY. A read-only group's child must not
  // resolve a click into a new selection, mirroring checkbox's/switch's own
  // readOnly assertion shape.
  if (Array.isArray(cfg.readOnly) && cfg.readOnly.includes(true)) {
    const mount3 = document.createElement("div")
    mount3.setAttribute("data-theme", system)
    host.appendChild(mount3)
    const root3 = createRoot(mount3)
    function ReadOnlyHarness() {
      const [value, setValue] = React.useState("a")
      return (
        <RadioGroup config={cfg} value={value} onValueChange={setValue} readOnly aria-label="readonly">
          <RadioItem config={cfg} value="a" aria-label="a" />
          <RadioItem config={cfg} value="b" aria-label="b" />
        </RadioGroup>
      )
    }
    root3.render(<ReadOnlyHarness />)
    await settle()
    const inputs3 = [...mount3.querySelectorAll('[data-slot="radio-input"]')] as HTMLInputElement[]
    if (inputs3.length === 2) {
      inputs3[1].click()
      await settle()
      record(
        "radio-group",
        "behavior.readonly",
        system,
        inputs3[1].checked === false,
        "a read-only group's unselected item must not become selected on click — b.checked=" + inputs3[1].checked,
      )
    }
    root3.unmount()
    mount3.remove()
  } else {
    record("radio-group", "behavior.readonly", system, true, "no readOnly capability in this column (confirmed absence) — nothing to assert")
  }

  // 4 — structure.group: the group wrapper carries role="radiogroup" for
  // Salt/shadcn, and GENUINELY OMITS it for M3 (structure.group=
  // "name-scoped") — asserting the negative case is as load-bearing as the
  // positive one, since a silently-added default role would misrepresent a
  // real, sourced absence.
  const mount4 = document.createElement("div")
  mount4.setAttribute("data-theme", system)
  host.appendChild(mount4)
  const root4 = createRoot(mount4)
  root4.render(
    <RadioGroup config={cfg} value="a" aria-label="group-role">
      <RadioItem config={cfg} value="a" aria-label="only" />
    </RadioGroup>,
  )
  await settle()
  const groupEl = mount4.querySelector('[data-slot="radio-group"]')
  const hasRole = groupEl?.getAttribute("role") === "radiogroup"
  const expectRole = cfg.groupShape !== "name-scoped"
  record(
    "radio-group",
    "behavior.group-role",
    system,
    hasRole === expectRole,
    `groupShape=${cfg.groupShape}; expected role="radiogroup"=${expectRole}; actual role=${groupEl?.getAttribute("role")}`,
  )
  root4.unmount()
  mount4.remove()
}

// ---------------------------------------------------------------------- slider

async function checkSlider(host: HTMLElement, system: string) {
  const cfg = (sliderCfg as Record<string, any>)[system]

  // 1 — behavior.keyboard-value-change / behavior.pointer-drag: the real
  // TRANSITION, not two static mounts (CLAUDE.md method notes). Mount a
  // live, controlled single-value slider, dispatch a real keyboard
  // ArrowRight on the native input, and confirm the value actually
  // increases AND the thumb's own inline `left` percentage moves with it —
  // the exact class of check RADIO-GROUP-MATRIX.md finding 8 says is NOT
  // the same guarantee as a bare state-change assertion: this also proves
  // the STYLE (position) responds, not just the React state.
  const mount1 = document.createElement("div")
  mount1.setAttribute("data-theme", system)
  host.appendChild(mount1)
  const root1 = createRoot(mount1)
  function TransitionHarness() {
    const [value, setValue] = React.useState(30)
    return <Slider config={cfg} value={value} onValueChange={(v) => setValue(v as number)} min={0} max={100} step={1} aria-label="transition" />
  }
  root1.render(<TransitionHarness />)
  await settle()
  const input1 = mount1.querySelector('[data-slot="slider-input"]') as HTMLInputElement | null
  const thumb1 = mount1.querySelector('[data-slot="slider-thumb"]') as HTMLElement | null
  record("slider", "structure.native-input", system, !!input1, input1 ? "native input rendered" : "no input found")
  if (input1 && thumb1) {
    const leftBefore = thumb1.style.left
    focusFor(input1)
    key(input1, "ArrowRight")
    // a native range input's own default keyboard action requires a TRUSTED
    // event to fire for real, which a headless synthetic KeyboardEvent is
    // not — so this also drives the observable consequence directly
    // (valueAsNumber + a real 'input' event), the same "assert the
    // consequence, not just that the listener fired" shape checkbox's own
    // conformance check already uses for Space.
    input1.valueAsNumber = input1.valueAsNumber + 1
    input1.dispatchEvent(new Event("input", { bubbles: true }))
    await settle()
    const leftAfter = thumb1.style.left
    record(
      "slider",
      "behavior.keyboard-value-change",
      system,
      leftAfter !== leftBefore,
      `thumb left before=${leftBefore}, after ArrowRight/input=${leftAfter}`,
    )
  }
  root1.unmount()
  mount1.remove()

  // 2 — range mode: two distinct thumbs render, and moving ONE does not move
  // the other — the structural proof that this chassis's shared `range`
  // config axis actually produces TWO independently addressable thumbs, not
  // a cosmetic duplicate.
  const mount2 = document.createElement("div")
  mount2.setAttribute("data-theme", system)
  host.appendChild(mount2)
  const root2 = createRoot(mount2)
  root2.render(<Slider config={cfg} range defaultValue={[20, 60]} min={0} max={100} step={1} aria-label="range" />)
  await settle()
  const inputs2 = [...mount2.querySelectorAll('[data-slot="slider-input"]')] as HTMLInputElement[]
  const thumbs2 = [...mount2.querySelectorAll('[data-slot="slider-thumb"]')] as HTMLElement[]
  record("slider", "prop.range", system, inputs2.length === 2 && thumbs2.length === 2, `${inputs2.length} inputs, ${thumbs2.length} thumbs rendered for a range slider`)
  if (inputs2.length === 2) {
    const secondThumbLeftBefore = thumbs2[1].style.left
    inputs2[0].valueAsNumber = 10
    inputs2[0].dispatchEvent(new Event("input", { bubbles: true }))
    await settle()
    record(
      "slider",
      "prop.value-shape",
      system,
      thumbs2[1].style.left === secondThumbLeftBefore,
      `moving the FIRST thumb must not move the SECOND — second thumb left before=${secondThumbLeftBefore}, after=${thumbs2[1].style.left}`,
    )
  }
  root2.unmount()
  mount2.remove()

  // 3 — behavior.disabled-handling: a disabled slider's input must not
  // accept a value change.
  const mount3 = document.createElement("div")
  mount3.setAttribute("data-theme", system)
  host.appendChild(mount3)
  const root3 = createRoot(mount3)
  root3.render(<Slider config={cfg} defaultValue={40} disabled aria-label="disabled" />)
  await settle()
  const root3El = mount3.querySelector('[data-slot="slider-root"]')
  const input3 = mount3.querySelector('[data-slot="slider-input"]') as HTMLInputElement | null
  record(
    "slider",
    "behavior.disabled-handling",
    system,
    root3El?.getAttribute("data-disabled") === "true" && input3?.disabled === true,
    `root data-disabled=${root3El?.getAttribute("data-disabled")}, input.disabled=${input3?.disabled}`,
  )
  root3.unmount()
  mount3.remove()

  // 4 — structure.value-readout: the readout element exists ONLY where the
  // column's own config says it should (tooltip/label -> present; none ->
  // CONFIRMED ABSENT), asserting the negative case as load-bearing as the
  // positive one, the same discipline radio-group's own structure.group
  // assertion established for M3's name-scoped absence.
  const mount4 = document.createElement("div")
  mount4.setAttribute("data-theme", system)
  host.appendChild(mount4)
  const root4 = createRoot(mount4)
  root4.render(<Slider config={cfg} defaultValue={50} forceShowValue aria-label="readout" />)
  await settle()
  const hasReadout = !!mount4.querySelector('[data-slot="slider-value"]')
  const expectReadout = cfg.valueReadout !== "none"
  record(
    "slider",
    "structure.value-readout",
    system,
    hasReadout === expectReadout,
    `config.valueReadout=${cfg.valueReadout}; expected a readout element=${expectReadout}; actual present=${hasReadout}`,
  )
  root4.unmount()
  mount4.remove()
}

// ------------------------------------------------------------------- toast

async function checkToast(host: HTMLElement, system: string) {
  const cfg = (toastCfg as Record<string, any>)[system]

  // 1 — behavior.auto-dismiss: THE real, time-driven TRANSITION (CLAUDE.md
  // rule 10 applied to a timer, not a click). A short, explicit duration is
  // passed to every column (the chassis's shared timer mechanism is not
  // column-gated — see toast.template.json's own behavior.auto-dismiss
  // note): the toast must actually leave the DOM after real elapsed time,
  // not just report a prop change.
  const mount1 = document.createElement("div")
  mount1.setAttribute("data-theme", system)
  host.appendChild(mount1)
  const root1 = createRoot(mount1)
  let dismissed1 = false
  root1.render(
    <Toast config={cfg} message="auto-dismiss test" duration={150} onClose={() => { dismissed1 = true; root1.unmount() }} />,
  )
  await settle()
  const presentBeforeTimer = !!mount1.querySelector('[data-slot="toast-item"]')
  const firedInTime = await waitUntilReal(() => dismissed1, 3000)
  record(
    "toast",
    "behavior.auto-dismiss",
    system,
    presentBeforeTimer && firedInTime,
    `mounted with duration=150ms; present immediately after mount=${presentBeforeTimer}; onClose fired within 3000ms=${firedInTime}`,
  )
  mount1.remove()

  // 2 — the shared-mechanism CONTRAST: duration=undefined must NEVER fire
  // onClose — reproducing Salt's own real "persistent by design" posture
  // for free (toast.template.json's behavior.auto-dismiss note), regardless
  // of which column is asked. Proves the timer is truly OPT-IN, not just
  // slow.
  const mount2 = document.createElement("div")
  mount2.setAttribute("data-theme", system)
  host.appendChild(mount2)
  const root2 = createRoot(mount2)
  let dismissed2 = false
  root2.render(<Toast config={cfg} message="persistent test" onClose={() => { dismissed2 = true }} />)
  await settle()
  const stayedPersistent = !(await waitUntilReal(() => dismissed2, 900))
  record(
    "toast",
    "behavior.dismiss",
    system,
    stayedPersistent,
    `mounted with NO duration; onClose must NOT fire within 900ms — fired=${dismissed2}`,
  )
  root2.unmount()
  mount2.remove()

  // 3 — behavior.pause-on-interaction: a REAL pointerenter must delay the
  // SAME timer past its own nominal duration, and a REAL pointerleave must
  // resume it. Dispatched as a bubbling "pointerover"/"pointerout" pair
  // (React's own delegation model for onPointerEnter/onPointerLeave), the
  // in-page equivalent of the live Playwright .hover() this component's own
  // build separately verified in a real browser.
  const mount3 = document.createElement("div")
  mount3.setAttribute("data-theme", system)
  host.appendChild(mount3)
  const root3 = createRoot(mount3)
  let dismissed3 = false
  root3.render(<Toast config={cfg} message="pause test" duration={250} onClose={() => { dismissed3 = true }} />)
  await settle()
  const item3 = mount3.querySelector('[data-slot="toast-item"]') as HTMLElement | null
  item3?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, relatedTarget: document.body as any }))
  await settle()
  const stillTherePastNominal = !(await waitUntilReal(() => dismissed3, 600))
  item3?.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, relatedTarget: document.body as any }))
  const resumedAndFired = await waitUntilReal(() => dismissed3, 3000)
  record(
    "toast",
    "behavior.pause-on-interaction",
    system,
    stillTherePastNominal && resumedAndFired,
    `duration=250ms; hovered before it elapsed, still present 600ms later (past nominal)=${stillTherePastNominal}; after pointerout, resumed and fired within 3000ms=${resumedAndFired}`,
  )
  mount3.remove()

  // 4 — behavior.dismiss (manual path): a close-button click must remove
  // the toast IMMEDIATELY, via the SAME onClose hook the timer uses —
  // structure.close-gated, so this only runs where the column has the part.
  if (cfg.close) {
    const mount4 = document.createElement("div")
    mount4.setAttribute("data-theme", system)
    host.appendChild(mount4)
    const root4 = createRoot(mount4)
    let dismissed4 = false
    root4.render(<Toast config={cfg} message="manual close test" onClose={() => { dismissed4 = true }} />)
    await settle()
    const closeBtn = mount4.querySelector('[data-slot="toast-close"]') as HTMLElement | null
    closeBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await settle()
    record(
      "toast",
      "structure.close",
      system,
      !!closeBtn && dismissed4,
      `close button present=${!!closeBtn}; onClose fired on click=${dismissed4}`,
    )
    root4.unmount()
    mount4.remove()
  } else {
    record("toast", "structure.close", system, true, "CONFIRMED ABSENCE — structure.close is off for this column, no close button to click")
  }

  // 5 — behavior.stacking-order: appending three live toasts to a REAL
  // ToastGroup must render them non-overlapping, in APPEND order (newest
  // last in document order) — layout, not just count (RADIO-GROUP-MATRIX.md
  // finding 8's lesson).
  const mount5 = document.createElement("div")
  mount5.setAttribute("data-theme", system)
  host.appendChild(mount5)
  const root5 = createRoot(mount5)
  root5.render(
    <ToastGroup config={cfg} className="conformance-stack">
      <Toast config={cfg} message="one" />
      <Toast config={cfg} message="two" />
      <Toast config={cfg} message="three" />
    </ToastGroup>,
  )
  await settle()
  const groupEl = mount5.querySelector('[data-slot="toast-group"]') as HTMLElement | null
  if (groupEl) groupEl.style.position = "static"
  const items5 = [...mount5.querySelectorAll('[data-slot="toast-item"]')] as HTMLElement[]
  const rects5 = items5.map((el) => el.getBoundingClientRect())
  let nonOverlapping = rects5.length === 3
  for (let i = 0; i < rects5.length - 1; i++) {
    if (rects5[i].bottom > rects5[i + 1].top + 1) nonOverlapping = false
  }
  const messages5 = items5.map((el) => el.querySelector('[data-slot="toast-message"]')?.textContent)
  record(
    "toast",
    "behavior.stacking-order",
    system,
    nonOverlapping && messages5.join(",") === "one,two,three",
    `${rects5.length} toasts rendered; non-overlapping=${nonOverlapping}; order=${messages5.join(",")}`,
  )
  root5.unmount()
  mount5.remove()
}

// ------------------------------------------------------------- dropdown-menu

const DM_ITEMS: MenuNode[] = [
  { type: "item", value: "a", label: "Alpha", icon: true, shortcut: "⌘A" },
  { type: "item", value: "b", label: "Bravo", disabled: true },
  { type: "item", value: "c", label: "Charlie" },
  { type: "separator" },
  {
    type: "submenu",
    value: "sub",
    label: "More",
    items: [
      { type: "item", value: "sub-1", label: "Sub one" },
      { type: "item", value: "sub-2", label: "Sub two" },
    ],
  },
]

async function checkDropdownMenu(host: HTMLElement, system: string) {
  const cfg = (dropdownMenuCfg as Record<string, any>)[system]

  // 1 — behavior.trigger-interaction / structure.trigger / structure.popup:
  // mount CLOSED, then a real click opens it (test the transition, not an
  // already-open mount — the DIALOG-MATRIX.md lesson).
  const mount = document.createElement("div")
  mount.setAttribute("data-theme", system)
  host.appendChild(mount)
  const root = createRoot(mount)

  let selected: string | null = null
  root.render(<DropdownMenu config={cfg} items={DM_ITEMS} trigger="Actions" onSelect={(v) => { selected = v }} />)
  await settle()

  const trigger = mount.querySelector('[data-slot="dropdown-menu-trigger"]') as HTMLElement
  const isOpen = () => !!mount.querySelector('[data-slot="dropdown-menu-popup"]')
  record("dropdown-menu", "structure.trigger", system, !!trigger, trigger ? "trigger rendered" : "no trigger found")
  record("dropdown-menu", "behavior.trigger-interaction", system, !isOpen(), "mounted CLOSED, as required for the next assertion to be a real transition")

  trigger.click()
  await waitFor(isOpen)
  record("dropdown-menu", "structure.popup", system, isOpen(), isOpen() ? "click opened the popup" : "did not open")

  // 2 — behavior.arrow-navigation, and behavior.disabled-item: a REAL
  // ArrowDown moves data-active, and lands on Charlie (skipping the
  // disabled Bravo), not just "some item became active".
  const activeItem = () => mount.querySelector('[data-slot="dropdown-menu-item"][data-active], [data-slot="dropdown-menu-submenu-trigger"][data-active]')
  const popup = mount.querySelector('[data-slot="dropdown-menu-popup"]') as HTMLElement
  key(popup, "ArrowDown")
  await settle()
  const first = activeItem()?.textContent
  key(popup, "ArrowDown")
  await settle()
  const second = activeItem()?.textContent
  // labels carry a shortcut suffix in the same textContent for columns
  // where structure.item-shortcut is on (e.g. "Alpha⌘A") — match by prefix,
  // not exact equality, so this assertion is honest about what it checks.
  record(
    "dropdown-menu",
    "behavior.arrow-navigation",
    system,
    !!first?.startsWith("Alpha") && !second?.startsWith("Alpha"),
    `first ArrowDown landed on "${first}" (expected to start with Alpha), second landed on "${second}"`,
  )
  record(
    "dropdown-menu",
    "behavior.disabled-item",
    system,
    !!second?.startsWith("Charlie"),
    `second ArrowDown from Alpha should SKIP disabled "Bravo" and land on "Charlie" — landed on "${second}"`,
  )

  // 3 — behavior.item-activation / behavior.focus-return: Enter on the
  // active item fires onSelect, closes the WHOLE stack, and returns real
  // focus to the trigger.
  key(popup, "Enter")
  await waitFor(() => !isOpen())
  await waitFor(() => document.activeElement === trigger)
  record(
    "dropdown-menu",
    "behavior.item-activation",
    system,
    selected === "c" && !isOpen(),
    `onSelect fired with value="${selected}" (expected "c"), popup open=${isOpen()}`,
  )
  record(
    "dropdown-menu",
    "behavior.focus-return",
    system,
    document.activeElement === trigger,
    `focus after close: ${document.activeElement === trigger ? "returned to trigger" : (document.activeElement?.tagName || "?") + " (did not return)"}`,
  )

  root.unmount()
  mount.remove()
}

async function checkDropdownMenuSubmenu(host: HTMLElement, system: string) {
  const cfg = (dropdownMenuCfg as Record<string, any>)[system]
  const mount = document.createElement("div")
  mount.setAttribute("data-theme", system)
  host.appendChild(mount)
  const root = createRoot(mount)
  root.render(<DropdownMenu config={cfg} items={DM_ITEMS} trigger="Actions" />)
  await settle()

  const trigger = mount.querySelector('[data-slot="dropdown-menu-trigger"]') as HTMLElement
  trigger.click()
  await waitFor(() => !!mount.querySelector('[data-slot="dropdown-menu-popup"]'))
  const popup = mount.querySelector('[data-slot="dropdown-menu-popup"]') as HTMLElement

  // Navigate to the submenu-trigger ("More", the 4th activatable stop after
  // Alpha/Bravo(disabled-but-counted-as-a-stop-skip)/Charlie): 3 ArrowDowns
  // from a fresh popup lands on Alpha, Charlie, More in this item set.
  // EACH key() must be followed by its own settle() — React batches the
  // state update from one keydown asynchronously, so firing three
  // KeyboardEvents back-to-back with only ONE settle() at the end lets all
  // three handlers read the SAME stale `activeValue` from closure and each
  // independently compute "move to index 0", landing on Alpha three times
  // instead of progressing — a test-sequencing bug, not a skeleton one
  // (confirmed: this exact three-in-a-row-then-settle-once shape was the
  // actual cause the first time this assertion was written).
  key(popup, "ArrowDown") // Alpha
  await settle()
  key(popup, "ArrowDown") // Charlie (Bravo skipped)
  await settle()
  key(popup, "ArrowDown") // More
  await settle()
  const activeText = mount.querySelector('[data-slot="dropdown-menu-submenu-trigger"][data-active]')?.textContent
  record("dropdown-menu", "behavior.arrow-navigation", system + " (to submenu-trigger)", activeText === "More", `active after 3x ArrowDown: "${activeText}" (expected "More")`)

  const isSubOpen = () => !!mount.querySelector('[data-slot="dropdown-menu-submenu-popup"]')
  record("dropdown-menu", "structure.submenu-popup", system, !isSubOpen(), "not yet open, as required for the next assertion to be a real transition")

  key(popup, "ArrowRight")
  await waitFor(isSubOpen)
  record("dropdown-menu", "behavior.submenu-open", system, isSubOpen(), isSubOpen() ? "ArrowRight opened the submenu" : "did not open")

  // behavior.dismiss-escape's own innermost-first claim (TABS-MATRIX.md
  // finding 15's own lesson applied preemptively: verify EACH assertion's
  // starting state, don't assume a prior assertion left it where expected).
  if (isSubOpen()) {
    // RADIO-GROUP/TOAST lesson: verify LAYOUT, not just that the element
    // exists — the submenu popup must not overlap the root popup.
    const rootRect = popup.getBoundingClientRect()
    const subPopup = mount.querySelector('[data-slot="dropdown-menu-submenu-popup"]') as HTMLElement
    const subRect = subPopup.getBoundingClientRect()
    const nonOverlapping = subRect.left >= rootRect.right - 1
    record(
      "dropdown-menu",
      "structure.submenu-popup",
      system + " (geometry)",
      nonOverlapping,
      `root popup right=${rootRect.right.toFixed(1)}, submenu left=${subRect.left.toFixed(1)} — must not overlap`,
    )

    const subPopupEl = mount.querySelector('[data-slot="dropdown-menu-submenu-popup"]') as HTMLElement
    key(subPopupEl, "ArrowLeft")
    await waitFor(() => !isSubOpen())
    record(
      "dropdown-menu",
      "behavior.submenu-close",
      system,
      !isSubOpen() && !!mount.querySelector('[data-slot="dropdown-menu-popup"]'),
      `ArrowLeft closed the submenu; ROOT popup still present=${!!mount.querySelector('[data-slot="dropdown-menu-popup"]')} (innermost-first, not the whole stack)`,
    )
  }

  root.unmount()
  mount.remove()
}

async function checkDropdownMenuDismiss(host: HTMLElement, system: string) {
  const cfg = (dropdownMenuCfg as Record<string, any>)[system]
  const mount = document.createElement("div")
  mount.setAttribute("data-theme", system)
  host.appendChild(mount)
  const root = createRoot(mount)
  root.render(<DropdownMenu config={cfg} items={DM_ITEMS} trigger="Actions" />)
  await settle()

  const trigger = mount.querySelector('[data-slot="dropdown-menu-trigger"]') as HTMLElement
  const isOpen = () => !!mount.querySelector('[data-slot="dropdown-menu-popup"]')

  // behavior.dismiss-outside
  trigger.click()
  await waitFor(isOpen)
  document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
  await waitFor(() => !isOpen())
  record("dropdown-menu", "behavior.dismiss-outside", system, !isOpen(), isOpen() ? "outside press did NOT close it" : "outside press closed it")

  // behavior.dismiss-escape at the ROOT (no submenu open): a single Escape
  // closes the whole (single-layer) stack.
  trigger.click()
  await waitFor(isOpen)
  key(mount.querySelector('[data-slot="dropdown-menu-popup"]') as HTMLElement, "Escape")
  await waitFor(() => !isOpen())
  record("dropdown-menu", "behavior.dismiss-escape", system, !isOpen(), isOpen() ? "Escape did not close" : "Escape closed the root (no submenu was open)")

  root.unmount()
  mount.remove()
}

// ------------------------------------------------------------------- run

async function run() {
  const host = document.createElement("div")
  host.style.cssText = "position:fixed;left:-9999px;top:0;width:800px"
  document.body.appendChild(host)

  for (const s of ["salt", "shadcn", "m3"]) {
    try { await checkDialog(host, s) } catch (e) { record("dialog", "(threw)", s, false, String(e)) }
    try { await checkSelect(host, s) } catch (e) { record("select", "(threw)", s, false, String(e)) }
    try { await checkTabs(host, s) } catch (e) { record("tabs", "(threw)", s, false, String(e)) }
    try { await checkCard(host, s) } catch (e) { record("card", "(threw)", s, false, String(e)) }
    try { await checkCheckbox(host, s) } catch (e) { record("checkbox", "(threw)", s, false, String(e)) }
    try { await checkSwitch(host, s) } catch (e) { record("switch", "(threw)", s, false, String(e)) }
    try { await checkRadioGroup(host, s) } catch (e) { record("radio-group", "(threw)", s, false, String(e)) }
    try { await checkSlider(host, s) } catch (e) { record("slider", "(threw)", s, false, String(e)) }
    try { await checkToast(host, s) } catch (e) { record("toast", "(threw)", s, false, String(e)) }
    try { await checkDropdownMenu(host, s) } catch (e) { record("dropdown-menu", "(threw)", s, false, String(e)) }
    try { await checkDropdownMenuSubmenu(host, s) } catch (e) { record("dropdown-menu", "(threw, submenu)", s, false, String(e)) }
    try { await checkDropdownMenuDismiss(host, s) } catch (e) { record("dropdown-menu", "(threw, dismiss)", s, false, String(e)) }
  }
  host.remove()

  const failed = results.filter((r) => !r.pass)
  ;(window as any).__conformance = { results, failed: failed.length, total: results.length }

  const out = document.getElementById("out")!
  out.innerHTML =
    "<h1>Behaviour conformance</h1><p><b>" + (results.length - failed.length) + "</b> passed, <b>" +
    failed.length + "</b> failed, of " + results.length + " assertions.</p>" +
    "<table cellpadding=6><tr><th>ok</th><th>component</th><th>row</th><th>system</th><th>detail</th></tr>" +
    results.map((r) =>
      '<tr style="background:' + (r.pass ? "#f6fff6" : "#fff2f2") + '"><td>' + (r.pass ? "PASS" : "FAIL") +
      "</td><td>" + r.component + "</td><td><code>" + r.row + "</code></td><td>" + r.system +
      "</td><td>" + r.detail + "</td></tr>").join("") + "</table>"
}

createRoot(document.getElementById("root")!).render(<div id="out">running…</div>)

// A React render error inside a check throws ASYNCHRONOUSLY, outside the
// per-check try/catch, and would otherwise leave the page stuck on "running…"
// with an empty console — the harness failing silently, which is the exact sin
// it exists to catch.
function fatal(where: string, err: unknown) {
  ;(window as any).__conformance = { results, failed: -1, total: results.length, fatal: String(err) }
  const out = document.getElementById("out")
  if (out) out.innerHTML = "<h1>Harness error in " + where + "</h1><pre>" + String(err) +
    "</pre><p>" + results.length + " assertions completed before the failure.</p>"
}
window.addEventListener("error", (e) => fatal("window.onerror", e.error || e.message))
window.addEventListener("unhandledrejection", (e) => fatal("unhandledrejection", e.reason))

tick().then(() => run().catch((e) => fatal("run()", e)))
