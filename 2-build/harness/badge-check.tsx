/* Phase-2 validation harness for Badge — same purpose as card-check.tsx /
   tabs-check.tsx: render the generated CSS on the real skeleton and let the
   values be checked against each DS's own reference before moving on. Not
   the final registry page.

   Every declared axis gets a control, because ALERT-MATRIX.md finding 10 was
   found by clicking one. The controls are:
     - mode (all themes)
     - density (Salt only — the only system with the capability, and it moves
       FIVE things here: the pill height, the dot diameter, the padding, the
       anchor offset and the type)
     - content: dot / label (Salt and M3) — TWO SHAPES, not one shape with a
       colour delta, and DOT IS value[0] in both because a bare Salt <Badge />
       renders a dot and M3's unprefixed token family is the dot
     - placement: inline / anchored (Salt only) — inline is value[0], and the
       source JSDoc says so
     - variant: six values (shadcn only) — Salt and M3 get no control, which
       is itself the finding: one is always accent blue, the other always
       error red
     - interaction: static / link (shadcn only) — every hover rule in
       badge.tsx is written `[a&]:hover:`, so a shadcn badge has NO hover
       response until this is switched to link

   FOUR SUB-STAGES PER THEME, each chosen to make an invisible divergence
   visible:
     1. AXIS — one badge at the currently toggled content/placement, so the
        shape fork can be flipped and watched.
     2. LABEL FORMATTING — the same five labels in every column, forced to
        content="label". Salt clamps 1000 to "999+" and 200/max=99 to "99+"
        and leaves the long STRING alone; shadcn and M3 have no value prop
        and pass all five through untouched. This is the sub-stage that makes
        behavior.value-clamping visible, and nothing about it is styling.
     3. ANCHORED — Salt only, both forms side by side, because the dot and
        the labelled badge anchor at DIFFERENT offsets (half the dot's own
        width, against a full spacing-100). shadcn and M3 print the reason
        they have no stage instead of rendering a fake.
     4. VARIANTS — shadcn only, all six including `ghost` and `link`, which
        its own docs demo never shows. Rendered twice, once static and once
        as links, so the [a&]:hover gate is inspectable rather than described.

   HARNESS-ONLY TYPOGRAPHY, DECLARED — but note the inversion from
   docs/CARD-MATRIX.md finding 1. On card, NO system declared any typography,
   so every character in the harness was chrome. Here ALL THREE declare it
   (Salt 600 10px/13px Open Sans, shadcn 500 0.75rem/1rem, M3 500 0.6875rem/
   1rem Roboto), so the badge's own type IS a registry value and must be read
   as one. Only the surrounding captions and the placeholder host's label are
   inline harness chrome. */
import * as React from "react"
import { createRoot } from "react-dom/client"
import { Badge, type BadgeConfig } from "../skeleton/badge"
import configs from "../out/gen/badge-config.json"

const THEMES = ["salt", "shadcn", "m3"] as const

const CONTENT_LABEL: Record<string, string> = {
  dot: "dot (Salt: no value; M3: the unprefixed 6px family)",
  label: "label (Salt: a formatted value; M3: the large-* 16px family)",
}

const PLACEMENT_LABEL: Record<string, string> = {
  inline: "inline (Salt: no children — the SOURCE DEFAULT)",
  anchored: "anchored (Salt: a child is present, so the pill goes top-right)",
}

const INTERACTION_LABEL: Record<string, string> = {
  static: "static (a <span> — no hover response at all)",
  link: "link (asChild -> <a>, which is what [a&]:hover: needs)",
}

const NO_ANCHOR_REASON: Record<string, string> = {
  shadcn:
    "no anchored form — CONFIRMED ABSENCE. badge.tsx has no position/inset/translate utility. The anchored dot shadcn does ship is AvatarBadge, a part of `avatar` on a different COMPONENTS.md row.",
  m3: "no anchored form in this token set. M3 badges do anchor, but the geometry lives on the HOST (navigation-bar / navigation-rail) and is marked @deprecated there in favour of md.comp.badge.* — _md-comp-badge.scss itself is placement-agnostic.",
}

