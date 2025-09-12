import * as React from "react"
import { cn } from "@/lib/utils"

type TabsContextType = { value: string }
const TabsCtx = React.createContext<TabsContextType | null>(null)

export function Tabs({ value, defaultValue, className, children }: { value?: string; defaultValue?: string; className?: string; children?: React.ReactNode }) {
  const v = value ?? defaultValue ?? ""
  return (
    <TabsCtx.Provider value={{ value: v }}>
      <div className={cn("w-full", className)}>{children}
      </div>
    </TabsCtx.Provider>
  )
}

export function TabsList({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("inline-flex h-9 items-center rounded-lg border p-1", className)}>{children}</div>
}

export function TabsTrigger({ value, asChild, href, className, children }: { value: string; asChild?: boolean; href?: string; className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)!
  const active = ctx?.value === value
  const Comp: any = href ? "a" : "button"
  return (
    <Comp
      href={href}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-foreground hover:bg-accent",
        className
      )}
    >
      {children}
    </Comp>
  )
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)!
  const active = ctx?.value === value
  return <div className={cn(active ? "block" : "hidden", className)}>{children}</div>
}

export default Tabs

