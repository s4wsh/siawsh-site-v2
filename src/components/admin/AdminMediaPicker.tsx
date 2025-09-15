"use client";
import * as React from "react";
import Button from "@/components/ui/button";

type MediaItem = { src: string; width?: number; height?: number };

export default function AdminMediaPicker({
  onSelect,
  buttonLabel = "Pick Image",
  slug,
}: {
  onSelect: (item: { src: string; width?: number; height?: number; alt: string }) => void;
  buttonLabel?: string;
  slug?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"library" | "upload">("library");
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [alt, setAlt] = React.useState("");

  React.useEffect(() => {
    if (!open || tab !== "library") return;
    (async () => {
      const res = await fetch("/api/admin/media/list");
      const json = await res.json();
      setItems(json.items || []);
    })();
  }, [open, tab]);

  const filtered = items.filter((i) => i.src.toLowerCase().includes(search.toLowerCase()));

  const select = (src: string, width?: number, height?: number) => {
    if (!alt.trim()) return;
    onSelect({ src, width, height, alt: alt.trim() });
    setOpen(false);
    setAlt("");
  };

  async function onUpload() {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      if (slug) fd.set("slug", slug);
      fd.set("filename", file.name);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json?.src) {
        select(json.src, json.width, json.height);
      }
    } finally {
      setBusy(false);
    }
  }

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
              <div className="flex items-center gap-3">
                <button className={`text-sm ${tab === "library" ? "font-semibold" : "text-muted-foreground"}`} onClick={() => setTab("library")}>Library</button>
                <button className={`text-sm ${tab === "upload" ? "font-semibold" : "text-muted-foreground"}`} onClick={() => setTab("upload")}>Upload</button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="h-8 w-64 rounded-md border border-input bg-transparent px-2 text-sm"
                  placeholder="Alt text (required)"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                />
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
            {tab === "library" ? (
              <div className="max-h-[70vh] overflow-auto p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <input
                    className="h-8 w-64 rounded-md border border-input bg-transparent px-2 text-sm"
                    placeholder="Search path..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filtered.map((m) => (
                    <div key={m.src} className="overflow-hidden rounded-md border">
                      <div className="aspect-[16/9] w-full bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.src} alt={m.src} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-2 text-sm flex items-center justify-between">
                        <div className="truncate" title={m.src}>{m.src}</div>
                        <Button size="sm" onClick={() => select(m.src, m.width, m.height)} disabled={!alt.trim()}>Select</Button>
                      </div>
                    </div>
                  ))}
                </div>
                {!filtered.length && (
                  <div className="py-12 text-center text-sm text-muted-foreground">No images found.</div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="space-y-2">
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <div className="text-xs text-muted-foreground">Max 10MB. jpg, png, webp, avif.</div>
                  <div>
                    <Button size="sm" onClick={onUpload} disabled={!file || !alt.trim() || busy}>{busy ? "Uploading…" : "Upload & Select"}</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

