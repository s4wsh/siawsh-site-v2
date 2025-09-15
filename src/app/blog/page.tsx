import type { Metadata } from "next"
import BlogCard from "@/components/blog/BlogCard"
import { loadBlog } from "@/lib/content/blog"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog — Siawsh",
    description: "Articles, notes, and updates by Siawsh.",
    alternates: { canonical: "/blog" },
  }
}

type SearchParams = { tag?: string }

export default async function BlogIndex({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const tag = (sp.tag || "").toString().trim()

  const all = await loadBlog()
  const items = tag
    ? all.filter((p) => (p.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase()))
    : all

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold relative glow-underline">Insights & Updates</h1>
        <form action="/blog" method="get" className="flex items-center gap-2">
          <input
            name="tag"
            placeholder="Filter by tag…"
            defaultValue={tag}
            className="h-9 w-56 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          />
          <button className="h-9 rounded-md border px-3 text-sm">Apply</button>
        </form>
      </div>

      <div className="space-y-6">
        {items.map((p) => (
          <BlogCard key={p.slug} slug={p.slug} title={p.title} excerpt={p.excerpt} cover={p.cover} date={p.date} readingMinutes={p.readingMinutes} />
        ))}
      </div>
    </div>
  )
}
