import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import { Files, Images } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Files className="h-4 w-4" /> Projects
          </CardTitle>
          <CardDescription>Manage your portfolio projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Create, edit, and publish projects.</p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/content">
            <Button>Go to Content</Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blog</CardTitle>
          <CardDescription>Write and manage blog posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Drafts, scheduling, and publishing tools.</p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/content">
            <Button>Go to Content</Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-4 w-4" /> Media
          </CardTitle>
          <CardDescription>Upload and organize images and assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Supports drag-and-drop and folders.</p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/media">
            <Button>Go to Media</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

