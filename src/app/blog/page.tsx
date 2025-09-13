import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { adminDb } from "@/lib/firebase-admin"
import { blogConverter } from "@/lib/db"
import type { BlogPost } from "@/types/content"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog — Siawsh",
    description: "Articles, notes, and updates by Siawsh.",
    alternates: { canonical: "/blog" },
  }
}

type SearchParams = { tag?: string; page?: string | number }

export default async function BlogIndex({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const tag = (sp.tag || "").toString().trim()
  const page = Math.max(1, Number(sp.page || 1))
  const limit = 10

  const col = adminDb.collection("blogPosts").withConverter(blogConverter)
  const snapshot = await col.orderBy("publishedAt", "desc").get()
  let items: BlogPost[] = snapshot.docs
    .map((d) => d.data())
    .filter((p) => p.status === "published")

  if (tag) {
    items = items.filter((p) => (p.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase()))
  }

  const start = (page - 1) * limit
  const paged = items.slice(start, start + limit)

  const makeHref = (nextPage: number) => `/blog${tag ? `?tag=${encodeURIComponent(tag)}&page=${nextPage}` : `?page=${nextPage}`}`

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Blog</h1>
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
        {paged.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="group block overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
          >
            {p.coverUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                <Image
                  src={p.coverUrl}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform group-hover:scale-[1.01]"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold group-hover:underline">{p.title}</h2>
              <div className="mt-1 text-xs text-muted-foreground">
                {p.publishedAt?.slice(0, 10)}
              </div>
              {p.excerpt && (
                <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {(p.tags || []).map((t) => (
                  <span key={t} className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between p-2 text-sm">
        <div>Page {page}</div>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={makeHref(page - 1)} className="rounded-md border px-3 py-1">Previous</Link>
          )}
          {paged.length === limit && (
            <Link href={makeHref(page + 1)} className="rounded-md border px-3 py-1">Next</Link>
          )}
        </div>
      </div>
    </div>
  )
}
