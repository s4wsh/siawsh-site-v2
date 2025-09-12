"use client"

import * as React from "react"
import Button from "@/components/ui/button"

export default function CopyButton({ value, children }: { value: string; children?: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch (e) {
          console.error("Copy failed", e)
        }
      }}
      title={copied ? "Copied!" : "Copy URL"}
    >
      {copied ? "Copied" : children || "Copy URL"}
    </Button>
  )
}

