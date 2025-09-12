"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@/components/ui/button"
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

export default function BlogForm({
  defaultValues,
  action,
  isEdit = false,
}: {
  defaultValues?: Partial<BlogFormValues>
  action: (formData: FormData) => void
  isEdit?: boolean
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
          <Input {...form.register("slug")} placeholder="post-title" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Cover URL</label>
          <Input {...form.register("coverUrl")} placeholder="https://..." />
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
        <textarea
          {...form.register("body")}
          rows={10}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
        />
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
      <div className="flex gap-2">
        <Button type="submit" disabled={hasErrors}>Save</Button>
        <Button
          type="submit"
          name="publish"
          value="1"
          variant="secondary"
          disabled={hasErrors}
        >
          Publish
        </Button>
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
