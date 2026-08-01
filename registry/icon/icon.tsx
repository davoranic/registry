import * as React from "react"

import roleCatalog from "../../icons/roles.json"
import lucideSet from "../../icons/sets/lucide.json"
import radixSet from "../../icons/sets/radix.json"
import saltSet from "../../icons/sets/salt.json"
import tablerSet from "../../icons/sets/tabler.json"

import "./icon.css"

/* Contract-native Icon (contract/anatomy/icon.json).
   Components ask for a semantic ROLE; the set file decides which glyph answers.
   This is the third swap mechanism: not shadcn's per-import swap and not Salt's
   provider, but a role resolved against icons/sets/*.json at render time.
   Requires tsconfig "resolveJsonModule": true. */

export type IconRole = keyof typeof roleCatalog.roles
export type IconSet = "lucide" | "tabler" | "radix" | "salt"
type Size = "sm" | "md" | "lg"

interface GlyphEntry {
  name: string
  viewBox: string
  path: string
  fill?: string | null
  stroke?: number | null
  fillRule?: string
}

interface SetFile {
  set: string
  style: string
  defaults: {
    fill?: string | null
    stroke?: number | null
    strokeLinecap?: string | null
    strokeLinejoin?: string | null
  }
  roles: Record<string, GlyphEntry>
}

const SETS = {
  lucide: lucideSet as unknown as SetFile,
  tabler: tablerSet as unknown as SetFile,
  radix: radixSet as unknown as SetFile,
  salt: saltSet as unknown as SetFile,
} satisfies Record<IconSet, SetFile>

const DEFAULT_SET: IconSet = "lucide"

export interface IconProps
  extends Omit<React.ComponentProps<"svg">, "role" | "children"> {
  /** semantic role, not a glyph name — see icons/roles.json */
  role: IconRole
  /** which set answers the role; defaults to the registry base set */
  set?: IconSet
  /** icon ramp: sm=inline, md=control, lg=emphasis */
  size?: Size
  /** giving a label promotes the icon from decoration to content */
  label?: string
}

function Icon({
  role,
  set = DEFAULT_SET,
  size = "md",
  label,
  ...props
}: IconProps) {
  const sheet = SETS[set] ?? SETS[DEFAULT_SET]
  const glyph = sheet.roles[role]

  // an unmapped role is a contract violation, not a runtime fallback
  if (!glyph) return null

  const outline = sheet.style === "outline"
  const labelled = label !== undefined && label !== ""

  return (
    <svg
      data-slot="icon"
      data-icon-role={role}
      data-icon-set={sheet.set}
      data-icon-style={sheet.style}
      data-size={size === "md" ? undefined : size}
      data-state={role === "loading" ? "loading" : undefined}
      viewBox={glyph.viewBox}
      fill={outline ? "none" : "currentColor"}
      stroke={outline ? "currentColor" : undefined}
      strokeWidth={outline ? (glyph.stroke ?? sheet.defaults.stroke ?? 2) : undefined}
      strokeLinecap={
        (sheet.defaults.strokeLinecap as React.SVGProps<SVGSVGElement>["strokeLinecap"]) ??
        undefined
      }
      strokeLinejoin={
        (sheet.defaults.strokeLinejoin as React.SVGProps<SVGSVGElement>["strokeLinejoin"]) ??
        undefined
      }
      role={labelled ? "img" : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...props}
    >
      <path
        data-slot="glyph"
        d={glyph.path}
        fillRule={glyph.fillRule as React.SVGProps<SVGPathElement>["fillRule"]}
        clipRule={glyph.fillRule as React.SVGProps<SVGPathElement>["clipRule"]}
      />
    </svg>
  )
}

export { Icon }
