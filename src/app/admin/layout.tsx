import type { Metadata } from "next"
import AdminShell from "@/components/admin/AdminShell"

export const metadata: Metadata = {
  title: "Admin | Siawsh",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // TODO: Protect this layout with auth (redirect unauthenticated users)
  return <AdminShell>{children}</AdminShell>
}

