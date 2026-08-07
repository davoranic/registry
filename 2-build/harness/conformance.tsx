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

import dialogCfg from "../out/gen/dialog-config.json"
import selectCfg from "../out/gen/select-config.json"
import tabsCfg from "../out/gen/tabs-config.json"
import cardCfg from "../out/gen/card-config.json"

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
