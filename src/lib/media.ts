"use client"

import { getDownloadURL, ref } from "firebase/storage"
import { clientStorage } from "@/lib/firebase-client"

export async function makePublicUrl(path: string): Promise<string> {
  return await getDownloadURL(ref(clientStorage, path))
}

export function fmtBytes(n: number): string {
  if (!n || n < 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const val = n / Math.pow(1024, i)
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