const NO_VARIANT_REASON: Record<string, string> = {
  salt: "no variant axis — CONFIRMED ABSENCE. BadgeProps is exactly { value, children, max }; Badge.css declares ONE background. A Salt badge is always accent blue, and usage.mdx makes it deliberate: 'To communicate status through color ... Instead, use Pill.'",
  m3: "no variant axis — `color` and `large-color` both resolve to md-sys-color.$error and there is no second value anywhere in the file. An M3 badge is red by definition.",
}

/* DECLARED COMPOSITION — the anchored host belongs to the already-built
   `button` plus a future icon-set component; rendered here as a neutral
   placeholder rather than imported, so this component's build stays
   self-contained (the same convention alert.tsx and card-check.tsx use).
   Its own type is harness chrome. */
function PlaceholderHostButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        padding: 0,
        border: "1px solid currentColor",
        borderRadius: 4,
        background: "none",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      <PlaceholderIcon size={16} />
    </button>
  )
}

/* DECLARED DEFERRAL, same convention as Calendar's chevrons and alert.tsx's
   status glyph: a neutral geometric shape standing in for each system's own
   icon set until a registry icon-set component exists. */
function PlaceholderIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 1.2 L2 4.4 v5 a0.6 0.6 0 0 0 0.6 0.6 h6.8 a0.6 0.6 0 0 0 0.6 -0.6 v-5 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Legend({ children }: { children: React.ReactNode }) {
  return <div className="badge-legend">{children}</div>
}

