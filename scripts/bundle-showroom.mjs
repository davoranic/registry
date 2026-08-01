// Bundles the REAL components into a working showroom (esbuild).
import * as esbuild from "esbuild"
import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

const result = await esbuild.build({
  entryPoints: [join(ROOT, "showroom/app.tsx")],
  bundle: true, format: "iife", target: ["es2022"],
  jsx: "automatic", loader: { ".json": "json" },
  minify: true, sourcemap: false, logLevel: "info",
  outfile: join(ROOT, "dist/showroom.js"),
  alias: { "@/lib/utils": join(ROOT, "lib/utils.ts") },
})

const themes = readdirSync(join(ROOT, "dist")).filter(f => f.startsWith("theme-") && f.endsWith(".css"))
const themeLinks = themes.map(f => {
  const name = f.replace("theme-", "").replace(".css", "")
  return `<style data-theme-css="${name}" media="${name === themes[0].replace("theme-","").replace(".css","") ? "all" : "not all"}">${readFileSync(join(ROOT, "dist", f), "utf8")}</style>`
}).join("\n")

const base = readFileSync(join(ROOT, "tokens/base.css"), "utf8")
const componentCss = readdirSync(join(ROOT, "registry"))
  .filter(d => { try { return readdirSync(join(ROOT, "registry", d)).some(f => f.endsWith(".css")) } catch { return false } })
  .map(d => readFileSync(join(ROOT, "registry", d, `${d}.css`), "utf8")).join("\n")
const showroomCss = readFileSync(join(ROOT, "showroom/showroom.css"), "utf8")
const js = readFileSync(join(ROOT, "dist/showroom.js"), "utf8")

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UI Registry — one contract, many characters</title>
<meta name="description" content="A design-system translator: one semantic token contract, design systems applied as themes.">
<style>${base}</style>
${themeLinks}
<style>${componentCss}</style>
<style>${showroomCss}</style>
</head><body><div id="root"></div>
<script>${js}</script>
</body></html>`

writeFileSync(join(ROOT, "dist/index.html"), html)
writeFileSync(join(ROOT, "dist/showroom.html"), html)
console.log(`showroom: ${(html.length / 1024).toFixed(0)} KB (components live)`)
