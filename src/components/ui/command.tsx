"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type DialogProps = {
  open: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function CommandDialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="absolute left-1/2 top-24 w-[90vw] max-w-xl -translate-x-1/2 rounded-lg border bg-popover text-popover-foreground shadow-lg">
        {children}
      </div>
    </div>
  )
}

export function Command({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg",
        className
      )}
      {...props}
    />
  )
}

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="flex items-center border-b px-3">
        <input
          ref={ref}
          className={cn(
            "h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
CommandInput.displayName = "CommandInput"

export function CommandList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("max-h:[50vh] max-h-[50vh] overflow-y-auto p-1", className)} {...props} />
  )
}

export function CommandGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-1 py-2", className)} {...props} />
  )
}

export function CommandItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-accent",
        className
      )}
      {...props}
    />
  )
}

export function CommandEmpty({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 text-center text-sm text-muted-foreground", className)} {...props} />
  )
}

export function CommandSeparator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("my-1 border-border", className)} {...props} />
}

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("ml-auto text-xs text-muted-foreground", className)} {...props} />
  )
}

export default Command

