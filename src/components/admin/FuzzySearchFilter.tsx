"use client"

import * as React from "react"

function fuzzyMatch(text: string, query: string) {
  const t = text.toLowerCase()
  const q = query.toLowerCase().replace(/\s+/g, "")
  if (!q) return true
  if (t.includes(q)) return true
  let ti = 0
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi]
    ti = t.indexOf(ch, ti)
    if (ti === -1) return false
    ti++
  }
  return true
}

export default function FuzzySearchFilter({ targetId, placeholder = "Quick filter…" }: { targetId: string; placeholder?: string }) {
  const [q, setQ] = React.useState("")

  React.useEffect(() => {
    const container = document.getElementById(targetId)
    if (!container) return
    const rows = Array.from(container.querySelectorAll<HTMLTableRowElement>("tbody tr[data-title]"))
    rows.forEach((tr) => {
      const title = tr.getAttribute("data-title") || ""
      const visible = fuzzyMatch(title, q)
      tr.style.display = visible ? "" : "none"
    })
  }, [q, targetId])

  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      className="h-9 w-60 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
      placeholder={placeholder}
    />
  )
}

