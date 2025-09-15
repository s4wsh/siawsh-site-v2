import Link from "next/link"
import { listProjects, listBlogPosts, deleteProject, deleteBlogPost } from "./actions"
import Button from "@/components/ui/button"
import DeleteButton from "@/components/admin/DeleteButton"
import FuzzySearchFilter from "@/components/admin/FuzzySearchFilter"
import { toHuman } from "@/lib/dates"
import SegmentTabs from "@/components/ui/SegmentTabs"
import StatusChip from "@/components/admin/StatusChip"
import AspectImage from "@/components/ui/AspectImage"

export const dynamic = "force-dynamic"
export const revalidate = 0

type SearchParams = {
  kind?: "cases" | "blog"
  q?: string
  status?: "draft" | "published"
  page?: string | number
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const kind = sp.kind === "blog" ? "blog" : "cases"
  const q = sp.q?.toString() || ""
  const status = (sp.status as "draft" | "published" | undefined) || undefined
  const page = Math.max(1, Number(sp.page || 1))
  const limit = 10

  const [projects, posts] = await Promise.all([
    listProjects({ q, status, page, limit }),
    listBlogPosts({ q, status, page, limit }),
  ])

  async function onDeleteProject(formData: FormData) {
    "use server"
    const id = String(formData.get("id") || "")
    if (id) await deleteProject(id)
  }

  async function onDeletePost(formData: FormData) {
    "use server"
    const id = String(formData.get("id") || "")
    if (id) await deleteBlogPost(id)
  }

  const makeHref = (nextKind: "cases" | "blog", nextPage?: number) =>
    `/admin/content?kind=${nextKind}${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}${(nextPage || page) > 1 ? `&page=${nextPage || page}` : ""}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SegmentTabs basePath="/admin/content" />
        <div>
          {kind === "cases" ? (
            <Link href="/admin/content/projects/new">
              <Button className="neon-glow">New</Button>
            </Link>
          ) : (
            <Link href="/admin/content/blog/new">
              <Button className="neon-glow">New</Button>
            </Link>
          )}
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/content" method="get">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="page" value="1" />
        <input
          name="q"
          placeholder="Search by title..."
          defaultValue={q}
          className="h-9 w-60 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        />
        <select
          name="status"
          defaultValue={status || ""}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <Button type="submit" variant="outline" size="sm">Apply</Button>
        <div className="ml-2">
          <FuzzySearchFilter targetId={kind === "cases" ? "table-cases" : "table-blog"} />
        </div>
      </form>

      {kind === "cases" ? (
        <div id="table-case-studies" className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium w-28">Cover</th>
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">Client</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Updated</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t" data-title={(p.title || "").toLowerCase()}>
                  <td className="px-3 py-2 w-28">
                    {((p as any).cover?.url || (p as any).coverUrl) ? (
                      <AspectImage
                        src={(p as any).cover?.url || (p as any).coverUrl}
                        alt={p.title}
                        ratio="1/1"
                        radius="12px"
                        fill
                        sizes="112px"
                      />
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    {p.slug ? (
                      <Link href={`/projects/${p.slug}`} className="hover:underline" prefetch>
                        {p.title}
                      </Link>
                    ) : (
                      p.title
                    )}
                  </td>
                  <td className="px-3 py-2">{(p as any).client || "-"}</td>
                  <td className="px-3 py-2"><StatusChip status={p.status} /></td>
                  <td className="px-3 py-2">{toHuman(p.updatedAt as any) || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/content/projects/${p.id}`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                      <form action={onDeleteProject}>
                        <input type="hidden" name="id" value={p.id} />
                        <DeleteButton>Delete</DeleteButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            <div className="flex items-center justify-between p-2 text-sm">
              <div>
              Page {page}
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                <Link href={makeHref("cases", page - 1)}>
                  <Button size="sm" variant="outline">Previous</Button>
                </Link>
                )}
                {projects.length === limit && (
                <Link href={makeHref("cases", page + 1)}>
                  <Button size="sm" variant="outline">Next</Button>
                </Link>
                )}
              </div>
            </div>
          </div>
      ) : (
        <div id="table-blog" className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium w-28">Cover</th>
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Updated</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t" data-title={(p.title || "").toLowerCase()}>
                  <td className="px-3 py-2 w-28">
                    {((p as any).cover?.url || (p as any).coverUrl) ? (
                      <AspectImage
                        src={(p as any).cover?.url || (p as any).coverUrl}
                        alt={p.title}
                        ratio="1/1"
                        radius="12px"
                        fill
                        sizes="112px"
                      />
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    {p.slug ? (
                      <Link href={`/blog/${p.slug}`} className="hover:underline" prefetch>
                        {p.title}
                      </Link>
                    ) : (
                      p.title
                    )}
                  </td>
                  <td className="px-3 py-2"><StatusChip status={p.status} /></td>
                  <td className="px-3 py-2">{toHuman(p.updatedAt as any) || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/content/blog/${p.id}`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                      <form action={onDeletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <DeleteButton>Delete</DeleteButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            <div className="flex items-center justify-between p-2 text-sm">
              <div>
              Page {page}
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={makeHref("blog", page - 1)}>
                    <Button size="sm" variant="outline">Previous</Button>
                  </Link>
                )}
                {posts.length === limit && (
                  <Link href={makeHref("blog", page + 1)}>
                    <Button size="sm" variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  )
}
