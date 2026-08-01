import * as React from "react"
import { renderToString } from "react-dom/server"
import { STORIES } from "../showroom/stories"

export function run() {
  const bad: string[] = []
  for (const s of STORIES) {
    try {
      const html = renderToString(<>{s.render({})}</>)
      const text = html.replace(/<[^>]*>/g, "").trim()
      const hasSlots = html.includes("data-slot")
      if (!hasSlots) bad.push(`${s.name}: EMPTY (no data-slot in output)`)
      else if (html.length < 40) bad.push(`${s.name}: SUSPICIOUS (${html.length} chars)`)
    } catch (e: any) {
      bad.push(`${s.name}: THREW — ${String(e.message).slice(0, 90)}`)
    }
  }
  console.log(`smoke: ${STORIES.length} stories, ${bad.length} problem(s)`)
  for (const b of bad) console.log("  ✗ " + b)
  return bad.length ? 1 : 0
}
