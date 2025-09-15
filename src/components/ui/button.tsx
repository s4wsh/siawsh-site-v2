"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "accent"
    | "secondary"
    | "ghost"
    | "outline"
    | "destructive"
  size?: "sm" | "md" | "lg" | "icon"
}

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4",
  lg: "h-10 px-6 text-base",
  icon: "h-9 w-9 p-0",
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: cn(
    "rounded-xl border border-muted px-4 py-2 font-medium",
    "bg-foreground text-background hover:bg-muted hover:text-foreground"
  ),
  accent: cn(
    "rounded-xl border border-transparent px-4 py-2 font-medium",
    "bg-accent text-background hover:bg-accent/90"
  ),
  secondary: cn(
    "rounded-xl border border-muted px-4 py-2 font-medium",
    "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  ),
  ghost: cn(
    "rounded-xl px-4 py-2 font-medium",
    "bg-transparent hover:bg-accent/10 text-foreground"
  ),
  outline: cn(
    "rounded-xl border border-muted px-4 py-2 font-medium",
    "bg-background hover:bg-accent/10"
  ),
  destructive: cn(
    "rounded-xl border border-transparent px-4 py-2 font-medium",
    "bg-destructive text-white hover:bg-destructive/90"
  ),
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors glow-button",
          "focus:outline-none focus:ring-2 focus:ring-accent/40",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export default Button
