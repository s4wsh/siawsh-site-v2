import { z } from "zod"

export const LangSchema = z.union([z.literal("en"), z.literal("tr"), z.literal("fa")])
export type Lang = z.infer<typeof LangSchema>

export const StatusSchema = z.union([z.literal("draft"), z.literal("published")])
export type Status = z.infer<typeof StatusSchema>

// CaseStudy (aka Project)
export const CaseStudySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  client: z.string().optional(),
  coverUrl: z.string().url().optional(),
  gallery: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  role: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  timeline: z
    .object({ start: z.string().optional(), end: z.string().optional() })
    .optional(),
  problem: z.string().optional(),
  approach: z.string().optional(),
  solution: z.string().optional(),
  excerpt: z.string().optional(),
  results: z
    .object({
      summary: z.string().optional(),
      metrics: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
  body: z.string().optional(),
  lang: LangSchema,
  status: StatusSchema,
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
})
export type CaseStudy = z.infer<typeof CaseStudySchema>

// BlogPost (as before)
export const BlogPostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  coverUrl: z.string().url().optional(),
  gallery: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  lang: LangSchema,
  status: StatusSchema,
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
})
export type BlogPost = z.infer<typeof BlogPostSchema>

// Compatibility: Project = CaseStudy
export const ProjectSchema = CaseStudySchema
export type Project = z.infer<typeof ProjectSchema>

// Create/Update payloads for forms (no id, timestamps handled server-side)
export const ProjectInputSchema = ProjectSchema.omit({ id: true, createdAt: true, updatedAt: true })
export type ProjectInput = z.infer<typeof ProjectInputSchema>

export const BlogPostInputSchema = BlogPostSchema.omit({ id: true, createdAt: true, updatedAt: true })
export type BlogPostInput = z.infer<typeof BlogPostInputSchema>

// Admin table column types
export type TableRowBase = {
  id: string
  title: string
  status: Status
  updatedAt?: string
}
export type CaseStudyTableRow = TableRowBase
export type BlogPostTableRow = TableRowBase
export type AdminTableColumnKey = "title" | "status" | "updatedAt" | "actions"
