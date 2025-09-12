"use client"

import Button from "@/components/ui/button"

export default function DeleteButton({ children }: { children?: React.ReactNode }) {
  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={(e) => {
        const ok = window.confirm("Delete this item? This cannot be undone.")
        if (!ok) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {children ?? "Delete"}
    </Button>
  )
}

