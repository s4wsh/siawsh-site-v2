import { redirect } from "next/navigation"
import ProjectForm from "@/components/admin/ProjectForm"
import { createProject } from "../../actions"

export const dynamic = "force-dynamic"

export default function NewProjectPage() {
  async function action(formData: FormData) {
    "use server"
    const csv = (v: any) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean)
    const metricsLabels = formData.getAll("results.metrics.label[]").map(String)
    const metricsValues = formData.getAll("results.metrics.value[]").map(String)
    const metrics = metricsLabels.map((label, i) => ({ label, value: metricsValues[i] || "" }))
    const gallery = formData.getAll("gallery[]").map((v) => String(v)).filter(Boolean)
    const payload = {
      title: String(formData.get("title") || ""),
      slug: String(formData.get("slug") || ""),
      client: String(formData.get("client") || ""),
      coverUrl: String(formData.get("coverUrl") || ""),
      tags: csv(formData.get("tagsCsv")),
      role: csv(formData.get("roleCsv")),
      tools: csv(formData.get("toolsCsv")),
      timeline: { start: String(formData.get("timeline.start") || ""), end: String(formData.get("timeline.end") || "") },
      problem: String(formData.get("problem") || ""),
      approach: String(formData.get("approach") || ""),
      solution: String(formData.get("solution") || ""),
      results: { summary: String(formData.get("results.summary") || ""), metrics },
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
    const id = await createProject(payload)
    redirect(`/admin/content/projects/${id}`)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Case Study</h1>
      <ProjectForm action={action} />
    </div>
  )
}
