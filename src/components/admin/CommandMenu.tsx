"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type Item = { label: string; href: string }

const items: Item[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Content", href: "/admin/content?kind=cases" },
  { label: "Media", href: "/admin/media" },
  { label: "Settings", href: "/admin/settings" },
  { label: "New Case Study", href: "/admin/content/projects/new" },
  { label: "New Blog", href: "/admin/content/blog/new" },
]

export default function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "k")) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    const onOpenRequest = () => setOpen(true)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("open-command-menu", onOpenRequest as EventListener)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("open-command-menu", onOpenRequest as EventListener)
    }
  }, [])

  const filtered = items.filter((it) =>
    it.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput
          autoFocus
          placeholder="Type a command or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <CommandList>
          {filtered.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          <CommandGroup>
            {filtered.map((it) => (
              <CommandItem
                key={it.href}
                onClick={() => {
                  setOpen(false)
                  setQuery("")
                  router.push(it.href)
                }}
              >
                <span>{it.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
