"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@/components/ui/button"
import Image from "next/image"
import Input from "@/components/ui/input"
import { BlogPostSchema, type BlogPost } from "@/types/content"
type BlogFormValues = Omit<BlogPost, "id"> & { id?: string }

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

import AdminMediaPicker from "@/components/admin/AdminMediaPicker"
import MarkdownToolbar from "@/components/admin/MarkdownToolbar"
import MarkdownPreview from "@/components/admin/MarkdownPreview"

export default function BlogForm({
  defaultValues,
  action,
  isEdit = false,
  autosave,
}: {
  defaultValues?: Partial<BlogFormValues>
  action: (formData: FormData) => void
  isEdit?: boolean
  autosave?: (formData: FormData) => Promise<void>
}) {
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(BlogPostSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      coverUrl: "",
      tags: [],
      excerpt: "",
      body: "",
      lang: "en",
      status: "draft",
      gallery: [],
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
  const [saving, setSaving] = React.useState<"idle"|"saving"|"saved">("idle")
  const [slugError, setSlugError] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<"body"|"preview">("body")
  const bodyRef = React.useRef<HTMLTextAreaElement | null>(null)

  // Unsaved changes prompt
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form.formState.isDirty])

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
        fd.set("excerpt", form.getValues("excerpt") || "")
        await autosave(fd)
        setSaving("saved")
        setTimeout(() => setSaving("idle"), 1200)
      } catch {}
    }, 1500)
    return () => clearTimeout(t)
  }, [autosave, isEdit, form.watch("title"), form.watch("slug"), form.watch("coverUrl"), form.watch("excerpt")])

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <Input {...form.register("title")} placeholder="Post title" />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">{form.formState.errors.title.message as any}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <Input
            {...form.register("slug")}
            placeholder="post-title"
            onBlur={async (e) => {
              const v = e.currentTarget.value.trim();
              if (!v) return;
              try {
                const res = await fetch(`/api/admin/slug-check?type=post&slug=${encodeURIComponent(v)}`);
                const json = await res.json();
                if (json?.exists && v !== (defaultValues?.slug || "")) setSlugError("Slug already exists");
                else setSlugError(null);
              } catch {}
            }}
          />
          {slugError && <p className="text-xs text-destructive">{slugError}</p>}
        </div>
      </div>

      {/* Live cover preview */}
      {form.watch("coverUrl") ? (
        <div className="mt-2 w-full max-w-xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border">
            <Image src={form.watch("coverUrl") || ""} alt="Cover preview" fill className="object-cover" sizes="(min-width: 1024px) 800px, 100vw" />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Cover URL</label>
          <Input {...form.register("coverUrl")} placeholder="https://..." />
          <div className="mt-2"><AdminMediaPicker slug={form.getValues("slug") || "post"} onSelect={({ src, alt }) => { form.setValue("coverUrl", src); if (!form.getValues("title")) form.setValue("title", alt) }} /></div>
        </div>
        <div>
          <label className="block text-sm font-medium">Tags (comma separated)</label>
          <Input
            defaultValue={(defaultValues?.tags || []).join(", ")}
            name="tagsCsv"
            placeholder="react, nextjs"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Language</label>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            defaultValue={defaultValues?.lang || "en"}
            name="lang"
          >
            <option value="en">English</option>
            <option value="tr">Turkish</option>
            <option value="fa">Farsi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            defaultValue={defaultValues?.status || "draft"}
            name="status"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Excerpt</label>
        <textarea
          {...form.register("excerpt")}
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Body</label>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => {
              const v = form.getValues("body") || "";
              const outline = `## Introduction\n\n## Section 1\n\n## Section 2\n\n## Takeaways\n\n`;
              form.setValue("body", v ? `${v}\n\n${outline}` : outline);
            }}>Insert Blog outline</Button>
          </div>
          <MarkdownToolbar
            value={form.getValues("body") || ""}
            onChange={(v) => form.setValue("body", v)}
            textareaRef={bodyRef}
            onPickImage={async () => {
              // Fallback to simple prompts; library button is available elsewhere
              const url = window.prompt('Image URL') || '';
              const alt = window.prompt('Alt text') || '';
              return url ? { src: url, alt } : null;
            }}
            mode={mode}
            onModeChange={setMode}
          />
        </div>
        {mode === 'body' ? (
          (() => { const { ref, ...rest } = form.register("body"); return (
          <textarea
            {...rest}
            ref={(el) => { bodyRef.current = el; ref(el) }}
            rows={12}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
          />) })()
        ) : (
          <div className="rounded-md border p-3">
            <MarkdownPreview value={form.getValues("body") || ""} />
          </div>
        )}
      </div>

      {/* Gallery */}
      <GalleryEditor defaultItems={defaultValues?.gallery || []} />

      {/* SEO */}
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

      {/* Hidden fields for arrays constructed from CSV */}
      <input type="hidden" name="title" value={form.watch("title") || ""} />
      <input type="hidden" name="slug" value={form.watch("slug") || ""} />
      <input type="hidden" name="coverUrl" value={form.watch("coverUrl") || ""} />
      <input type="hidden" name="excerpt" value={form.watch("excerpt") || ""} />
      <input type="hidden" name="body" value={form.watch("body") || ""} />
      {/* Submit row */}
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground min-w-24">{saving === "saving" ? "Saving…" : saving === "saved" ? "All changes saved" : ""}</div>
        <Button type="submit" disabled={hasErrors || !!slugError}>Save</Button>
        <Button
          type="submit"
          name="publish"
          value="1"
          variant="secondary"
          disabled={hasErrors || !!slugError}
        >
          Publish
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/preview-token', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'post', id: defaultValues?.id || form.getValues('slug') }) })
                const { token } = await res.json()
                if (token) window.open(`/preview/post/${defaultValues?.id || form.getValues('slug')}?token=${token}`, '_blank')
              } catch {}
            }}
          >Preview</Button>
        )}
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
          <div key={idx} className="flex gap-2">
            <Input defaultValue={val} name="gallery[]" placeholder="https://..." />
            <Button type="button" size="sm" variant="ghost" onClick={() => setItems((a) => a.filter((_, i) => i !== idx))}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
