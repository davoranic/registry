// SSR every story; report empty/error renders. CI-able truth, not eyeballs.
import * as esbuild from "esbuild"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

await esbuild.build({
  entryPoints: [join(ROOT, "scripts/_smoke-entry.tsx")],
  bundle: true, format: "esm", platform: "node", jsx: "automatic", banner: { js: "import { createRequire } from \"node:module\"; const require = createRequire(import.meta.url);" },
  loader: { ".json": "json", ".css": "empty" },
  outfile: join(ROOT, "dist/_smoke.mjs"), logLevel: "silent",
  alias: { "@/lib/utils": join(ROOT, "lib/utils.ts"),
           "react": join(ROOT, "node_modules/react/cjs/react.development.js"),
           "react/jsx-runtime": join(ROOT, "node_modules/react/cjs/react-jsx-runtime.development.js") },
})
const { run } = await import(join(ROOT, "dist/_smoke.mjs"))
process.exit(run())
