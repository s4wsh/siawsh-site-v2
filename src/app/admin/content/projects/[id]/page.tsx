import { notFound, redirect } from "next/navigation"
import ProjectForm from "@/components/admin/ProjectForm"
import { getProject, updateProject } from "../../actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const project = await getProject(p.id)
  if (!project) return notFound()

  async function action(formData: FormData) {
    "use server"
    const proj = project!
    const csv = (v: any) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean)
    const metricsLabels = formData.getAll("results.metrics.label[]").map(String)
    const metricsValues = formData.getAll("results.metrics.value[]").map(String)
    const metrics = metricsLabels.map((label, i) => ({ label, value: metricsValues[i] || "" }))
    const gallery = formData.getAll("gallery[]").map((v) => String(v)).filter(Boolean)
    const payload = {
      title: String(formData.get("title") || ""),
      slug: String(formData.get("slug") || ""),
      client: String(formData.get("client") || proj.client || ""),
      coverUrl: String(formData.get("coverUrl") || ""),
      tags: csv(formData.get("tagsCsv")),
      role: csv(formData.get("roleCsv")),
      tools: csv(formData.get("toolsCsv")),
      timeline: { start: String(formData.get("timeline.start") || (proj as any).timeline?.start || ""), end: String(formData.get("timeline.end") || (proj as any).timeline?.end || "") },
      problem: String(formData.get("problem") || proj.problem || ""),
      approach: String(formData.get("approach") || proj.approach || ""),
      solution: String(formData.get("solution") || proj.solution || ""),
      results: { summary: String(formData.get("results.summary") || (proj as any)?.results?.summary || ""), metrics },
      gallery: gallery.length ? gallery : proj.gallery,
      excerpt: String(formData.get("excerpt") || proj.excerpt || ""),
      body: String(formData.get("body") || proj.body || ""),
      seo: {
        title: String(formData.get("seo.title") || (proj as any)?.seo?.title || ""),
        description: String(formData.get("seo.description") || (proj as any)?.seo?.description || ""),
        keywords: csv(formData.get("seoKeywordsCsv")) || (proj as any)?.seo?.keywords || [],
      },
      lang: (formData.get("lang") as any) || proj.lang,
      status: (formData.get("status") as any) || (formData.get("publish") ? "published" : proj.status),
      publishedAt: proj.publishedAt,
    }
    await updateProject(proj.id!, payload)
    redirect(`/admin/content?kind=cases`)
  }

  async function autosave(fd: FormData) {
    "use server"
    const proj = project!;
    const patch: any = {
      title: String(fd.get("title") || ""),
      slug: String(fd.get("slug") || proj.slug || ""),
      coverUrl: String(fd.get("coverUrl") || proj.coverUrl || ""),
      client: String(fd.get("client") || proj.client || ""),
      excerpt: String(fd.get("excerpt") || proj.excerpt || ""),
      status: proj.status || "draft",
    }
    await updateProject(proj.id!, patch)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Case Study</h1>
      <form action={async () => {
        "use server"
        const slug = (project as any).slug || project.id
        const path = `/projects/${slug}`
        const { revalidatePath } = await import("next/cache")
        revalidatePath("/projects")
        revalidatePath(path)
        try {
          const base = process.env.NEXT_PUBLIC_SITE_URL
          const url = base ? `${base}/api/revalidate` : "/api/revalidate"
          await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ paths: ["/projects", path] }),
          })
        } catch {}
      }}>
        <button type="submit" className="rounded-full border px-3 py-1 text-sm">Publish now</button>
      </form>
      <ProjectForm action={action} isEdit defaultValues={project} autosave={autosave} />
    </div>
  )
}
