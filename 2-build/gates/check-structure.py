#!/usr/bin/env python3
"""Two correctness gates the generator never had. Each closes a bug found TWICE.

GATE A — CASCADE ORDER
  Generated CSS is emitted in template-row order, and the generator has no notion
  of which rule should WIN. A state block (`@disabled`, `@selected`) emitted
  BEFORE the axis block it must override loses at equal specificity, producing
  valid CSS, a passing build, and a visibly wrong component. chip hit this — an
  `@elevated` shadow outlived `disabled`'s `box-shadow: none` — and select's
  finding 13 hit it first (selected must beat hover; focus must beat hover;
  read-only must beat focus).

GATE B — STRUCTURE WITHOUT SIZE
  A `structure.<part>` row switched ON whose sizing `style` rows are all OFF
  renders a part with no dimensions. If that part contains a percentage-sized
  replaced element (an `<svg width="100%">`), it silently inherits the 300px
  default intrinsic width. chip's Salt column did exactly this and every
  unconstrained chip ballooned from ~40px to 367px — invisible in half the
  harness, because a `max-width` on an ancestor was clamping it.

Neither is expressible in the existing gates: `off` is a legal state for a
switchable style row, and row order is legal CSS. Both are reported as WARNINGS
with the reasoning, not hard failures, because a legitimate exception exists for
each (a state that genuinely should not override; a part sized by its own
content). Silence is the enemy — but so is a gate that cries wolf.

CALIBRATION, measured 2026-08-02 against all 13 components — read before acting
on a warning:

  GATE A found 1 REAL defect on its first run: button's `background@hover` is
  emitted before `background@secondary`, and the secondary selector is
  specificity (0,5,0) against hover's (0,4,0) — so a Salt bordered button can
  never show a hover background. Its `--secondary-bg-hover` slot is defined in
  both modes and referenced by NO rule. Gate A is trustworthy; treat its hits as
  probable defects.

  GATE B produced 4 warnings and ALL FOUR were false positives, confirmed by
  measuring the live renders: select's `selected-marker` is not rendered at all
  for Salt/M3 (they signal selection with a fill, so there is no element to
  size), dialog's close-button is not rendered for M3, and dialog/shadcn's
  actions row measures 45x33 from its content. The gate reads the TEMPLATE and
  cannot know whether a structure row actually produces an ELEMENT in a given
  column, nor whether content gives it intrinsic size. **A Gate B hit is a
  question for the render, never a verdict** — open the component's check page
  and measure the part before changing anything. It is kept because it is the
  only static tripwire for the chip failure (a real part with no dimensions and
  a percentage-sized SVG inside it, which silently inherits 300px).
"""
import json, os, re, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "contract", "templates")
COLS = os.path.join(ROOT, "columns")

# A row id carrying `@something` targets a state or a non-default axis value.
AT_RE = re.compile(r"@([\w-]+)$")
# rows whose @suffix names an interaction STATE must come after plain/axis rows
STATE_WORDS = ("hover", "focus", "focus-visible", "active", "pressed", "selected",
               "checked", "disabled", "readonly", "read-only", "visited", "invalid")
SIZE_PROPS = ("width", "height", "inline-size", "block-size", "min-width", "min-height",
              "size", "padding", "aspect-ratio", "flex-basis", "r", "stroke-width")


def load(name):
    return json.load(open(os.path.join(TPL, name), encoding="utf-8"))


def state_of(row_id):
    m = AT_RE.search(row_id)
    if not m:
        return None
    tag = m.group(1)
    return tag if any(w == tag or tag.endswith(w) for w in STATE_WORDS) else None