function Stage({ theme }: { theme: (typeof THEMES)[number] }) {
  const config = (configs as Record<string, BadgeConfig>)[theme]
  const contents = config.content ?? []
  const placements = config.placement ?? []
  const variants = config.variant ?? []
  const interactions = config.interaction ?? []

  const [content, setContent] = React.useState<string | undefined>(contents[0])
  const [placement, setPlacement] = React.useState<string | undefined>(placements[0])
  const [variant, setVariant] = React.useState<string | undefined>(variants[0])
  const [interaction, setInteraction] = React.useState<string | undefined>(interactions[0])
  const [mode, setMode] = React.useState("light")
  const [density, setDensity] = React.useState("medium")

  const isSalt = theme === "salt"
  const hasAnchor = placements.length > 1
  const hasVariants = variants.length > 1
  const hasInteraction = interactions.length > 1

  const common = { config, variant, interaction }

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
        {contents.length > 1 && (
          <span className="cap-control">
            {contents.map((c) => (
              <button key={c} disabled={c === content} onClick={() => setContent(c)} title={CONTENT_LABEL[c]}>
                {c}
              </button>
            ))}
          </span>
        )}
        {hasAnchor && (
          <span className="cap-control">
            {placements.map((p) => (
              <button key={p} disabled={p === placement} onClick={() => setPlacement(p)} title={PLACEMENT_LABEL[p]}>
                {p}
              </button>
            ))}
          </span>
        )}
        {hasVariants && (
          <span className="cap-control">
            {variants.map((v) => (
              <button key={v} disabled={v === variant} onClick={() => setVariant(v)}>
                {v}
              </button>
            ))}
          </span>
        )}
        {hasInteraction && (
          <span className="cap-control">
            {interactions.map((i) => (
              <button key={i} disabled={i === interaction} onClick={() => setInteraction(i)} title={INTERACTION_LABEL[i]}>
                {i}
              </button>
            ))}
          </span>
        )}
      </figcaption>

      {/* 1 — the toggled axis */}
      <div className="badge-block">
        <div className="badge-label">1 · axis · content={content ?? "label"} placement={placement ?? "inline"}</div>
        <div className="badge-row">
          <Badge
            {...common}
            content={content}
            placement={placement}
            value={content === "dot" ? undefined : 9}
            host={placement === "anchored" ? <PlaceholderHostButton label="9 notifications" /> : undefined}
          >
            {theme === "salt" ? undefined : content === "dot" ? undefined : "9"}
          </Badge>
        </div>
      </div>

      {/* 2 — label formatting, the row that makes clamping visible */}
      <div className="badge-block">
        <div className="badge-label">
          2 · label formatting (content forced to &quot;label&quot;) — Salt clamps NUMBERS, never strings
        </div>
        <div className="badge-row">
          {(
            [
              [9, undefined, "9"],
              [1000, undefined, "1000 -> Salt shows 999+ (default max)"],
              [200, 99, "200 max=99 -> Salt shows 99+"],
              ["NEW", undefined, "\"NEW\""],
              ["VERYLONGLABEL", undefined, "a long STRING is never clamped"],
            ] as [number | string, number | undefined, string][]
          ).map(([v, m, note]) => (
            <span className="badge-cell" key={String(v) + String(m)}>
              <Badge {...common} content="label" value={v} max={m}>
                {theme === "salt" ? undefined : String(v)}
              </Badge>
              <span className="badge-note">{note}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3 — anchored, both shapes, Salt only */}
      <div className="badge-block">
        <div className="badge-label">3 · anchored to a host</div>
        {hasAnchor ? (
          <div className="badge-row">
            <span className="badge-cell">
              <Badge
                {...common}
                content="label"
                placement="anchored"
                value={9}
                host={<PlaceholderHostButton label="9 notifications" />}
              />
              <span className="badge-note">labelled — right: spacing-100</span>
            </span>
            <span className="badge-cell">
              <Badge
                {...common}
                content="label"
                placement="anchored"
                value={200}
                max={99}
                host={<PlaceholderHostButton label="99 plus notifications" />}
              />
              <span className="badge-note">clamped, and the pill widens in place</span>
            </span>
            <span className="badge-cell">
              <Badge
                {...common}
                content="dot"
                placement="anchored"
                host={<PlaceholderHostButton label="Settings, new available" />}
              />
              <span className="badge-note">DOT — right: half its own width</span>
            </span>
          </div>
        ) : (
          <Legend>{NO_ANCHOR_REASON[theme]}</Legend>
        )}
      </div>

      {/* 4 — the variant axis */}
      <div className="badge-block">
        <div className="badge-label">4 · variant axis</div>
        {hasVariants ? (
          <>
            <div className="badge-row">
              {variants.map((v) => (
                <span className="badge-cell" key={v}>
                  <Badge config={config} variant={v} interaction="static" content="label">
                    {v}
                  </Badge>
                  <span className="badge-note">static — no hover</span>
                </span>
              ))}
            </div>
            <div className="badge-row">
              {variants.map((v) => (
                <span className="badge-cell" key={v}>
                  <Badge config={config} variant={v} interaction="link" content="label" href="#badge">
                    {v}
                  </Badge>
                  <span className="badge-note">link — hover me</span>
                </span>
              ))}
            </div>
            <div className="badge-row">
              <span className="badge-cell">
                <Badge config={config} variant={variant} interaction={interaction} content="label" icon={<PlaceholderIcon />}>
                  Verified
                </Badge>
                <span className="badge-note">icon slot — 12px, pointer-events none</span>
              </span>
            </div>
          </>
        ) : (
          <Legend>{NO_VARIANT_REASON[theme]}</Legend>
        )}
      </div>
    </figure>
  )
}

function App() {
  return (
    <div className="shell">
      <header>
        <b>Badge — phase 2 validation</b>
      </header>
      <main style={{ flexDirection: "column", alignItems: "stretch" }}>
        {THEMES.map((t) => (
          <Stage key={t} theme={t} />
        ))}
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
