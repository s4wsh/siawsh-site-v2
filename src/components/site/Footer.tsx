export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground flex items-center justify-between">
        <p>© {new Date().getFullYear()} Siawsh</p>
        <p>
          Built with Next.js & Tailwind
        </p>
      </div>
    </footer>
  )
}

