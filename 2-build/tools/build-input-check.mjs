import * as esbuild from "esbuild"
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
await esbuild.build({
  entryPoints: [join(ROOT, "harness/input-check.tsx")],
  bundle: true, format: "iife", target: ["es2022"], jsx: "automatic",
  loader: { ".json": "json" }, minify: true, logLevel: "warning",
  outfile: join(ROOT, "out/input-check.js"),
})
const css = ["harness/chrome.css", "out/gen/input-salt.css", "out/gen/input-shadcn.css", "out/gen/input-m3.css"]
  .map((f) => readFileSync(join(ROOT, f), "utf8")).join("\n")
writeFileSync(join(ROOT, "out/input-check.html"), `<!doctype html><html><head><meta charset="utf-8">
<style>${css}</style></head><body><div id="root"></div>
<script>${readFileSync(join(ROOT, "out/input-check.js"), "utf8")}</script></body></html>`)
console.log("built out/input-check.html")
