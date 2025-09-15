import Link from "next/link"
import type { Metadata } from "next"
import AspectImage from "@/components/ui/AspectImage"
import Filters from "@/components/site/Filters"
import { filterProjects, allCategories, allYears, type ProjectEntry } from "@/lib/content/projects"
import { GRID_SIZES } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Projects — Siawsh",
    description: "Selected case studies and projects by Siawsh.",
    alternates: { canonical: "/projects" },
  }
}

type SearchParams = { category?: string; year?: string }

export default async function ProjectsIndex({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const category = (sp.category || "").toString().trim()
  const year = (sp.year || "").toString().trim()

  const items = filterProjects({ category: category || undefined, year: year || undefined })
  const categories = allCategories()
  const years = allYears()

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold relative glow-underline">Blueprint to Broadcast: Selected Work</h1>
        <Filters categories={categories} years={years} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p: ProjectEntry) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            prefetch
            aria-label={`View case study: ${p.title}`}
            className="group overflow-hidden rounded-2xl border border-muted transition-colors hover:bg-accent/10 neon-glow"
          >
            <AspectImage src={p.cover.src} alt={p.cover.alt} ratio="16/9" fill sizes={GRID_SIZES} />
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium leading-tight">{p.title}</h3>
                {p.client ? (
                  <span className="text-xs text-muted-foreground">{p.client}</span>
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
    </div>
  )
}
