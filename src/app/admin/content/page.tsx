import Link from "next/link"
import { listProjects, listBlogPosts, deleteProject, deleteBlogPost } from "./actions"
import Button from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DeleteButton from "@/components/admin/DeleteButton"

export const dynamic = "force-dynamic"

type SearchParams = {
  tab?: "case-studies" | "blog"
  q?: string
  status?: "draft" | "published"
  page?: string | number
}

export default async function ContentPage({ searchParams }: { searchParams: SearchParams }) {
  const tab = searchParams.tab === "blog" ? "blog" : "case-studies"
  const q = searchParams.q?.toString() || ""
  const status = (searchParams.status as "draft" | "published" | undefined) || undefined
  const page = Math.max(1, Number(searchParams.page || 1))
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

  const currentValue = tab
  const makeHref = (nextTab: "case-studies" | "blog", nextPage?: number) =>
    `/admin/content?tab=${nextTab}${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}${(nextPage || page) > 1 ? `&page=${nextPage || page}` : ""}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={currentValue} defaultValue="case-studies">
          <TabsList>
            <TabsTrigger value="case-studies" href={makeHref("case-studies", 1)}>Case Studies</TabsTrigger>
            <TabsTrigger value="blog" href={makeHref("blog", 1)}>Blog</TabsTrigger>
          </TabsList>
        </Tabs>
        <div>
          {tab === "case-studies" ? (
            <Link href="/admin/content/projects/new">
              <Button>New</Button>
            </Link>
          ) : (
            <Link href="/admin/content/blog/new">
              <Button>New</Button>
            </Link>
          )}
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/content" method="get">
        <input type="hidden" name="tab" value={tab} />
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
      </form>

      <Tabs value={currentValue} defaultValue="case-studies">
        <TabsContent value="case-studies">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">Client</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Updated</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2">{(p as any).client || "-"}</td>
                  <td className="px-3 py-2 capitalize">{p.status}</td>
                  <td className="px-3 py-2">{p.updatedAt?.slice(0, 19).replace("T", " ")}</td>
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
                <Link href={makeHref("case-studies", page - 1)}>
                  <Button size="sm" variant="outline">Previous</Button>
                </Link>
              )}
              {projects.length === limit && (
                <Link href={makeHref("case-studies", page + 1)}>
                  <Button size="sm" variant="outline">Next</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        </TabsContent>
        <TabsContent value="blog">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Updated</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2 capitalize">{p.status}</td>
                  <td className="px-3 py-2">{p.updatedAt?.slice(0, 19).replace("T", " ")}</td>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
