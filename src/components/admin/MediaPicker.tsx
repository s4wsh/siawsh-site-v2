"use client"

import * as React from "react"
import Button from "@/components/ui/button"
import { clientDb } from "@/lib/firebase-client"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"

type MediaItem = {
  id: string
  path: string
  url: string
  type: string
  filename?: string
  createdAt?: string
}

export default function MediaPicker({ onSelect, buttonLabel = "Pick from Library" }: { onSelect: (item: { url: string; path: string }) => void; buttonLabel?: string }) {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<MediaItem[]>([])
  const [search, setSearch] = React.useState("")
  const [visible, setVisible] = React.useState(24)

  React.useEffect(() => {
    if (!open) return
    const qy = query(collection(clientDb, "media"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(qy, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MediaItem[]
      setItems(data)
    })
    return () => unsub()
  }, [open])

  const filtered = items.filter((i) => (i.filename || i.path).toLowerCase().includes(search.toLowerCase()))
  const shown = filtered.slice(0, visible)

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        {buttonLabel}
      </Button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 top-10 w-[95vw] max-w-4xl -translate-x-1/2 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-xl">
            <div className="flex items-center justify-between gap-2 border-b p-3">
              <div className="font-medium">Media Library</div>
              <div className="flex items-center gap-2">
                <input
                  className="h-8 w-64 rounded-md border border-input bg-transparent px-2 text-sm"
                  placeholder="Search filename..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {shown.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-md border">
                    <div className="aspect-[16/9] w-full bg-muted">
                      {m.type?.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt={m.filename || m.path} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          {m.type}
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-sm">
                      <div className="truncate" title={m.filename || m.path}>{m.filename || m.path}</div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            onSelect({ url: m.url, path: m.path })
                            setOpen(false)
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {shown.length < filtered.length && (
                <div className="mt-3 flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + 24)}>
                    Load more
                  </Button>
                </div>
              )}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">No media found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

