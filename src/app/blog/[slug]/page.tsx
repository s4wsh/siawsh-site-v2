import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { adminDb } from "@/lib/firebase-admin"
import { blogConverter } from "@/lib/db"
import type { BlogPost } from "@/types/content"
import Image from "next/image"

export const dynamic = "force-dynamic"
export const revalidate = 300
export const dynamicParams = true

async function fetchBySlug(slug: string): Promise<BlogPost | null> {
  const snap = await adminDb.collection("blogPosts").withConverter(blogConverter).where("slug", "==", slug).limit(1).get()
  if (snap.empty) return null
  const doc = snap.docs[0]
  const data = doc.data() as BlogPost
  if ((data as any).status !== "published") return null
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await params
  const data = await fetchBySlug(p.slug)
  if (!data) return {}
  const seo = (data as any).seo || {}
  const title = seo.title || `${data.title} — Blog`
  const description = seo.description || (data.excerpt || data.title)
  return {
    title,
    description,
    alternates: { canonical: `/blog/${data.slug}` },
    openGraph: {
      title,
      description,
      images: data.coverUrl ? [{ url: data.coverUrl }] : undefined,
      type: "article",
      publishedTime: data.publishedAt,
    },
  }
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params
  const data = await fetchBySlug(p.slug)
  if (!data) return notFound()

  // Find previous (newer) and next (older) posts based on publishedAt
  let prev: BlogPost | null = null
  let next: BlogPost | null = null
  try {
    const snap = await adminDb.collection("blogPosts").withConverter(blogConverter).orderBy("publishedAt", "desc").get()
    const list = snap.docs
      .map((d) => d.data())
      .filter((p) => p.status === "published" && p.publishedAt)
    const idx = list.findIndex((p) => p.slug === data.slug)
    if (idx > 0) prev = list[idx - 1]
    if (idx >= 0 && idx < list.length - 1) next = list[idx + 1]
  } catch {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    datePublished: data.publishedAt,
    inLanguage: data.lang,
    image: data.coverUrl ? [data.coverUrl] : undefined,
    keywords: (data.tags || []).join(", "),
    description: data.excerpt,
  }

  return (
    <article className="py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <div className="text-sm text-muted-foreground">{data.publishedAt?.slice(0, 10)}</div>
        <div className="flex flex-wrap gap-1 text-xs">
          {(data.tags || []).map((t) => (
            <span key={t} className="rounded bg-muted px-2 py-0.5 text-muted-foreground">{t}</span>
          ))}
        </div>
      </header>
      {data.coverUrl && (
        <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
          <Image src={data.coverUrl} alt={data.title} fill sizes="100vw" className="object-cover" />
        </div>
      )}
      {data.excerpt && (
        <section className="prose mt-6 max-w-none">
          <h2 className="mb-2 text-lg font-semibold">Introduction</h2>
          <p className="text-muted-foreground">{data.excerpt}</p>
        </section>
      )}

      {(data as any).problem && (
        <section className="prose mt-6 max-w-none">
          <h2 className="mb-2 text-lg font-semibold">Problem</h2>
          <div className="whitespace-pre-wrap leading-7">{(data as any).problem}</div>
        </section>
      )}
      {(data as any).approach && (
        <section className="prose mt-6 max-w-none">
          <h2 className="mb-2 text-lg font-semibold">Approach</h2>
          <div className="whitespace-pre-wrap leading-7">{(data as any).approach}</div>
        </section>
      )}
      {(data as any).solution && (
        <section className="prose mt-6 max-w-none">
          <h2 className="mb-2 text-lg font-semibold">Solution</h2>
          <div className="whitespace-pre-wrap leading-7">{(data as any).solution}</div>
        </section>
      )}
      {(data as any).results && (
        <section className="prose mt-6 max-w-none">
          <h2 className="mb-2 text-lg font-semibold">Results</h2>
          <div className="whitespace-pre-wrap leading-7">{(data as any).results}</div>
        </section>
      )}

      {data.body && (
        <section className="prose mt-6 max-w-none">
          <h2 className="mb-2 text-lg font-semibold">Full Article</h2>
          {/* TODO: swap to a markdown renderer if installed */}
          <div className="whitespace-pre-wrap leading-7">{data.body}</div>
        </section>
      )}

      {(prev || next) && (
        <nav className="mt-10 flex items-center justify-between border-t pt-4 text-sm">
          <div>
            {prev && (
              <Link href={`/blog/${prev.slug}`} className="hover:underline">← {prev.title}</Link>
            )}
          </div>
          <div>
            {next && (
              <Link href={`/blog/${next.slug}`} className="hover:underline">{next.title} →</Link>
            )}
          </div>
        </nav>
      )}
    </article>
  )
}
