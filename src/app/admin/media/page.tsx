"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { format } from "date-fns"
import Button from "@/components/ui/button"
import CopyButton from "@/components/admin/CopyButton"
import { clientAuth, clientDb } from "@/lib/firebase-client"
import { collection, addDoc, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore"
import { clientStorage } from "@/lib/firebase-client"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { fmtBytes } from "@/lib/media"

type MediaDoc = {
  id: string
  path: string
  url: string
  type: string
  width?: number
  height?: number
  bytes?: number
  filename?: string
  createdAt: string
  createdBy?: string
}

function useMediaList() {
  const [items, setItems] = React.useState<MediaDoc[]>([])
  React.useEffect(() => {
    const qy = query(collection(clientDb, "media"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(qy, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MediaDoc[]
      setItems(data)
    })
    return () => unsub()
  }, [])
  return items
}

async function getImageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {}
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      URL.revokeObjectURL(url)
      resolve({ width: w, height: h })
    }
    img.onerror = () => resolve({})
    img.src = url
  })
}

export default function AdminMediaPage() {
  const [search, setSearch] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [progress, setProgress] = React.useState<Record<string, number>>({})
  const items = useMediaList()

  const onDrop = React.useCallback(async (accepted: File[]) => {
    if (!accepted.length) return
    setBusy(true)
    try {
      for (const f of accepted) {
        const uid = clientAuth.currentUser?.uid || "anon"
        const ts = Date.now()
        const safeName = f.name.replace(/\s+/g, "-")
        const path = `uploads/${uid}/${ts}-${safeName}`
        const storageRef = ref(clientStorage, path)
        const uploadTask = uploadBytesResumable(storageRef, f)
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snap) => {
              const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
              setProgress((p) => ({ ...p, [path]: pct }))
            },
            reject,
            () => resolve()
          )
        })
        const url = await getDownloadURL(storageRef)
        const dims = await getImageSize(f)
        const payload = {
          path,
          url,
          type: f.type,
          width: dims.width,
          height: dims.height,
          bytes: f.size,
          filename: f.name,
          createdAt: new Date().toISOString(),
          createdBy: uid,
        }
        await addDoc(collection(clientDb, "media"), payload)
      }
    } finally {
      setBusy(false)
      setProgress({})
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
      "video/*": [".mp4", ".mov", ".webm"],
      "application/pdf": [".pdf"],
    },
  })

  const filtered = items.filter((i) =>
    (i.filename || i.path).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Media</h1>
        <input
          className="h-9 w-64 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
          placeholder="Search filename…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div
        {...getRootProps()}
        className={`rounded-md border border-dashed p-6 text-center ${isDragActive ? "bg-accent/50" : ""}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">
          Drag & drop files here, or click to select
        </p>
        {busy && (
          <p className="mt-2 text-xs text-muted-foreground">Uploading…</p>
        )}
        {!!Object.keys(progress).length && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(progress).map(([path, pct]) => (
              <div key={path} className="flex items-center justify-between">
                <span className="truncate">{path.split("/").slice(-1)[0]}</span>
                <span>{pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-md border">
            <div className="aspect-[16/9] w-full bg-muted">
              {m.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.filename || m.path} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  {m.type}
                </div>
              )}
            </div>
            <div className="p-3 text-sm">
              <div className="truncate" title={m.filename || m.path}>{m.filename || m.path}</div>
              <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                <span>{fmtBytes(m.bytes || 0)}</span>
                <span>{format(new Date(m.createdAt), "yyyy-MM-dd HH:mm")}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <CopyButton value={m.url}>Copy URL</CopyButton>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm("Delete this file?")) return
                    try {
                      await deleteObject(ref(clientStorage, m.path))
                    } catch (e) {
                      console.error("Delete storage failed", e)
                    }
                    try {
                      await deleteDoc(doc(clientDb, "media", m.id))
                    } catch (e) {
                      console.error("Delete doc failed", e)
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
