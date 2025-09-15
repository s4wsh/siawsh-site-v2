import { Timestamp } from "firebase-admin/firestore";

export function toISO(value: unknown): string {
  if (!value) return "";
  try {
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (typeof value === "object" && value !== null &&
      "seconds" in (value as any) && "nanoseconds" in (value as any)) {
      const v: any = value;
      return new Date(v.seconds * 1000 + Math.floor(v.nanoseconds / 1e6)).toISOString();
    }
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return new Date(value).toISOString();
  } catch {}
  return "";
}

export function toHuman(value: unknown): string {
  const iso = toISO(value);
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}
