/* Phase-2 validation harness for Card — same purpose as
   tabs-check.tsx / dialog-check.tsx / select-check.tsx: render the
   generated CSS on the real skeleton and let the values be checked
   against each DS's own reference before moving on. Not the final
   registry page.

   Every declared axis gets a control here, because ALERT-MATRIX.md
   finding 10 was found by clicking one. The controls are:
     - mode (all themes)
     - density (Salt only — the only system with the capability)
     - variant: elevated / filled / outlined (M3 only) — THREE MECHANISMS,
       and the point of the stage is that switching it changes what
       separates the surface from the page, not merely its colour
     - containerTone: primary / secondary / tertiary / ghost (Salt only) —
       a tone ladder, deliberately a different axis from M3's variant.
       `ghost` is the one that inverts by mode, so the stages sit on a
       plain page rather than on a card-coloured one
     - interaction: static / button / link (Salt), static / button (M3) —
       shadcn is single-valued and gets no control, which is itself the
       finding
     - accent on/off and its placement (Salt only)
     - hoverable (Salt only — a decorative hover with no role and no tab
       stop, which no other system has)

   FOUR STAGES PER THEME, each chosen to make an invisible divergence
   visible:
     1. SECTIONED — media + header(title/description/action) + content +
        footer. Shows the sectioning fork directly: Salt hands its padding
        to the sections and collapses the gaps to ZERO, shadcn keeps its
        block padding and puts a real 24px gap between every child, M3 has
        no sections at all and renders one padded box.
     2. BARE — no sections, just content. A Salt card pads itself; a
        shadcn card has NO horizontal padding here at all, so its text
        sits flush to the border. That is source, not a bug.
     3. DISABLED — only where prop.disabled is on (Salt, M3). shadcn's
        stage says so instead of rendering a fake.
     4. GROUP — Salt only. Three interactable cards, the middle one
        disabled, in single- or multi-select mode. Arrow across it: single
        select MOVES AND SELECTS in one step and steps over the disabled
        card; multi-select does not arrow at all — Tab walks it and Space
        toggles. Neither is visible in a screenshot, which is why
        scripts/check-card-behavior.mjs exists alongside this page.

   A LINK CARD IS ALWAYS RENDERED WITH A FOCUSABLE CHILD INSIDE IT where
   the column has one, because behavior.nested-interactive is the row with
   the real accessibility consequence: Salt's own docs say a link card
   "shouldn't contain actionable components", and the chassis publishes
   data-nested-interactive + data-has-focusable so the conflict is
   inspectable in the DOM rather than only described in prose.

   HARNESS-ONLY TYPOGRAPHY, DECLARED. docs/CARD-MATRIX.md finding 1: card
   is the first component in this registry where NO system declares any
   typography — Salt's six card CSS files, shadcn's Card element and M3's
   three token files between them set no font-family, size or weight on
   the surface (shadcn's CardDescription is the single exception, and it
   is a modelled row). The demo text below therefore carries its own
   inline font, which is HARNESS CHROME, not a registry value. Nothing
   about it comes from a column. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Card, CardGroup, type CardConfig } from "../skeleton/card"
import configs from "../out/gen/card-config.json"
import panel from "../out/gen/card-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

const VARIANT_LABEL: Record<string, string> = {
  elevated: "elevated (a level-1 shadow over surface-container-low)",
  filled: "filled (surface-container-highest, no shadow)",
  outlined: "outlined (plain surface + a 1px outline-variant stroke)",
}

const INTERACTION_LABEL: Record<string, Record<string, string>> = {
  salt: {
    static: 'static (Salt: <Card> — no role, no tab stop)',
    button: 'button (Salt: <InteractableCard> — Enter AND Space)',
    link: 'link (Salt: <LinkCard> — a real <a>, Enter only, NO Space)',
  },
  m3: {
    static: "static (M3: the unqualified enabled state)",
    button: "button ([R] role/keys; the state layers and focus ring are [S])",
  },
  shadcn: { static: "static (shadcn: confirmed absence — there is no interactive card)" },
}

/* harness chrome only — see the header note */
const demoType: React.CSSProperties = { font: "400 14px/1.45 system-ui, sans-serif" }
const demoTitle: React.CSSProperties = { font: "600 16px/1.2 system-ui, sans-serif" }

