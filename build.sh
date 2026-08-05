#!/usr/bin/env bash
# Rebuild everything, in dependency order. Run after ANY change.
#
#   1-intro/  the story + the site  (markdown is the source, site/ is generated)
#   2-build/  the machine           (contract -> columns -> skeleton -> out/)
#   3-source/ the design systems    (read only, never written)
#
# Gates run FIRST, and their results are recorded to out/gates.json so the
# "Where we are" page reports what actually happened rather than asserting it.
# A red gate does not stop the build — it is written down and shown.
set -uo pipefail
cd "$(dirname "$0")"
step() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }

step "Gates"
mkdir -p 2-build/out
: > /tmp/_gates.jsonl
gate() { # name | what it watches | command...
  local name="$1" watches="$2"; shift 2
  if "$@" >/dev/null 2>&1; then ok=true; else ok=false; fi
  printf '{"name":"%s","watches":"%s","ok":%s}\n' "$name" "$watches" "$ok" >> /tmp/_gates.jsonl
  printf '  %-22s %s\n' "$name" "$([ $ok = true ] && echo pass || echo FAIL)"
}
gate check-provenance "every citation resolves to a real file"   python3 2-build/gates/check-provenance.py
gate check-values     "tokens still resolve to our stored values" python3 2-build/gates/check-values.py
gate check-structure  "cascade order and unsized parts"           python3 2-build/gates/check-structure.py
gate check-anatomy    "the three systems render different parts"  node    2-build/gates/check-anatomy.mjs
RAN_AT="$(date -u +%Y-%m-%dT%H:%MZ)" python3 -c "
import json, os
rows = [json.loads(l) for l in open('/tmp/_gates.jsonl')]
print(json.dumps({'ranAt': os.environ['RAN_AT'], 'gates': rows}, indent=1))" \
  > 2-build/out/gates.json

step "Generate CSS from every template x column"
for t in 2-build/contract/templates/*.template.json; do
  python3 2-build/tools/gen-from-template.py "$(basename "$t" .template.json)" >/dev/null
done
echo "  $(ls 2-build/out/gen/*.css | wc -l | tr -d ' ') stylesheets"

# Every build-<name>-check.mjs harness's generated HTML references
# fonts/*.woff2 relative to out/ (i.e. it expects out/fonts/), but the
# self-hosted webfonts live at 2-build/fonts/ — a mismatch present since
# the first harness script was written, silently rendering every check
# page's Open Sans/Roboto fidelity check in fallback sans-serif. Fixed
# centrally here rather than patching each script's font URL (see
# CLAUDE.md's Known-open work).
mkdir -p 2-build/out/fonts
cp 2-build/fonts/*.woff2 2-build/out/fonts/

step "Sync resolved values into every matrix doc"
python3 2-build/tools/sync-matrix-values.py

step "Rebuild the docs site"
python3 1-intro/build/build-docs.py

printf '\n\033[1mDone.\033[0m  http://localhost:4173\n'
