"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import PasteImageUrl from "@/components/admin/PasteImageUrl"
import AdminMediaPicker from "@/components/admin/AdminMediaPicker"
import { ProjectSchema, type Project } from "@/types/content"
type ProjectFormValues = Omit<Project, "id"> & { id?: string }

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function ProjectForm({
  defaultValues,
  action,
  isEdit = false,
  autosave,
}: {
  defaultValues?: Partial<ProjectFormValues>
  action: (formData: FormData) => void
  isEdit?: boolean
  autosave?: (formData: FormData) => Promise<void>
}) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      client: "",
      coverUrl: "",
      tags: [],
      role: [],
      tools: [],
      timeline: { start: "", end: "" },
      problem: "",
      approach: "",
      solution: "",
      excerpt: "",
      body: "",
      lang: "en",
      status: "draft",
      gallery: [],
      results: { summary: "", metrics: [] } as any,
      seo: { title: "", description: "", keywords: [] },
      ...defaultValues,
    },
    mode: "onChange",
  })

  const title = form.watch("title")
  useEffect(() => {
    if (!isEdit) {
      const s = slugify(title || "")
      if (s && !form.getValues("slug")) {
        form.setValue("slug", s)
      }
    }
  }, [title, isEdit])

  // Autosave debounce (edit only)
  useEffect(() => {
    if (!autosave || !isEdit) return;
    const t = setTimeout(async () => {
      try {
        setSaving("saving")
        const fd = new FormData()
        fd.set("title", form.getValues("title") || "")
        fd.set("slug", form.getValues("slug") || "")
        fd.set("coverUrl", form.getValues("coverUrl") || "")
        fd.set("client", form.getValues("client") || "")
        fd.set("excerpt", form.getValues("excerpt") || "")
        await autosave(fd)
        setSaving("saved")
        setTimeout(() => setSaving("idle"), 1200)
      } catch {}
    }, 1500)
    return () => clearTimeout(t)
  }, [autosave, isEdit, form.watch("title"), form.watch("slug"), form.watch("coverUrl"), form.watch("client"), form.watch("excerpt")])

  const hasErrors = Object.keys(form.formState.errors).length > 0
  const [saving, setSaving] = React.useState<"idle"|"saving"|"saved">("idle")
  const [slugError, setSlugError] = React.useState<string | null>(null)

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Title</label>
          <Input {...form.register("title")} placeholder="Case study title" />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">{form.formState.errors.title.message as any}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Client</label>
          <Input {...form.register("client")} placeholder="Client name" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <Input
            {...form.register("slug")}
            placeholder="project-title"
            onBlur={async (e) => {
              const v = e.currentTarget.value.trim();
              if (!v) return;
              try {
                const res = await fetch(`/api/admin/slug-check?type=project&slug=${encodeURIComponent(v)}`);
                const json = await res.json();
                if (json?.exists && v !== (defaultValues?.slug || "")) setSlugError("Slug already exists");
                else setSlugError(null);
              } catch {}
            }}
          />
          {slugError && <p className="text-xs text-destructive">{slugError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Cover Image</label>
          <PasteImageUrl
            value={form.watch("coverUrl") || ""}
            onChange={(v) => form.setValue("coverUrl", v)}
            placeholder="https://..."
          />
          <div className="mt-2">
            <AdminMediaPicker slug={form.getValues("slug") || "project"} onSelect={({ src }) => form.setValue("coverUrl", src)} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Tags (comma)</label>
          <Input defaultValue={(defaultValues?.tags || []).join(", ")} name="tagsCsv" placeholder="Motion, Packaging" />
        </div>
        <div>
          <label className="block text-sm font-medium">Role (comma)</label>
          <Input defaultValue={(defaultValues?.role || []).join(", ")} name="roleCsv" placeholder="Art Direction, 3D" />
        </div>
        <div>
          <label className="block text-sm font-medium">Tools (comma)</label>
          <Input defaultValue={(defaultValues?.tools || []).join(", ")} name="toolsCsv" placeholder="Blender, AE, AI" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Timeline Start</label>
          <Input type="date" name="timeline.start" defaultValue={(defaultValues as any)?.timeline?.start || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium">Timeline End</label>
          <Input type="date" name="timeline.end" defaultValue={(defaultValues as any)?.timeline?.end || ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Language</label>
          <select className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm" defaultValue={defaultValues?.lang || "en"} name="lang">
            <option value="en">English</option>
            <option value="tr">Turkish</option>
            <option value="fa">Farsi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm" defaultValue={defaultValues?.status || "draft"} name="status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Problem (brief)</label>
          <textarea {...form.register("problem")} rows={4} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Approach (process)</label>
          <textarea {...form.register("approach")} rows={4} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Solution (deliverables)</label>
          <textarea {...form.register("solution")} rows={4} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Excerpt</label>
        <textarea {...form.register("excerpt")} rows={3} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium">Results Summary</label>
        <textarea defaultValue={(defaultValues as any)?.results?.summary || ""} name="results.summary" rows={3} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
      </div>

      <MetricsEditor defaultItems={(defaultValues as any)?.results?.metrics || []} />

      <GalleryEditor defaultItems={defaultValues?.gallery || []} />

      <div>
        <label className="block text-sm font-medium">Body (Markdown)</label>
        <textarea {...form.register("body")} rows={10} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">SEO Title</label>
          <Input defaultValue={(defaultValues as any)?.seo?.title || ""} name="seo.title" placeholder="SEO title" />
        </div>
        <div>
          <label className="block text-sm font-medium">SEO Description</label>
          <Input defaultValue={(defaultValues as any)?.seo?.description || ""} name="seo.description" placeholder="SEO description" />
        </div>
        <div>
          <label className="block text-sm font-medium">SEO Keywords (comma)</label>
          <Input defaultValue={(defaultValues as any)?.seo?.keywords?.join(", ") || ""} name="seoKeywordsCsv" placeholder="design, motion" />
        </div>
      </div>

      {/* Hidden fields for arrays constructed from watch values */}
      <input type="hidden" name="title" value={form.watch("title") || ""} />
      <input type="hidden" name="slug" value={form.watch("slug") || ""} />
      <input type="hidden" name="coverUrl" value={form.watch("coverUrl") || ""} />
      <input type="hidden" name="client" value={form.watch("client") || ""} />
      <input type="hidden" name="excerpt" value={form.watch("excerpt") || ""} />
      <input type="hidden" name="body" value={form.watch("body") || ""} />

      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground min-w-24">{/* autosave indicator reserved */}</div>
        <Button type="submit" disabled={hasErrors || !!slugError}>Save Draft</Button>
        <Button type="submit" name="publish" value="1" variant="secondary" disabled={hasErrors || !!slugError}>Publish</Button>
      </div>
    </form>
  )
}

function GalleryEditor({ defaultItems }: { defaultItems: string[] }) {
  const [items, setItems] = React.useState<string[]>(defaultItems && defaultItems.length ? defaultItems : [""])
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Gallery URLs</label>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setItems((a) => [...a, ""])}>Add</Button>
          <AdminMediaPicker onSelect={({ src }) => setItems((a) => [...a, src])} buttonLabel="Add from Library" />
        </div>
      </div>
      <div className="space-y-2">
        {items.map((val, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="flex-1">
              <PasteImageUrl
                value={val}
                onChange={(v) => setItems((a) => a.map((x, i) => (i === idx ? v : x)))}
                placeholder="https://..."
              />
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={() => setItems((a) => a.filter((_, i) => i !== idx))}>Remove</Button>
          </div>
        ))}
      </div>
      {/* Hidden inputs to submit gallery entries */}
      {items.filter(Boolean).map((url, i) => (
        <input key={`g-${i}`} type="hidden" name="gallery[]" value={url} />
      ))}
    </div>
  )
}

type Metric = { label: string; value: string }
function MetricsEditor({ defaultItems }: { defaultItems: Metric[] }) {
  const [items, setItems] = React.useState<Metric[]>(defaultItems && defaultItems.length ? defaultItems : [])
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Result Metrics</label>
        <Button type="button" size="sm" variant="outline" onClick={() => setItems((a) => [...a, { label: "", value: "" }])}>Add</Button>
      </div>
      <div className="space-y-2">
        {items.map((m, idx) => (
          <div key={idx} className="flex gap-2">
            <Input defaultValue={m.label} name="results.metrics.label[]" placeholder="CTR" />
            <Input defaultValue={m.value} name="results.metrics.value[]" placeholder="+35%" />
            <Button type="button" size="sm" variant="ghost" onClick={() => setItems((a) => a.filter((_, i) => i !== idx))}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
