import * as React from "react"
import { cn } from "@/lib/utils"

export function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted text-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return (
    <span className="flex h-full w-full items-center justify-center text-xs font-medium">
      {children}
    </span>
  )
}

