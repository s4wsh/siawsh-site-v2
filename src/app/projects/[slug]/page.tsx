import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProjectBySlug, loadProjects } from "@/lib/content/projects"
import CaseHero from "@/components/case/CaseHero"
import CaseMeta from "@/components/case/CaseMeta"
import CaseSection from "@/components/case/CaseSection"
import CaseGallery from "@/components/case/CaseGallery"
import { canonical, projectJsonLd } from "@/lib/seo"

export const revalidate = 60
export const dynamic = 'error'

type P = { slug: string }

export async function generateMetadata({ params }: { params: Promise<P> }): Promise<Metadata> {
  const p = await params;
  const data = getProjectBySlug(p.slug)
  if (!data) return {}
  const title = `${data.title} — Case Study`
  const description = data.summary
  return {
    title,
    description,
    alternates: { canonical: canonical(`/projects/${data.slug}`) },
    openGraph: {
      title,
      description,
      images: data.cover?.src ? [{ url: data.cover.src }] : ["/og/default-og.png"],
    },
  }
}

export async function generateStaticParams() {
  const items = loadProjects();
  return items.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetail({ params }: { params: Promise<P> }) {
  const p = await params;
  const data = getProjectBySlug(p.slug)
  if (!data) return notFound();

  const gallery = data.gallery || []
  const jsonLd = projectJsonLd(data)

  return (
    <article className="py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CaseHero title={data.title} cover={data.cover} summary={data.summary} />
      <CaseMeta client={data.client} role={data.role} tools={data.tools} year={data.year} tags={data.tags} />
      {(data.problem || data.solution) && (
        <CaseSection title="Brief & Process">
          {data.problem ? <p>{data.problem}</p> : null}
          {data.solution ? <p>{data.solution}</p> : null}
        </CaseSection>
      )}
      <CaseGallery title={data.title} items={gallery} />
      {data.results?.length ? (
        <CaseSection title="Results">
          <ul className="list-disc pl-5">
            {data.results.map((r, i) => (
              <li key={`${r.metric}-${i}`}>{r.metric}: {r.value}{r.note ? ` — ${r.note}` : ""}</li>
            ))}
          </ul>
        </CaseSection>
      ) : null}
    </article>
  )
}
