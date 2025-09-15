"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Info = { ok: boolean; now: string; sha?: string; shortSha?: string; time?: string; source?: string };

export default function DebugBadge() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const debug = sp.get("debug");
  const [info, setInfo] = useState<Info | null>(null);
  useEffect(() => {
    if (debug === "1") {
      fetch("/api/diag/info").then((r) => r.json()).then(setInfo).catch(() => setInfo(null));
    }
  }, [debug]);
  if (debug !== "1") return null;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return (
    <div className="fixed right-3 top-3 z-50 rounded-md border bg-background/90 p-2 text-xs text-foreground shadow">
      <div className="font-medium">Debug</div>
      <div>route: {pathname}</div>
      <div>site: {site || "-"}</div>
      <div>build: {info?.shortSha || "dev"} {info?.time ? `• ${info.time}` : ""}</div>
    </div>
  );
}

