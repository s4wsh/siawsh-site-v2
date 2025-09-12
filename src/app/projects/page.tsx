import Link from "next/link"
import type { Metadata } from "next"
import { adminDb } from "@/lib/firebase-admin"
import { ProjectSchema, type Project } from "@/types/content"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Projects — Siawsh",
    description: "Selected case studies and projects by Siawsh.",
    alternates: { canonical: "/projects" },
  }
}

type SearchParams = { tag?: string; page?: string | number }

export default async function ProjectsIndex({ searchParams }: { searchParams: SearchParams }) {
  const tag = (searchParams.tag || "").toString().trim()
  const page = Math.max(1, Number(searchParams.page || 1))
  const limit = 12

  // Fetch published projects ordered by publishedAt desc
  const col = adminDb.collection("projects")
  const snapshot = await col.orderBy("publishedAt", "desc").get()
  let items: Project[] = snapshot.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .filter((p: any) => p.status === "published")
    .map((p) => ProjectSchema.parse(p))

  if (tag) {
    items = items.filter((p: any) => (p.tags || []).some((t: string) => t.toLowerCase() === tag.toLowerCase()))
  }

  const start = (page - 1) * limit
  const paged = items.slice(start, start + limit)

  const makeHref = (nextPage: number) => `/projects${tag ? `?tag=${encodeURIComponent(tag)}&page=${nextPage}` : `?page=${nextPage}`}`

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <form action="/projects" method="get" className="flex items-center gap-2">
          <input
            name="tag"
            placeholder="Filter by tag…"
            defaultValue={tag}
            className="h-9 w-56 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          />
          <button className="h-9 rounded-md border px-3 text-sm">Apply</button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paged.map((p) => (
          <Link key={p.id} href={`/projects/${p.slug}`} className="group overflow-hidden rounded-lg border transition-colors hover:bg-accent">
            {p.coverUrl && (
              // Using img for simplicity to avoid remote loader config
              <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
              </div>
            )}
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium leading-tight">{p.title}</h3>
                {("client" in p && (p as any).client) ? (
                  <span className="text-xs text-muted-foreground">{(p as any).client}</span>
                ) : null}
              </div>
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

