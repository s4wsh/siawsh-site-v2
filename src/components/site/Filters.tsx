"use client";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  categories: string[];
  years: number[];
};

export default function Filters({ categories, years }: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const category = sp.get("category") || "";
  const year = sp.get("year") || "";
  return (
    <form
      className="flex items-center gap-2"
      onChange={(e) => {
        const form = e.currentTarget as HTMLFormElement;
        const c = (form.elements.namedItem("category") as HTMLSelectElement)?.value;
        const y = (form.elements.namedItem("year") as HTMLSelectElement)?.value;
        const params = new URLSearchParams(sp?.toString() || "");
        if (c) params.set("category", c); else params.delete("category");
        if (y) params.set("year", y); else params.delete("year");
        router.push(`/projects?${params.toString()}`);
      }}
    >
      <select name="category" defaultValue={category} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select name="year" defaultValue={year} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
        <option value="">All years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </form>
  );
}
