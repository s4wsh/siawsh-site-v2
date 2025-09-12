"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { slugify } from "@/lib/slug"
import {
  ProjectInputSchema,
  BlogPostInputSchema,
  ProjectSchema,
  BlogPostSchema,
  type Project,
  type BlogPost,
} from "@/types/content"

// slugify moved to @/lib/slug

const IdSchema = z.string().min(1)

export async function listProjects(opts?: { q?: string; status?: "draft" | "published"; page?: number; limit?: number }) {
  const col = adminDb.collection("projects")
  const snapshot = await col.orderBy("updatedAt", "desc").get()
  let items: Project[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
  if (opts?.q) {
    const q = opts.q.toLowerCase()
    items = items.filter((i) => i.title.toLowerCase().includes(q))
  }
  if (opts?.status) {
    items = items.filter((i) => i.status === opts.status)
  }
  const page = Math.max(1, opts?.page || 1)
  const limit = Math.max(1, Math.min(50, opts?.limit || 10))
  const start = (page - 1) * limit
  const paged = items.slice(start, start + limit)
  return paged.map((i) => ProjectSchema.parse(i))
}

export async function listBlogPosts(opts?: { q?: string; status?: "draft" | "published"; page?: number; limit?: number }) {
  const col = adminDb.collection("blogPosts")
  const snapshot = await col.orderBy("updatedAt", "desc").get()
  let items: BlogPost[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
  if (opts?.q) {
    const q = opts.q.toLowerCase()
    items = items.filter((i) => i.title.toLowerCase().includes(q))
  }
  if (opts?.status) {
    items = items.filter((i) => i.status === opts.status)
  }
  const page = Math.max(1, opts?.page || 1)
  const limit = Math.max(1, Math.min(50, opts?.limit || 10))
  const start = (page - 1) * limit
  const paged = items.slice(start, start + limit)
  return paged.map((i) => BlogPostSchema.parse(i))
}

export async function getProject(id: string) {
  const doc = await adminDb.collection("projects").doc(IdSchema.parse(id)).get()
  if (!doc.exists) return null
  return ProjectSchema.parse({ id: doc.id, ...(doc.data() as any) })
}

export async function getBlogPost(id: string) {
  const doc = await adminDb.collection("blogPosts").doc(IdSchema.parse(id)).get()
  if (!doc.exists) return null
  return BlogPostSchema.parse({ id: doc.id, ...(doc.data() as any) })
}

export async function createProject(input: unknown) {
  const data = ProjectInputSchema.parse(input as any)
  const now = new Date().toISOString()
  const payload = {
    ...data,
    slug: data.slug?.trim() || slugify(data.title),
    publishedAt: data.status === "published" ? data.publishedAt || now : undefined,
    createdAt: now,
    updatedAt: now,
  }
  const exists = await adminDb.collection("projects").where("slug", "==", payload.slug).limit(1).get()
  if (!exists.empty) {
    throw new Error(`Slug already exists: ${payload.slug}`)
  }
  const ref = await adminDb.collection("projects").add(payload)
  revalidatePath("/")
  revalidatePath("/projects")
  if (payload.status === "published") revalidatePath(`/projects/${payload.slug}`)
  return ref.id
}

export async function updateProject(id: unknown, input: unknown) {
  const docId = IdSchema.parse(id)
  const data = ProjectInputSchema.parse(input as any)
  const now = new Date().toISOString()
  const payload: any = {
    ...data,
    slug: data.slug?.trim() || slugify(data.title),
    updatedAt: now,
  }
  if (data.status === "published" && !data.publishedAt) payload.publishedAt = now
  const dup = await adminDb
    .collection("projects")
    .where("slug", "==", payload.slug)
    .limit(1)
    .get()
  if (!dup.empty && dup.docs[0].id !== docId) {
    throw new Error(`Slug already exists: ${payload.slug}`)
  }
  await adminDb.collection("projects").doc(docId).set(payload, { merge: true })
  revalidatePath("/")
  revalidatePath("/projects")
  if (payload.status === "published") revalidatePath(`/projects/${payload.slug}`)
  return docId
}

export async function deleteProject(id: unknown) {
  const docId = IdSchema.parse(id)
  await adminDb.collection("projects").doc(docId).delete()
  revalidatePath("/")
  revalidatePath("/projects")
  return docId
}

export async function createBlogPost(input: unknown) {
  const data = BlogPostInputSchema.parse(input as any)
  const now = new Date().toISOString()
  const payload = {
    ...data,
    slug: data.slug?.trim() || slugify(data.title),
    publishedAt: data.status === "published" ? data.publishedAt || now : undefined,
    createdAt: now,
    updatedAt: now,
  }
  const exists = await adminDb.collection("blogPosts").where("slug", "==", payload.slug).limit(1).get()
  if (!exists.empty) {
    throw new Error(`Slug already exists: ${payload.slug}`)
  }
  const ref = await adminDb.collection("blogPosts").add(payload)
  revalidatePath("/")
  revalidatePath("/blog")
  if (payload.status === "published") revalidatePath(`/blog/${payload.slug}`)
  return ref.id
}

export async function updateBlogPost(id: unknown, input: unknown) {
  const docId = IdSchema.parse(id)
  const data = BlogPostInputSchema.parse(input as any)
  const now = new Date().toISOString()
  const payload: any = {
    ...data,
    slug: data.slug?.trim() || slugify(data.title),
    updatedAt: now,
  }
  if (data.status === "published" && !data.publishedAt) payload.publishedAt = now
  const dup = await adminDb
    .collection("blogPosts")
    .where("slug", "==", payload.slug)
    .limit(1)
    .get()
  if (!dup.empty && dup.docs[0].id !== docId) {
    throw new Error(`Slug already exists: ${payload.slug}`)
  }
  await adminDb.collection("blogPosts").doc(docId).set(payload, { merge: true })
  revalidatePath("/")
  revalidatePath("/blog")
  if (payload.status === "published") revalidatePath(`/blog/${payload.slug}`)
  return docId
}

export async function deleteBlogPost(id: unknown) {
  const docId = IdSchema.parse(id)
  await adminDb.collection("blogPosts").doc(docId).delete()
  revalidatePath("/")
  revalidatePath("/blog")
  return docId
}
