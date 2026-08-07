/* Phase-2 validation harness for Chip — same purpose as badge-check.tsx /
   card-check.tsx: render the generated CSS on the real skeleton and let the
   values be checked against each DS's own reference before moving on. Not the
   final registry page.

   Every declared axis gets a control, because ALERT-MATRIX.md finding 10 was
   found by clicking one:
     - mode (all themes)
     - density (Salt only — the only system with the capability, and it moves
       NINE things here: the chip height, the min-height, the radius, the
       padding, the tag padding, the gap, the check-icon box, the group gap
       and the type)
     - interaction: action / toggle / static (Salt) and action / toggle (M3).
       SOURCE-DEFAULT-FIRST in both. This is the axis that swaps the ELEMENT.
     - kind: assist / filter / input / suggestion (M3 only)
     - elevation: flat / elevated (M3 only) — the shadow-versus-stroke fork
     - tag-variant: primary / secondary (Salt only, static form only)

   SIX SUB-STAGES PER THEME, each chosen to make an invisible divergence
   visible:
     1. AXIS — one chip at the currently toggled settings, so the element
        fork can be flipped and watched.
     2. SHAPE — the row that carries this matrix's headline. A Salt PILL is
        1-4px cornered and a Salt TAG is 999px; an M3 chip is 8px. The names
        are the wrong way round and only a render shows it.
     3. SELECTED — unselected beside selected, in a real group where the
        column is group-scoped. Salt changes NOTHING on the chip (the check
        icon carries the whole signal); M3 changes the fill, the label AND
        the outline width to zero.
     4. DELETABLE — the a11y fork, rendered rather than described. Salt's
        chip has NO trailing part, so the whole pill is the remove control
        and there is ONE tab stop; M3 renders a real nested <button>, so
        there are TWO. Each chip prints whether the chassis MEASURED a
        focusable descendant (data-has-nested-focusable), so the difference
        is inspectable and not merely asserted.
     5. DISABLED — Salt's blanket 40% dim against M3's 38%-content /
        12%-stroke pair.
     6. ELEVATION — M3 only, flat beside elevated, because elevated deletes
        the stroke rather than adding to it.
   Columns with no source for a stage print the REASON instead of rendering a
   fake, the same convention badge-check.tsx uses.

   TYPOGRAPHY IS NOT HARNESS CHROME HERE. Both live columns declare a font
   (Salt regular 400 body Open Sans at 11/12/14/16px by density; M3 label-large
   500 0.875rem/1.25rem Roboto), so the chip's own type IS a registry value
   and must be read as one. Only the captions, the legends and the notes are
   inline harness chrome.

   CSS NOTE, DELIBERATE: every .chip-* rule below lives in an inline <style>
   in this file rather than in page/chrome.css, because another agent is
   working in chrome.css this session. These rules BELONG IN chrome.css later
   — they are the same family as the existing .badge-* and .card-* harness
   classes and nothing about them is chip-specific beyond the prefix. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Chip, ChipGroup, type ChipConfig } from "../skeleton/chip"
import configs from "../out/gen/chip-config.json"
import panel from "../out/gen/chip-panel.json"
import { ValuePanel, ThemeTabs } from "./panel-shared"

const THEMES = ["salt", "shadcn", "m3"] as const
type Theme = (typeof THEMES)[number]

// HARNESS_CSS moved to page/chrome.css after the concurrent build finished.

const INTERACTION_LABEL: Record<string, string> = {
  action: "action — a bare <Pill onClick>: a native <button>, Enter AND Space (SOURCE DEFAULT)",
  toggle: "toggle — inside a selectionVariant=\"multiple\" group: role=checkbox, SPACE ONLY (Enter is preventDefault-ed)",
  static: "static — Tag: a <div>, no role, no tab stop, no interaction of any kind",
}

const KIND_LABEL: Record<string, string> = {
  assist: "assist — the unqualified family: on-surface label, primary icon (the base reading)",
  filter: "filter — selected/unselected, a trailing icon, on-surface-variant label",
  input: "input — an AVATAR, a trailing remove control, and NO elevated form",
  suggestion: "suggestion — assist with every on-surface swapped for on-surface-variant",
}

const ELEVATION_LABEL: Record<string, string> = {
  flat: "flat — a 1px outline-variant stroke, level0 (SOURCE DEFAULT: the wrappers rename flat-* to unprefixed)",
  elevated: "elevated — NO stroke at all, a surface-container-low fill and a level1 shadow",
}

const NO_STAGE: Record<string, Record<string, string>> = {
  selected: {
    shadcn: "no component — CONFIRMED ABSENCE (see the scope note).",
    salt: "",
    m3: "",
  },
  elevation: {
    salt: "no elevation axis — CONFIRMED ABSENCE. Neither Pill.css nor Tag.css declares a box-shadow or reads any palette/shadow.css token, so Salt's chip has no shadow-versus-stroke mechanism at all.",
    shadcn: "no component — CONFIRMED ABSENCE.",
  },
  shadcnAll:
    "shadcn/ui ships NO chip, NO tag and NO pill. Six-part proof in themes/columns/chip.shadcn.json: the ui/ directory listing (63 files, none of them), a filename search over the whole clone (nothing), every 'chip' string in apps/v4 (all of them ComboboxChip* inside a combobox field, plus the word 'microchip' in lorem-ipsum task data), the docs content dirs (no chip.mdx), _registry.ts (zero hits), and a `file` check proving those greps ran against readable text. docs/COMPONENTS.md line 111 already recorded the same answer independently. Its badge is ALREADY BUILT as its own component and is deliberately NOT substituted here — that would be a rule-1 retrofit and a double-count. The stages below stay empty on purpose: an evidenced blank is the honest render.",
}

/* DECLARED DEFERRAL, same convention as Calendar's chevrons, alert.tsx's
   status glyph and badge-check.tsx's placeholder: a neutral geometric shape
   standing in for each system's own icon set until a registry icon-set
   component exists. */
function PlaceholderIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.4" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="6" cy="6" r="1.4" fill="currentColor" />
    </svg>
  )
}

function PlaceholderCloseIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/* DECLARED COMPOSITION — an M3 input chip sizes and shapes an avatar (24px,
   corner-full) without owning one; `avatar` is its own COMPONENTS.md row. */
function PlaceholderAvatar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
      <rect width="24" height="24" fill="currentColor" opacity="0.25" />
      <circle cx="12" cy="9" r="4" fill="currentColor" opacity="0.7" />
      <path d="M3 23 a9 9 0 0 1 18 0 Z" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

function Legend({ children }: { children: React.ReactNode }) {
  return <div className="chip-legend">{children}</div>
}

/* Reads back what the chassis MEASURED rather than what the harness assumed —
   behavior.delete-affordance is the one row in this matrix whose answer is a
   DOM fact, so the harness prints the DOM fact. */
function NestedProbe({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLSpanElement | null>(null)
  const [text, setText] = React.useState("measuring…")
  React.useEffect(() => {
    const chip = ref.current?.querySelector('[data-slot="chip"]')
    if (!chip) return
    const nested = chip.hasAttribute("data-has-nested-focusable")
    const stops = chip.querySelectorAll(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ).length
    setText(
      nested
        ? `NESTED FOCUSABLE present — ${stops + 1} tab stops on this chip`
        : "no nested focusable — 1 tab stop; the WHOLE chip is the control",
    )
  }, [children])
  return (
    <>
      <span className="chip-swatch" ref={ref}>
        {children}
      </span>
      <span className="chip-note">{text}</span>
    </>
  )
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, ChipConfig>)[theme]
  const interactions = config.interaction ?? []
  const kinds = config.kind ?? []
  const elevations = config.elevation ?? []
  const tagVariants = config.tagVariant ?? []

  const [interaction, setInteraction] = React.useState<string | undefined>(interactions[0])
  const [kind, setKind] = React.useState<string | undefined>(kinds[0])
  const [elevation, setElevation] = React.useState<string | undefined>(elevations[0])
  const [tagVariant, setTagVariant] = React.useState<string | undefined>(tagVariants[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")
  const [picked, setPicked] = React.useState<string[]>(["b"])
  const [chips, setChips] = React.useState(["Alpha", "Bravo", "Charlie"])

  const isSalt = theme === "salt"
  const live = interactions.length > 0
  const groupScoped = config.selectionScope === "group"

  /* DECLARED CONSTRAINT, enforced rather than only documented: M3's
     input-chip has NO elevated token family in any edition, so the elevated
     control is withdrawn on that kind instead of rendering a value source
     does not have. */
  const elevationAllowed = kind !== "input"
  const effElevation = elevationAllowed ? elevation : "flat"
  /* In M3, prop.interaction is DETERMINED by prop.kind — assist/suggestion
     are actions, filter/input are toggles. Declared in the template; moved
     together here so the harness cannot show a combination source forbids. */
  const effInteraction =
    theme === "m3" ? (kind === "filter" || kind === "input" ? "toggle" : "action") : interaction

  const common = { config, kind, elevation: effElevation, tagVariant }
  const toggleable = effInteraction === "toggle"

  function Row({ children }: { children: React.ReactNode }) {
    return groupScoped && toggleable ? (
      <ChipGroup config={config} label="Harness chip group">
        {children}
      </ChipGroup>
    ) : (
      <div className="chip-row">{children}</div>
    )
  }

  return (
    <figure
      className="stage"
      data-theme={theme}
      data-mode={mode === "dark" ? "dark" : undefined}
      data-density={isSalt ? density : undefined}
    >
      <figcaption>
        {theme} · {mode}
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>mode</button>
        {isSalt && (
          <span className="cap-control">
            {["high", "medium", "low", "touch"].map((d) => (
              <button key={d} disabled={d === density} onClick={() => setDensity(d)}>
                {d}
              </button>
            ))}
          </span>
        )}
        {interactions.length > 1 && theme !== "m3" && (
          <span className="cap-control">
            {interactions.map((i) => (
              <button key={i} disabled={i === interaction} onClick={() => setInteraction(i)} title={INTERACTION_LABEL[i]}>
                {i}
              </button>
            ))}
          </span>
        )}
        {kinds.length > 1 && (
          <span className="cap-control">
            {kinds.map((k) => (
              <button key={k} disabled={k === kind} onClick={() => setKind(k)} title={KIND_LABEL[k]}>
                {k}
              </button>
            ))}
          </span>
        )}
        {elevations.length > 1 && (
          <span className="cap-control">
            {elevations.map((e) => (
              <button
                key={e}
                disabled={e === effElevation || !elevationAllowed}
                onClick={() => setElevation(e)}
                title={ELEVATION_LABEL[e]}
              >
                {e}
              </button>
            ))}
          </span>
        )}
        {tagVariants.length > 1 && (
          <span className="cap-control">
            {tagVariants.map((v) => (
              <button key={v} disabled={v === tagVariant} onClick={() => setTagVariant(v)}>
                tag:{v}
              </button>
            ))}
          </span>
        )}
      </figcaption>

      {!live ? (
        <div className="chip-block">
          <Legend>{NO_STAGE.shadcnAll}</Legend>
        </div>
      ) : (
        <>
          {/* 1 — the toggled axis */}
          <div className="chip-block">
            <div className="chip-label">
              1 · axis · interaction={effInteraction} kind={kind ?? "—"} elevation={effElevation ?? "—"}
              {theme === "m3" && !elevationAllowed ? " (elevated withdrawn: input-chip has no elevated tokens)" : ""}
            </div>
            <Row>
              <Chip
                {...common}
                interaction={effInteraction}
                value="a"
                selected={toggleable ? picked.includes("a") : undefined}
                onSelectionChange={() =>
                  setPicked((p) => (p.includes("a") ? p.filter((x) => x !== "a") : [...p, "a"]))
                }
                leading={<PlaceholderIcon />}
              >
                Chip label
              </Chip>
            </Row>
          </div>

          {/* 2 — the shape headline */}
          <div className="chip-block">
            <div className="chip-label">
              2 · shape — a Salt PILL is corner-weaker (1/2/3/4px by density), a Salt TAG is corner-strongest
              (999px), an M3 chip is corner-small (8px). Three chips, three shapes, and Salt&apos;s two names are the
              wrong way round.
            </div>
            <div className="chip-row">
              {interactions.map((i) => (
                <span className="chip-cell" key={i}>
                  <Chip {...common} interaction={theme === "m3" ? effInteraction : i} value={`s-${i}`}>
                    {i}
                  </Chip>
                  <span className="chip-note">{INTERACTION_LABEL[i] ?? i}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 3 — selection */}
          <div className="chip-block">
            <div className="chip-label">
              3 · selected — Salt changes NOTHING on the chip (the check icon is the whole signal); M3 changes the
              fill, the label AND the outline width to 0
            </div>
            {config.selected ? (
              <Row>
                {["b", "c"].map((v, n) => (
                  <Chip
                    key={v}
                    {...common}
                    interaction="toggle"
                    value={v}
                    selected={picked.includes(v)}
                    onSelectionChange={() =>
                      setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))
                    }
                    avatar={config.avatar && kind === "input" ? <PlaceholderAvatar /> : undefined}
                    leading={<PlaceholderIcon />}
                    trailingIcon={<PlaceholderCloseIcon />}
                    onDelete={config.trailing ? () => undefined : undefined}
                  >
                    {n === 0 ? "Toggle me" : "And me"}
                  </Chip>
                ))}
              </Row>
            ) : (
              <Legend>{NO_STAGE.selected[theme]}</Legend>
            )}
            <div className="chip-note" style={{ marginTop: 6 }}>
              selection scope: <b>{config.selectionScope ?? "—"}</b>
              {groupScoped
                ? " — a Salt Pill OUTSIDE a selectionVariant=\"multiple\" group has no role, no aria-checked and no check icon, even if you pass it a value"
                : " — M3 puts selected-/unselected- token families on the chip itself; no chip-set token exists"}
            </div>
          </div>

          {/* 4 — the a11y fork, measured */}
          <div className="chip-block">
            <div className="chip-label">
              4 · deletable — THE A11Y FORK. Salt has no trailing part, so the whole pill is the remove control;
              M3&apos;s filter and input chips carry a trailing icon the spec makes a remove BUTTON.
            </div>
            <div className="chip-row">
              {chips.map((c) => (
                <span className="chip-cell" key={c}>
                  <NestedProbe>
                    <Chip
                      {...common}
                      interaction={effInteraction}
                      value={c}
                      selected={toggleable ? picked.includes(c) : undefined}
                      trailingIcon={<PlaceholderCloseIcon />}
                      deleteLabel={`Remove ${c}`}
                      onDelete={() => setChips((x) => x.filter((y) => y !== c))}
                    >
                      {c}
                    </Chip>
                  </NestedProbe>
                </span>
              ))}
              {chips.length === 0 && (
                <button type="button" onClick={() => setChips(["Alpha", "Bravo", "Charlie"])}>
                  reset
                </button>
              )}
            </div>
            <div className="chip-note" style={{ marginTop: 6 }}>
              delete keys: <b>{(config.deleteKeys ?? []).join(" / ") || "NONE — off in every column"}</b>. No system
              in the clones binds Delete or Backspace to a standalone chip; Salt&apos;s Backspace handler lives in
              PillInput, on the input-group row.
            </div>
          </div>

          {/* 5 — disabled */}
          <div className="chip-block">
            <div className="chip-label">
              5 · disabled — Salt dims the WHOLE chip to 40% and restates the resting colours so hover cannot win;
              M3 uses TWO opacities, 38% on the content and 12% on the stroke
            </div>
            <div className="chip-row">
              <span className="chip-cell">
                <Chip {...common} interaction={effInteraction} value="d1" leading={<PlaceholderIcon />}>
                  Enabled
                </Chip>
                <span className="chip-note">for comparison</span>
              </span>
              <span className="chip-cell">
                <Chip {...common} interaction={effInteraction} value="d2" disabled leading={<PlaceholderIcon />}>
                  Disabled
                </Chip>
                <span className="chip-note">
                  {isSalt
                    ? "native disabled attribute + tabIndex -1 — NOT aria-disabled, unlike the same system's InteractableCard"
                    : "[R] mechanism; the two opacities are [S]"}
                </span>
              </span>
              <span className="chip-cell">
                <Chip
                  {...common}
                  interaction={effInteraction}
                  value="d3"
                  disabled
                  trailingIcon={<PlaceholderCloseIcon />}
                  onDelete={() => undefined}
                >
                  Disabled + delete
                </Chip>
                <span className="chip-note">the nested control is disabled with its host</span>
              </span>
            </div>
          </div>

          {/* 6 — the mechanism fork */}
          <div className="chip-block">
            <div className="chip-label">6 · elevation — shadow versus stroke, not shadow on top of stroke</div>
            {elevations.length > 1 ? (
              <div className="chip-row">
                {elevations.map((e) => (
                  <span className="chip-cell" key={e}>
                    <Chip {...common} elevation={e} interaction={effInteraction} value={`e-${e}`}>
                      {e}
                    </Chip>
                    <span className="chip-note">{ELEVATION_LABEL[e]}</span>
                  </span>
                ))}
              </div>
            ) : (
              <Legend>{NO_STAGE.elevation[theme]}</Legend>
            )}
          </div>
        </>
      )}
    </figure>
  )
}

function App() {
  const [panelTheme, setPanelTheme] = React.useState<Theme>("salt")
  return (
    <div className="shell">
      <header>
        <b>Chip — phase 2 validation</b>
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
