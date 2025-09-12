import { redirect } from "next/navigation"
import BlogForm from "@/components/admin/BlogForm"
import { createBlogPost } from "../../actions"

export const dynamic = "force-dynamic"

export default function NewBlogPostPage() {
  async function action(formData: FormData) {
    "use server"
    const csv = (v: any) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean)
    const gallery = formData.getAll("gallery[]").map((v) => String(v)).filter(Boolean)
    const payload = {
      title: String(formData.get("title") || ""),
      slug: String(formData.get("slug") || ""),
      coverUrl: String(formData.get("coverUrl") || ""),
      tags: csv(formData.get("tagsCsv")),
      gallery,
      excerpt: String(formData.get("excerpt") || ""),
      body: String(formData.get("body") || ""),
      seo: {
        title: String(formData.get("seo.title") || ""),
        description: String(formData.get("seo.description") || ""),
        keywords: csv(formData.get("seoKeywordsCsv")),
      },
      lang: (formData.get("lang") as any) || "en",
      status: (formData.get("status") as any) || (formData.get("publish") ? "published" : "draft"),
    }
    const id = await createBlogPost(payload)
    redirect(`/admin/content/blog/${id}`)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Blog Post</h1>
      <BlogForm action={action} />
    </div>
  )
}
