"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import PasteImageUrl from "@/components/admin/PasteImageUrl"
import { ProjectInputSchema, type ProjectInput } from "@/types/content"

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
}: {
  defaultValues?: Partial<ProjectInput>
  action: (formData: FormData) => void
  isEdit?: boolean
}) {
  const form = useForm<ProjectInput>({
    resolver: zodResolver(ProjectInputSchema),
    defaultValues: {
      title: "",
      slug: "",
      client: "",
      coverUrl: "",
      tags: [],
      role: [],
      tools: [],
      timeline: { start: "", end: "" } as any,
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

  const hasErrors = Object.keys(form.formState.errors).length > 0

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
          <Input {...form.register("slug")} placeholder="project-title" />
        </div>
        <div>
          <label className="block text-sm font-medium">Cover Image</label>
          <PasteImageUrl
            value={form.watch("coverUrl") || ""}
            onChange={(v) => form.setValue("coverUrl", v)}
            placeholder="https://..."
          />
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

      <div className="flex gap-2">
        <Button type="submit" disabled={hasErrors}>Save Draft</Button>
        <Button type="submit" name="publish" value="1" variant="secondary" disabled={hasErrors}>Publish</Button>
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
        <Button type="button" size="sm" variant="outline" onClick={() => setItems((a) => [...a, ""])}>Add</Button>
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
