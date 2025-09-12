import { notFound, redirect } from "next/navigation"
import BlogForm from "@/components/admin/BlogForm"
import { getBlogPost, updateBlogPost } from "../../actions"

export const dynamic = "force-dynamic"

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
    redirect(`/admin/content?tab=blog`)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Blog Post</h1>
      <BlogForm action={action} isEdit defaultValues={post} />
    </div>
  )
}