def gate_a(comp, tpl):
    """State rows must be emitted AFTER the plain/axis rows they override."""
    warn = []
    css = [r for r in tpl["rows"] if r.get("channel") == "css"]
    # index of the last non-state row targeting the same selector-ish part
    def part_of(rid):
        return rid.split("@")[0]
    last_plain = {}
    for i, r in enumerate(css):
        if state_of(r["id"]) is None:
            last_plain[part_of(r["id"])] = i
    for i, r in enumerate(css):
        st = state_of(r["id"])
        if st is None:
            continue
        p = part_of(r["id"])
        if p in last_plain and last_plain[p] > i:
            warn.append("%s: `%s` (state=%s) is emitted at #%d but the plain row it must "
                        "override, `%s`, is at #%d — the state loses at equal specificity"
                        % (comp, r["id"], st, i, css[last_plain[p]]["id"], last_plain[p]))
    return warn


def gate_b(comp, tpl):
    """structure.<part> ON in a column, but every sizing style row for it OFF."""
    warn = []
    struct = [r for r in tpl["rows"]
              if r.get("piece") == "structure" and r.get("channel") == "config"]
    if not struct:
        return warn
    # A part sized by the theme-invariant `base` block needs no themed row at all —
    # card's media and dialog's actions are laid out entirely in base. Counting
    # those as defects made the gate cry wolf on 10 parts, 8 of them fine.
    base_sized = set()
    for sel, decls in (tpl.get("base") or {}).items():
        if not any(any(p == k or k.endswith(p) for p in SIZE_PROPS) for k in decls):
            continue
        for m in re.finditer(r'data-slot="([\w-]+)"', sel):
            base_sized.add(m.group(1).split("-")[-1])

    # style rows that set a dimension, grouped by the part token in their id
    sizing = defaultdict(list)
    for r in tpl["rows"]:
        if r.get("channel") != "css":
            continue
        decls = r.get("declarations") or {}
        touches_size = r.get("cellIsDeclarations") or any(
            any(p == k or k.endswith(p) for p in SIZE_PROPS) for k in decls)
        if touches_size:
            for tok in re.split(r"[.@]", r["id"]):
                sizing[tok].append(r["id"])

    for fn in sorted(os.listdir(COLS)):
        if not fn.startswith(comp + "."):
            continue
        system = fn.split(".")[1]
        cells = (json.load(open(os.path.join(COLS, fn), encoding="utf-8")).get("cells") or {})
        for r in struct:
            cell = cells.get(r["id"])
            if not cell or cell.get("kind") == "off" or cell.get("value") in (False, None):
                continue
            part = r["id"].split(".")[-1]
            if part in base_sized or part.rstrip("s") in base_sized:
                continue                       # sized by the theme-invariant base block
            cands = sizing.get(part) or sizing.get(part.rstrip("s")) or []
            if not cands:
                continue                       # no sizing row exists at all — not this gate's call
            if all((cells.get(c) or {}).get("kind") == "off" for c in cands):
                warn.append("%s/%s: structure row `%s` is ON but every sizing row for `%s` is OFF "
                            "(%s) — the part renders with no dimensions"
                            % (comp, system, r["id"], part, ", ".join(cands[:3])))
    return warn


def main():
    a_warn, b_warn = [], []
    for fn in sorted(os.listdir(TPL)):
        if not fn.endswith(".template.json"):
            continue
        comp = fn.split(".")[0]
        tpl = load(fn)
        a_warn += gate_a(comp, tpl)
        b_warn += gate_b(comp, tpl)

    print("=" * 74)
    print("GATE A — CASCADE ORDER (state rows must follow the rows they override)")
    print("=" * 74)
    print("\n".join("  ! " + w for w in a_warn) if a_warn else "  OK — no state row precedes its base row")
    print()
    print("=" * 74)
    print("GATE B — STRUCTURE WITHOUT SIZE (a part rendered with no dimensions)")
    print("=" * 74)
    print("\n".join("  ! " + w for w in b_warn) if b_warn else "  OK — every switched-on part has at least one live sizing row")
    print()
    print("Both are WARNINGS, not hard failures: a state may legitimately not need to")
    print("override, and a part may legitimately size to its own content. Read each,")
    print("then either fix it or record why it is intentional.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
