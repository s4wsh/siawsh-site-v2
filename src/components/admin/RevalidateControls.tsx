"use client";
import { useActionState, useState } from "react";
import Button from "@/components/ui/button";

export function RevalidateControls({ action }: { action: any }) {
  const [state, formAction] = useActionState(action, null as any);
  return (
    <div className="space-y-2">
      <form action={formAction}>
        <Button type="submit" className="neon-glow">Revalidate All</Button>
      </form>
      {state?.ok && (
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Revalidated {state.projects} projects and {state.blog} blog posts.
        </div>
      )}
    </div>
  );
}

export function RedeployButton() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          try {
            const res = await fetch("/api/admin/redeploy", { method: "POST" });
            const j = await res.json();
            if (!res.ok) throw new Error(j?.error || "Redeploy failed");
            setMsg("Triggered redeploy");
          } catch (e: any) {
            setMsg(e?.message || "Redeploy failed");
          } finally {
            setBusy(false);
          }
        }}
        className="rounded-md border px-3 py-2 text-sm"
      >
        {busy ? "Triggering…" : "Trigger Redeploy"}
      </button>
      {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
    </div>
  );
}