/* DECLARED COMPOSITION — the header action and the footer actions belong
   to the already-built `button`; rendered here as neutral placeholders
   rather than imported, so this component's build stays self-contained
   (the same convention alert.tsx and tabs-check.tsx use). */
function PlaceholderButton({ label, tabbable = true }: { label: string; tabbable?: boolean }) {
  return (
    <button
      type="button"
      tabIndex={tabbable ? undefined : -1}
      style={{
        font: "500 13px/1 system-ui, sans-serif",
        padding: "0.5em 0.9em",
        border: "1px solid currentColor",
        borderRadius: 4,
        background: "none",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

/* A neutral placeholder for consumer media. No system styles card media
   (style.media.box is off in all three columns), so this is a plain block
   — the only thing that acts on it is Salt's own overflow:hidden, which
   clips it to the corner radius while shadcn's does not. */
function PlaceholderMedia() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 96,
        background: "repeating-linear-gradient(135deg, #9ca3af 0 10px, #6b7280 10px 20px)",
      }}
    />
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, CardConfig>)[theme]
  const variants = config.variant ?? []
  const tones = config.containerTone ?? []
  const interactions = config.interaction ?? []
  const placements = config.accentPlacement ?? []
  const selectionModes = config.selectionMode ?? []
  const isSalt = theme === "salt"

  const [variant, setVariant] = React.useState(variants[0])
  const [tone, setTone] = React.useState(tones[0])
  const [interaction, setInteraction] = React.useState(interactions[0])
  const [placement, setPlacement] = React.useState(placements[0])
  const [selectionMode, setSelectionMode] = React.useState(selectionModes[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  /* starts OFF, matching source: Card.tsx applies the accent classes only
     `if (accent)` and sets no default, whatever its own CSS comment and
     InteractableCard's JSDoc claim (prop.accent-placement) */
  const [accent, setAccent] = React.useState(false)
  const [hoverable, setHoverable] = React.useState(false)
  const [groupValue, setGroupValue] = React.useState<string | string[]>(
    selectionModes[0] === "multi" ? [] : "",
  )

  const axes = { variant, containerTone: tone, interaction, accentPlacement: placement, accent, hoverable }

  const commonContent = (
    <>
      <p style={{ ...demoType, margin: 0 }}>
        Review portfolio performance and the market changes that affected this quarter.
      </p>
    </>
  )

  return (
    <figure
      className="stage"
      data-theme={theme}
      data-mode={mode === "dark" ? "dark" : undefined}
      data-density={isSalt ? density : undefined}
    >
      <figcaption>
        {theme} · {mode} · sectioning: {config.sectioning} · state layer:{" "}
        {config.stateLayer ? "on" : "off"} · accent: {config.accent ? "available" : "none"} ·
        interaction: {INTERACTION_LABEL[theme]?.[interaction ?? "static"] ?? interaction}
        <span className="cap-control">
          <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        </span>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => (
              <button key={d} disabled={d === density} onClick={() => setDensity(d)}>
                {d}
              </button>
            ))}
          </span>
        )}
        {variants.length > 1 && (
          <span className="cap-control">
            {variants.map((v) => (
              <button key={v} disabled={v === variant} onClick={() => setVariant(v)}>
                {VARIANT_LABEL[v] ?? v}
              </button>
            ))}
          </span>
        )}
        {tones.length > 1 && (
          <span className="cap-control">
            {tones.map((t) => (
              <button key={t} disabled={t === tone} onClick={() => setTone(t)}>
                tone: {t}
              </button>
            ))}
          </span>
        )}
        {interactions.length > 1 && (
          <span className="cap-control">
            {interactions.map((i) => (
              <button key={i} disabled={i === interaction} onClick={() => setInteraction(i)}>
                {i}
              </button>
            ))}
          </span>
        )}
        {config.accent && (
          <span className="cap-control">
            <button disabled={accent} onClick={() => setAccent(true)}>
              accent
            </button>
            <button disabled={!accent} onClick={() => setAccent(false)}>
              no accent
            </button>
            {placements.map((p) => (
              <button key={p} disabled={p === placement} onClick={() => setPlacement(p)}>
                {p}
              </button>
            ))}
          </span>
        )}
        {config.hoverable && (
          <span className="cap-control">
            <button disabled={hoverable} onClick={() => setHoverable(true)}>
              hoverable
            </button>
            <button disabled={!hoverable} onClick={() => setHoverable(false)}>
              not hoverable
            </button>
          </span>
        )}
        {selectionModes.length > 1 && (
          <span className="cap-control">
            {selectionModes.map((m) => (
              <button
                key={m}
                disabled={m === selectionMode}
                onClick={() => {
                  setSelectionMode(m)
                  setGroupValue(m === "multi" ? [] : "")
                }}
              >
                {m}-select
              </button>
            ))}
          </span>
        )}
      </figcaption>

      <div className="card-row">
        <div className="card-frame">
          <div className="card-label">1 · sectioned</div>
          <Card
            config={config}
            {...axes}
            media={<PlaceholderMedia />}
            title={<span style={demoTitle}>Quarterly investment report</span>}
            description={<span style={demoType}>Updated 16 July 2026</span>}
            action={<PlaceholderButton label="Dismiss" />}
            content={commonContent}
            footer={<PlaceholderButton label="Open report" />}
          />
        </div>

        <div className="card-frame">
          <div className="card-label">2 · bare (no sections)</div>
          <Card config={config} {...axes} content={commonContent} />
        </div>

        <div className="card-frame">
          <div className="card-label">
            3 · disabled {config.disabled ? "" : "— not expressible in this column"}
          </div>
          {config.disabled ? (
            <Card
              config={config}
              {...axes}
              interaction={interactions.includes("button") ? "button" : interaction}
              disabled
              title={<span style={demoTitle}>Disabled card</span>}
              content={commonContent}
              footer={<PlaceholderButton label="Blocked" />}
            />
          ) : (
            <p style={{ ...demoType, color: "#71717a" }}>
              CONFIRMED ABSENCE — this column has no disabled prop, class or token.
            </p>
          )}
        </div>

        {interactions.includes("link") && (
          <div className="card-frame">
            <div className="card-label">4 · link card, with a focusable child inside it</div>
            <Card
              config={config}
              {...axes}
              interaction="link"
              href="#"
              title={<span style={demoTitle}>Sustainable investing</span>}
              content={
                <>
                  {commonContent}
                  <PlaceholderButton label="a nested control — the docs forbid this" />
                </>
              }
            />
          </div>
        )}
      </div>

      {config.group && (
        <div className="card-row">
          <div className="card-frame card-frame-wide">
            <div className="card-label">
              5 · group ({selectionMode}-select) — arrow keys select as they move in single-select,
              and do nothing at all in multi-select. The middle card is disabled and is filtered out
              of the ring.
            </div>
            <CardGroup
              config={config}
              selectionMode={selectionMode}
              value={groupValue}
              onValueChange={setGroupValue}
            >
              {["cash", "credit", "crypto"].map((v, i) => (
                <Card
                  key={v}
                  config={config}
                  {...axes}
                  interaction="button"
                  value={v}
                  disabled={i === 1}
                  style={{ width: 170 }}
                  title={<span style={demoTitle}>{v}</span>}
                  content={<p style={{ ...demoType, margin: 0 }}>Pay with {v}.</p>}
                />
              ))}
            </CardGroup>
          </div>
        </div>
      )}
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>Card — phase 2 validation</b>
        <span className="dim">
          M3's variant control changes the MECHANISM (shadow / fill / stroke), not a colour. Salt's
          tone control changes only the background. shadcn has neither, and no interaction state at
          all.
        </span>
      </header>
      <div className="body">
        <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => (
          <Stage key={t} theme={t} />
        ))}
        </main>
        <div className="side">
          <ThemeTabs themes={THEMES} active={panelTheme} onChange={setPanelTheme} />
          <ValuePanel theme={panelTheme} panel={panel} />
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
