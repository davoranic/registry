import * as esbuild from "esbuild"
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
await esbuild.build({
  entryPoints: [join(ROOT, "harness/conformance.tsx")],
  bundle: true, format: "iife", target: ["es2022"], jsx: "automatic",
  loader: { ".json": "json" }, minify: false, logLevel: "warning",
  outfile: join(ROOT, "out/conformance.js"),
})
// every component's generated CSS, so behaviour runs against the real styles
const gen = ["dialog", "select", "tabs", "card", "checkbox", "switch", "radio-group", "slider"]
  .flatMap((c) => ["salt", "shadcn", "m3"].map((s) => `out/gen/${c}-${s}.css`))
const css = ["harness/chrome.css", ...gen]
  .map((f) => { try { return readFileSync(join(ROOT, f), "utf8") } catch { return "" } })
  .join("\n")
writeFileSync(join(ROOT, "out/conformance.html"), `<!doctype html><html><head><meta charset="utf-8">
<style>${css}
body{font:13px/1.5 ui-sans-serif,system-ui,sans-serif;padding:20px}
table{border-collapse:collapse;font-size:12px}th{text-align:left;border-bottom:2px solid #ddd}
td{border-bottom:1px solid #eee;vertical-align:top}code{font-size:11px}
</style></head><body><div id="root"></div>
<script>${readFileSync(join(ROOT, "out/conformance.js"), "utf8")}</script></body></html>`)
console.log("built out/conformance.html")
