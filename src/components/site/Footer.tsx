export default function Footer() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF || process.env.NETLIFY_COMMIT_REF || "dev";
  const short = (sha || "dev").slice(0, 7);
  const time = process.env.VERCEL_GIT_COMMIT_TIMESTAMP || process.env.DEPLOYMENT_TIMESTAMP || undefined;
  const label = time ? `${short} • ${new Date(time).toISOString()}` : `${short}`;
  return (
    <footer className="border-t mt-12">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground flex items-center justify-between">
        <p>© {new Date().getFullYear()} Siawsh</p>
        <p className="flex items-center gap-3">
          <span className="rounded-full border px-2 py-0.5 text-xs" title={sha}>build {label}</span>
          <a href="/api/diag/info" className="underline-offset-2 hover:underline">diag</a>
        </p>
      </div>
    </footer>
  )
}
