import { notFound } from "next/navigation";
import { consumePreviewToken } from "@/lib/preview";
import { getProject, getBlogPost } from "@/app/admin/content/actions";
import CaseHero from "@/components/case/CaseHero";
import CaseMeta from "@/components/case/CaseMeta";
import CaseGallery from "@/components/case/CaseGallery";
import type { Project, BlogPost } from "@/types/content";

export default async function PreviewPage({ params, searchParams }: { params: Promise<{ type: string; id: string }>; searchParams: Promise<{ token?: string }> }) {
  const p = await params;
  const sp = await searchParams;
  const token = sp.token || "";
  const entry = consumePreviewToken(token);
  if (!entry || (entry.type !== (p.type as 'project'|'post') || entry.id !== p.id)) return notFound();

  if (p.type === "project") {
    const data = await getProject(p.id) as Project | null;
    if (!data) return notFound();
    const cover = (data as any).cover || (data as any).coverUrl ? { src: (data as any).cover?.src || (data as any).coverUrl, alt: data.title } : undefined;
    const gallery = ((data as any).gallery || []).map((g: string | { src: string; alt?: string }) => (typeof g === 'string' ? { src: g, alt: data.title } : { src: g.src, alt: g.alt || data.title }));
    return (
      <article className="py-6">
        <CaseHero title={data.title} cover={cover} summary={(data as any).excerpt || (data as any).summary} />
        <CaseMeta client={(data as any).client} role={(data as any).role || []} tools={(data as any).tools || []} year={undefined} tags={(data as any).tags || []} />
        <CaseGallery title={data.title} items={gallery} />
      </article>
    );
  }

  // blog preview
  const post = await getBlogPost(p.id) as BlogPost | null;
  if (!post) return notFound();
  return (
    <article className="py-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{post.title}</h1>
      </header>
      {(post as any).coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={(post as any).coverUrl} alt={post.title} className="mt-4 h-auto w-full rounded-md border object-cover" />
      )}
      {(post as any).excerpt && <p className="mt-4 text-muted-foreground">{(post as any).excerpt}</p>}
    </article>
  );
}
