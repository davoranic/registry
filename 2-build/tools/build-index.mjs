/* SUPERSEDED 2026-08-04 — do not resurrect this file.
 *
 * It built 2-build/out/index.html, a second front door that competed with the
 * docs site and duplicated its coverage numbers. That work now lives in
 * 1-intro/build/build-docs.py as the "Where we are" page, generated from the
 * same data and wearing the same UI.
 *
 * It is left as a stub rather than deleted because its path constants went
 * stale in the 2026-08-04 restructure (dist/, scripts/, docs/), so running it
 * would have reported every check page, matrix and behaviour gate as MISSING —
 * a confident wrong answer, which is the failure mode this project is built to
 * prevent.
 */
console.error(
  "build-index.mjs is superseded.\n" +
  "The coverage view is now the 'Where we are' page in the docs site.\n" +
  "Run:  ./build.sh      then open http://localhost:4173"
)
process.exit(1)
