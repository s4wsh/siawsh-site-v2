import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { adminDb } from "@/lib/firebase-admin"
import { ProjectSchema, type Project } from "@/types/content"

export const dynamic = "force-dynamic"

type Params = { slug: string }

async function fetchBySlug(slug: string): Promise<Project | null> {
  const snap = await adminDb.collection("projects").where("slug", "==", slug).limit(1).get()
  if (snap.empty) return null
  const doc = snap.docs[0]
  const data = { id: doc.id, ...(doc.data() as any) }
  if ((data as any).status !== "published") return null
  return ProjectSchema.parse(data)
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await fetchBySlug(params.slug)
  if (!data) return {}
  const seo = (data as any).seo || {}
  const title = seo.title || `${data.title} — Case Study`
  const description = seo.description || (data.excerpt || `Case study: ${data.title}`)
  return {
    title,
    description,
    alternates: { canonical: `/projects/${data.slug}` },
    openGraph: {
      title,
      description,
      images: data.coverUrl ? [{ url: data.coverUrl }] : undefined,
    },
  }
}

export default async function ProjectDetail({ params }: { params: Params }) {
  const data = await fetchBySlug(params.slug)
  if (!data) return notFound()

  const caseStudy: any = data
  const roles: string[] = caseStudy.role || []
  const tools: string[] = caseStudy.tools || []
  const tags: string[] = caseStudy.tags || []
  const gallery: string[] = caseStudy.gallery || []
  const timeline = caseStudy.timeline || {}
  const metrics: Array<{ label: string; value: string }> = caseStudy.results?.metrics || []

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: data.title,
    datePublished: data.publishedAt,
    inLanguage: data.lang,
    image: data.coverUrl ? [data.coverUrl] : undefined,
    keywords: tags.join(", "),
    about: caseStudy.problem,
  }

  return (
    <article className="py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="space-y-3">
        {data.coverUrl && (
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border bg-muted">
            <img src={data.coverUrl} alt={data.title} className="h-full w-full object-cover" />
          </div>
        )}
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <div className="text-sm text-muted-foreground">
          <span>{(caseStudy.client as string) || ""}</span>
          {(roles.length || tools.length) ? (
            <>
              {caseStudy.client ? <span className="mx-2">•</span> : null}
              <span>{roles.join(", ")}</span>
              {roles.length && tools.length ? <span className="mx-2">•</span> : null}
              <span>{tools.join(", ")}</span>
            </>
          ) : null}
          {(timeline.start || timeline.end) && (
            <>
              <span className="mx-2">•</span>
              <span>{timeline.start || ""}{timeline.end ? ` – ${timeline.end}` : ""}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-1 text-xs">
          {tags.map((t) => (
            <span key={t} className="rounded bg-muted px-2 py-0.5 text-muted-foreground">{t}</span>
          ))}
        </div>
      </header>

      {(caseStudy.problem || caseStudy.approach || caseStudy.solution) && (
        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {caseStudy.problem && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Problem</h2>
              <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{caseStudy.problem}</p>
            </div>
          )}
          {caseStudy.approach && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Approach</h2>
              <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{caseStudy.approach}</p>
            </div>
          )}
          {caseStudy.solution && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Solution</h2>
              <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{caseStudy.solution}</p>
            </div>
          )}
        </section>
      )}

      {!!metrics.length && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">Results</h2>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Metric</th>
                  <th className="px-3 py-2 text-left font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => (
                  <tr key={`${m.label}-${i}`} className="border-t">
                    <td className="px-3 py-2">{m.label}</td>
                    <td className="px-3 py-2">{m.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!!gallery.length && (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Gallery</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {gallery.map((src, i) => (
              <div key={`${src}-${i}`} className="overflow-hidden rounded-lg border bg-muted">
                <img src={src} alt={`${data.title} image ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {data.body && (
        <section className="prose mt-10 max-w-none">
          {/* Render markdown as pre-wrapped text for now */}
          <div className="whitespace-pre-wrap leading-7">{data.body}</div>
        </section>
      )}
    </article>
  )
}

