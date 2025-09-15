"use client";
import { useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";

type Tab = { key: "cases" | "blog"; label: string };
const TABS: Tab[] = [
  { key: "cases", label: "Case Studies" },
  { key: "blog", label: "Blog" },
];

export default function SegmentTabs({ basePath = "/admin/content" }: { basePath?: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const remembered = typeof window !== 'undefined' ? (sessionStorage.getItem('seg.kind') as "cases" | "blog" | null) : null;
  const active = ((sp.get("kind") as "cases" | "blog") ?? remembered) || "cases";

  const onSelect = (key: Tab["key"]) => {
    const p = new URLSearchParams(sp.toString());
    p.set("kind", key);
    p.delete("q");
    p.set("page", "1");
    try { sessionStorage.setItem('seg.kind', key); } catch {}
    router.replace(`${basePath}?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="segwrap" role="tablist" aria-label="Content kind">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onSelect(t.key)}
          className={clsx("segbtn", active === t.key && "segbtn-active")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
