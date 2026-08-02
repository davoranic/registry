// Builds the registry page: skeleton + generated CSS/config/panel -> dist/
import * as esbuild from "esbuild"
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

await esbuild.build({
  entryPoints: [join(ROOT, "page/registry.tsx")],
  bundle: true, format: "iife", target: ["es2022"],
  jsx: "automatic", loader: { ".json": "json" }, minify: true, logLevel: "warning",
  outfile: join(ROOT, "dist/page.js"),
})

mkdirSync(join(ROOT, "dist/fonts"), { recursive: true })
cpSync(join(ROOT, "fonts"), join(ROOT, "dist/fonts"), { recursive: true })

const css = ["page/chrome.css", "dist/gen/calendar-salt.css", "dist/gen/calendar-shadcn.css", "dist/gen/calendar-m3.css"]
  .map((f) => readFileSync(join(ROOT, f), "utf8")).join("\n")

writeFileSync(join(ROOT, "dist/index.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UI Registry — calendar, generated from the template matrix</title>
<style>${css}</style>
</head><body><div id="root"></div>
<script>${readFileSync(join(ROOT, "dist/page.js"), "utf8")}</script>
</body></html>`)
console.log("built dist/index.html")
