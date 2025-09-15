import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPostBySlug, loadBlog } from "@/lib/content/blog"
import Prose from "@/components/blog/Prose"
import AspectImage from "@/components/ui/AspectImage"
import { blogJsonLd, canonical } from "@/lib/seo"

export const revalidate = 60
export const dynamicParams = true
export const dynamic = 'error'

type P = { slug: string }

export async function generateMetadata({ params }: { params: Promise<P> }): Promise<Metadata> {
  const p = await params;
  const data = await getPostBySlug(p.slug)
  if (!data) {
    return {
      title: "Post not found",
      description: "This post is unavailable.",
      alternates: { canonical: canonical(`/blog/${p.slug}`) },
    }
  }
  const title = `${data.title} — Insights`
  const description = data.excerpt || `Strategy in motion: ${data.title}`
  return {
    title,
    description,
    alternates: { canonical: canonical(`/blog/${data.slug}`) },
    openGraph: {
      title,
      description,
      images: data.cover?.src ? [{ url: data.cover.src }] : ["/og/default-og.png"],
      type: "article",
      publishedTime: data.date,
    },
  }
}

export default async function BlogDetail({ params }: { params: Promise<P> }) {
  const p = await params;
  const data = await getPostBySlug(p.slug)
  if (!data) return notFound();

  const jsonLd = blogJsonLd(data)

  const toc = data.headings.filter((h) => h.depth === 2)

  const all = await loadBlog();
  const related = all.filter((x) => x.slug !== data.slug && (x.tags || []).some((t) => (data.tags || []).includes(t))).slice(0, 3);

  return (
    <article className="py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <div className="text-sm text-muted-foreground">
          <span>{data.date.slice(0, 10)}</span>
          <span> • {data.readingMinutes} min read</span>
        </div>
      </header>

      {data.cover ? (
        <AspectImage src={data.cover.src} alt={data.cover.alt || data.title} fill sizes="100vw" wrapperClassName="rounded-2xl aspect-[16/9] md:aspect-[21/9]" />
      ) : null}

      {data.excerpt && (
        <section className="mt-6 max-w-none text-muted-foreground">
          <p>{data.excerpt}</p>
        </section>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px] lg:items-start prose prose-neutral dark:prose-invert max-w-none prose-figcaption:text-xs prose-figcaption:text-muted-foreground prose-figcaption:text-center">
        <Prose html={data.html} />
        {!!toc.length && (
          <aside className="lg:sticky lg:top-24 border rounded-md p-3 text-sm hidden lg:block">
            <div className="font-medium mb-2">On this page</div>
            <ul className="space-y-1">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="hover:underline">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      <nav className="mt-10 border-t pt-4 text-sm">
        <Link href="/blog" className="hover:underline">← Back to Blog</Link>
      </nav>

      {related.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Related posts</h2>
          <ul className="list-disc pl-5 text-sm">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} className="hover:underline">{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}

export async function generateStaticParams() {
  const items = await loadBlog();
  return items.map((p) => ({ slug: p.slug }));
}
