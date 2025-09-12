"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Button from "@/components/ui/button"
import CommandMenu from "@/components/admin/CommandMenu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Home, Files, Images, Settings, Menu, User } from "lucide-react"
import { clientAuth } from "@/lib/firebase-client"
import { signOut as fbSignOut } from "firebase/auth"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/content", label: "Content", icon: Files },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminShell({ children, title }: { children: ReactNode; title?: ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  function Sidebar() {
    return (
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-sidebar">
        <div className="h-14 shrink-0 border-b px-4 flex items-center font-semibold">
          Admin
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    )
  }

  function MobileSheet() {
    return (
      <div>
        <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 bg-sidebar border-r shadow-lg p-2 flex flex-col">
              <div className="h-14 shrink-0 border-b px-4 flex items-center justify-between">
                <span className="font-semibold">Admin</span>
                <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
                  Close
                </Button>
              </div>
              <nav className="flex-1 p-2 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href))
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 h-14 border-b bg-background px-4">
          <div className="flex h-14 items-center gap-3">
            <div className="md:hidden">
              <MobileSheet />
            </div>
            <div className="flex-1 font-semibold truncate">
              {title ?? "Admin"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                title="Command Menu"
                onClick={() => {
                  // Signal the global command menu to open
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("open-command-menu"))
                  }
                }}
              >
                ⌘K
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  title="User menu"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-md border bg-popover text-popover-foreground shadow">
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                      onClick={async () => {
                        try {
                          await fbSignOut(clientAuth)
                        } finally {
                          router.push("/signin")
                        }
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
        {/* Global Command Menu */}
        <CommandMenu />
      </div>
    </div>
  )
}

export default AdminShell
