"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { projectConverter, blogConverter } from "@/lib/db";
import { ProjectSchema, BlogPostSchema, type Project, type BlogPost } from "@/types/content";

export type CreateProjectInput = Omit<Project, "id"> & { id?: string };
export type UpdateProjectInput = Partial<CreateProjectInput>;
export type CreateBlogInput = Omit<BlogPost, "id"> & { id?: string };
export type UpdateBlogInput = Partial<CreateBlogInput>;

export async function slugExists(kind: "projects" | "blogPosts", slug: string): Promise<boolean> {
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
  const col = adminDb.collection("blogPosts").withConverter(blogConverter);
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
  const doc = await adminDb.collection("blogPosts").withConverter(blogConverter).doc(id).get();
  return doc.exists ? (doc.data() as BlogPost) : null;
}

export async function createProject(data: CreateProjectInput) {
  const parsed = ProjectSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid project data");
  const now = new Date().toISOString();
  const doc = { ...parsed.data, updatedAt: now, publishedAt: parsed.data.status === "published" ? now : parsed.data.publishedAt } as Project;
  await adminDb.collection("projects").withConverter(projectConverter).doc(doc.slug).set(doc);
  revalidatePath("/projects");
  if (doc.status === "published") revalidatePath(`/projects/${doc.slug}`);
  return { ok: true, id: doc.slug };
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  const now = new Date().toISOString();
  const patch = { ...data, updatedAt: now } as Partial<Project>;
  await adminDb.collection("projects").withConverter(projectConverter).doc(id).set(patch, { merge: true });
  revalidatePath("/projects");
  if (patch.status === "published") revalidatePath(`/projects/${data.slug || id}`);
  return { ok: true };
}

export async function deleteProject(id: string) {
  await adminDb.collection("projects").doc(id).delete();
  revalidatePath("/projects");
  return { ok: true };
}

export async function createBlogPost(data: CreateBlogInput) {
  const parsed = BlogPostSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid blog data");
  const now = new Date().toISOString();
  const doc = { ...parsed.data, updatedAt: now, publishedAt: parsed.data.status === "published" ? now : parsed.data.publishedAt } as BlogPost;
  await adminDb.collection("blogPosts").withConverter(blogConverter).doc(doc.slug).set(doc);
  revalidatePath("/blog");
  if (doc.status === "published") {
    revalidatePath(`/blog/${doc.slug}`);
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paths: ["/blog", `/blog/${doc.slug}`] }),
      });
    } catch {}
  }
  return { ok: true, id: doc.slug };
}

export async function updateBlogPost(id: string, data: UpdateBlogInput) {
  const now = new Date().toISOString();
  const patch = { ...data, updatedAt: now } as Partial<BlogPost>;
  await adminDb.collection("blogPosts").withConverter(blogConverter).doc(id).set(patch, { merge: true });
  revalidatePath("/blog");
  if (patch.status === "published") {
    const path = `/blog/${data.slug || id}`;
    revalidatePath(path);
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paths: ["/blog", path] }),
      });
    } catch {}
  }
  return { ok: true };
}

export async function deleteBlogPost(id: string) {
  await adminDb.collection("blogPosts").doc(id).delete();
  revalidatePath("/blog");
  return { ok: true };
}
