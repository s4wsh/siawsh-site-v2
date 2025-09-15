"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { projectConverter, blogConverter } from "@/lib/db";
import { ProjectZ, BlogZ, type Project, type BlogPost } from "@/types/content";
import { Timestamp, FieldValue } from "@/lib/firebase-admin";
import { stripUndefinedDeep } from "@/lib/clean";

export type CreateProjectInput = Omit<Project, "id"> & { id?: string };
export type UpdateProjectInput = Partial<CreateProjectInput>;
export type CreateBlogInput = Omit<BlogPost, "id"> & { id?: string };
export type UpdateBlogInput = Partial<CreateBlogInput>;

export async function slugExists(kind: "projects" | "blog", slug: string): Promise<boolean> {
  const snap = await adminDb.collection(kind).doc(slug).get();
  return snap.exists;
}

export async function listProjects(opts?: { q?: string; status?: "draft" | "published"; page?: number; limit?: number }) {
  const col = adminDb.collection("projects").withConverter(projectConverter);
  const snapshot = await col.orderBy("updatedAt", "desc").get();
  let items: Project[] = snapshot.docs.map((d) => d.data());
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q));
  }
  if (opts?.status) items = items.filter((i) => i.status === opts.status);
  const page = Math.max(1, opts?.page || 1);
  const limit = Math.max(1, Math.min(50, opts?.limit || 10));
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export async function listBlogPosts(opts?: { q?: string; status?: "draft" | "published"; page?: number; limit?: number }) {
  const col = adminDb.collection("blog").withConverter(blogConverter);
  const snapshot = await col.orderBy("updatedAt", "desc").get();
  let items: BlogPost[] = snapshot.docs.map((d) => d.data());
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q));
  }
  if (opts?.status) items = items.filter((i) => i.status === opts.status);
  const page = Math.max(1, opts?.page || 1);
  const limit = Math.max(1, Math.min(50, opts?.limit || 10));
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export async function getProject(id: string) {
  const doc = await adminDb.collection("projects").withConverter(projectConverter).doc(id).get();
  return doc.exists ? (doc.data() as Project) : null;
}

export async function getBlogPost(id: string) {
  const doc = await adminDb.collection("blog").withConverter(blogConverter).doc(id).get();
  return doc.exists ? (doc.data() as BlogPost) : null;
}

export async function createProject(data: CreateProjectInput) {
  const validated = ProjectZ.safeParse(data);
  if (!validated.success) throw new Error("Invalid project data");
  // Prevent slug collision
  if (await slugExists("projects", (data as any).slug)) {
    throw new Error("Slug already exists for a project");
  }
  const now = FieldValue.serverTimestamp();
  const base: Partial<Project> = { ...(data as any), updatedAt: now };
  if ((data as any).status === "published") (base as any).publishedAt = now;
  const doc = stripUndefinedDeep(base) as Project;
  (doc as any).lang = (doc as any).lang || "en";
  await adminDb.collection("projects").withConverter(projectConverter).doc(doc.slug!).set(doc);
  revalidatePath("/projects");
  if (doc.status === "published") {
    const path = `/projects/${doc.slug}`;
    revalidatePath(path);
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL;
      const url = base ? `${base}/api/revalidate` : "/api/revalidate";
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paths: ["/projects", path] }),
      });
    } catch {}
  }
  return { ok: true, id: doc.slug };
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  const now = FieldValue.serverTimestamp();
  const base: Partial<Project> = { ...(data as any), updatedAt: now };
  if ((data as any).status === "published" && !(data as any).publishedAt) (base as any).publishedAt = now;
  const patch = stripUndefinedDeep(base) as Partial<Project>;
  await adminDb.collection("projects").withConverter(projectConverter).doc(id).set(patch, { merge: true });
  revalidatePath("/projects");
  if (patch.status === "published") {
    const path = `/projects/${data.slug || id}`;
    revalidatePath(path);
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL;
      const url = base ? `${base}/api/revalidate` : "/api/revalidate";
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paths: ["/projects", path] }),
      });
    } catch {}
  }
  return { ok: true };
}

export async function deleteProject(id: string) {
  await adminDb.collection("projects").doc(id).delete();
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { ok: true };
}

export async function createBlogPost(data: CreateBlogInput) {
  const validated = BlogZ.safeParse(data);
  if (!validated.success) throw new Error("Invalid blog data");
  // Prevent slug collision
  if (await slugExists("blog", (data as any).slug)) {
    throw new Error("Slug already exists for a blog post");
  }
  const now = FieldValue.serverTimestamp();
  const status = (data as any)?.status === "published" ? "published" : "draft";
  const base: Partial<BlogPost> = { ...(data as any), status, updatedAt: now };
  if (status === "published") (base as any).publishedAt = now;
  const doc = stripUndefinedDeep(base) as Partial<BlogPost> & { slug: string };
  (doc as any).lang = (doc as any).lang || "en";
  await adminDb.collection("blog").withConverter(blogConverter).doc(String(doc.slug)).set(doc, { merge: true });
  revalidatePath("/blog");
  if (status === "published") {
    revalidatePath(`/blog/${doc.slug}`);
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL;
      const url = base ? `${base}/api/revalidate` : "/api/revalidate";
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paths: ["/blog", `/blog/${doc.slug}`] }),
      });
    } catch {}
  }
  return { ok: true, id: doc.slug };
}

export async function updateBlogPost(id: string, data: UpdateBlogInput) {
  const now = FieldValue.serverTimestamp();
  const status = (data as any)?.status === "published" ? "published" : ((data as any)?.status || "draft");
  const base: Partial<BlogPost> = { ...(data as any), status, updatedAt: now };
  if (status === "published" && !(data as any).publishedAt) (base as any).publishedAt = now;
  const patch = stripUndefinedDeep(base) as Partial<BlogPost>;
  await adminDb.collection("blog").withConverter(blogConverter).doc(id).set(patch, { merge: true });
  revalidatePath("/blog");
  const path = `/blog/${(data as any)?.slug || id}`;
  revalidatePath(path);
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const url = baseUrl ? `${baseUrl}/api/revalidate` : "/api/revalidate";
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paths: ["/blog", path] }),
    });
  } catch {}
  return { ok: true };
}

export async function deleteBlogPost(id: string) {
  await adminDb.collection("blog").doc(id).delete();
  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
  return { ok: true };
}
