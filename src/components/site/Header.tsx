import Link from "next/link"
import { Home } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Home className="h-4 w-4" />
          <span>Siawsh</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">Projects</Link>
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
        </nav>
      </div>
    </header>
  )
}

