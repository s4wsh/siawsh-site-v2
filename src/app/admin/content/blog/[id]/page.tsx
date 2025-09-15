import { notFound, redirect } from "next/navigation"
import BlogForm from "@/components/admin/BlogForm"
import { getBlogPost, updateBlogPost } from "../../actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const post = await getBlogPost(p.id)
  if (!post) return notFound()

  async function action(formData: FormData) {
    "use server"
    const b = post!
    const csv = (v: any) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean)
    const gallery = formData.getAll("gallery[]").map((v) => String(v)).filter(Boolean)
    const payload = {
      title: String(formData.get("title") || ""),
      slug: String(formData.get("slug") || ""),
      coverUrl: String(formData.get("coverUrl") || ""),
      tags: csv(formData.get("tagsCsv")),
      gallery: gallery.length ? gallery : b.gallery,
      excerpt: String(formData.get("excerpt") || ""),
      body: String(formData.get("body") || ""),
      seo: {
        title: String(formData.get("seo.title") || (b as any)?.seo?.title || ""),
        description: String(formData.get("seo.description") || (b as any)?.seo?.description || ""),
        keywords: csv(formData.get("seoKeywordsCsv")) || (b as any)?.seo?.keywords || [],
      },
      lang: (formData.get("lang") as any) || b.lang,
      status: (formData.get("status") as any) || (formData.get("publish") ? "published" : b.status),
      publishedAt: b.publishedAt,
    }
    await updateBlogPost(b.id!, payload)
    redirect(`/admin/content?kind=blog`)
  }

  async function autosave(fd: FormData) {
    "use server"
    const b = post!;
    const patch: any = {
      title: String(fd.get("title") || ""),
      slug: String(fd.get("slug") || b.slug || ""),
      coverUrl: String(fd.get("coverUrl") || b.coverUrl || ""),
      excerpt: String(fd.get("excerpt") || b.excerpt || ""),
      status: b.status || "draft",
    }
    await updateBlogPost(b.id!, patch)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Blog Post</h1>
      <form action={async () => {
        "use server"
        const slug = (post as any).slug || post.id
        const path = `/blog/${slug}`
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
        // Revalidate list + detail
        const { revalidatePath } = await import("next/cache")
        revalidatePath("/blog")
        revalidatePath(path)
        try {
          const url = baseUrl ? `${baseUrl}/api/revalidate` : "/api/revalidate"
          await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ paths: ["/blog", path] }),
          })
        } catch {}
      }}>
        <button type="submit" className="rounded-full border px-3 py-1 text-sm">Publish now</button>
      </form>
      <BlogForm action={action} isEdit defaultValues={post} autosave={autosave} />
    </div>
  )
}
