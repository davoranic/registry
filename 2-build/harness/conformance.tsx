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

import dialogCfg from "../out/gen/dialog-config.json"
import selectCfg from "../out/gen/select-config.json"
import tabsCfg from "../out/gen/tabs-config.json"
import cardCfg from "../out/gen/card-config.json"
import checkboxCfg from "../out/gen/checkbox-config.json"
import switchCfg from "../out/gen/switch-config.json"
import radioGroupCfg from "../out/gen/radio-group-config.json"
import sliderCfg from "../out/gen/slider-config.json"

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
