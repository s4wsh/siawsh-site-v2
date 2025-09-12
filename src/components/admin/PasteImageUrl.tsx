"use client"

import * as React from "react"
import Input from "@/components/ui/input"

export default function PasteImageUrl({
  value,
  onChange,
  placeholder = "Paste image URL…",
  className,
}: {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [src, setSrc] = React.useState<string>(value || "")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setSrc(value || "")
  }, [value])

  return (
    <div className={className}>
      <Input
        value={src}
        placeholder={placeholder}
        onChange={(e) => {
          setError(null)
          setSrc(e.target.value)
          onChange(e.target.value)
        }}
      />
      <div className="mt-2 overflow-hidden rounded-md border bg-muted/30" style={{ height: 120 }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={() => setError("Could not load image")}
            onLoad={() => setError(null)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

