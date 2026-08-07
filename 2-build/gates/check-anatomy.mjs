/* ANATOMY DIVERGENCE GATE — is each component three anatomies, or one with paint on it?
 *
 * This exists because of the question that has to stay answerable: "are you just
 * applying CSS to the same anatomy?" That is the retrofit CLAUDE.md rule 1
 * forbids, and it is the failure that killed five previous builds — one design
 * system's component used as a chassis with the others draped over it, so parts
 * only the chassis system has become mandatory and parts only another system
 * has are unreachable.
 *
 * A single parameterised skeleton is NOT the violation: rule 1 requires
 * skeletons "born from the template union — every part any system needs". The
 * violation is when that union collapses, and every system ends up emitting the
 * same element tree.
 *
 * So this measures the thing that actually distinguishes them: for each
 * component, the set of PARTS each system renders. It reports
 *   - parts unique to one system (evidence of real divergence)
 *   - parts shared by all (the legitimate common core)
 *   - systems whose part-set is IDENTICAL to another's (convergence — not
 *     automatically wrong, but it must be explainable, not accidental)
 *
 * It reads the generated column data, not a live DOM, so it runs in CI and
 * covers all 13 components rather than whichever page happens to be open.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SYSTEMS = ["salt", "shadcn", "m3"]
const J = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"))

const comps = readdirSync(join(ROOT, "contract/templates"))
  .filter((f) => f.endsWith(".template.json"))
  .map((f) => f.replace(".template.json", ""))
  .sort()

/** Parts a column actually renders: structure rows that are ON. A config-channel
 * enum row (e.g. dialog's closeButton: optional/default/none) signals absence
 * with the string "none", the same way a css-channel row signals it with
 * kind:"off" or value:false/null — all three are excluded here. */
function partsOf(comp, system) {
  const p = `columns/${comp}.${system}.json`
  if (!existsSync(join(ROOT, p))) return null
  const tpl = J(`contract/templates/${comp}.template.json`)
  const cells = J(p).cells || {}
  const parts = new Set()
  for (const r of tpl.rows) {
    if (r.piece !== "structure") continue
    const c = cells[r.id]
    if (!c) continue
    if (c.kind === "off" || c.value === false || c.value === null || c.value === "none") continue
    parts.add(r.id.replace(/^structure\./, ""))
  }
  return parts
}

let identical = 0, diverged = 0
const lines = []

for (const comp of comps) {
  const sets = {}
  for (const s of SYSTEMS) {
    const p = partsOf(comp, s)
    if (p) sets[s] = p
  }
  const names = Object.keys(sets)
  if (names.length < 2) continue

  const all = new Set(names.flatMap((s) => [...sets[s]]))
  if (all.size === 0) { lines.push(`  ${comp.padEnd(9)} no structure rows — nothing to compare`); continue }

  const shared = [...all].filter((p) => names.every((s) => sets[s].has(p)))
  const unique = {}
  for (const s of names) unique[s] = [...sets[s]].filter((p) => names.filter((o) => o !== s).every((o) => !sets[o].has(p)))

  // which systems emit an IDENTICAL part-set?
  const sig = (s) => [...sets[s]].sort().join(",")
  const pairs = []
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++)
      if (sig(names[i]) === sig(names[j])) pairs.push(`${names[i]}=${names[j]}`)

  const uniqCount = Object.values(unique).reduce((a, b) => a + b.length, 0)
  if (uniqCount === 0) identical++
  else diverged++

  lines.push(
    `  ${comp.padEnd(9)} ${String(all.size).padStart(2)} parts · ${String(shared.length).padStart(2)} shared · ` +
    `${String(uniqCount).padStart(2)} system-unique` +
    (pairs.length ? `   ⚠ identical part-set: ${pairs.join(" ")}` : ""))
  for (const s of names)
    if (unique[s].length) lines.push(`${" ".repeat(13)}only ${s}: ${unique[s].join(", ")}`)
}

console.log("=".repeat(76))
console.log("ANATOMY DIVERGENCE — do the three systems render different part-sets?")
console.log("=".repeat(76))
console.log(lines.join("\n"))
console.log()
console.log(`  ${diverged} component(s) render a genuinely different part-set per system`)
console.log(`  ${identical} component(s) render the SAME parts in every system`)
console.log()
console.log("An identical part-set is not automatically a retrofit — button really is")
console.log("a labelled control in all three, and spinner's shadcn/M3 arcs converged")
console.log("legitimately when the v0.192 pin removed M3's track. But each one must be")
console.log("EXPLAINABLE. An unexplained convergence is the shape rule 1 forbids, and")
console.log("this gate exists so that question is answerable with data instead of trust.")
