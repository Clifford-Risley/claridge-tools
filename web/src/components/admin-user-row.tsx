"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "admin" | "neighbor"
}

export function AdminUserRow({ user }: { user: AdminUser }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      href={`/my-account/${user.id}`}
      data-testid="admin-user-row"
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "transition-colors hover:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {initials}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-sm font-medium text-foreground">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
          user.role === "admin"
            ? "bg-green-100 text-green-700"
            : "bg-muted text-muted-foreground",
        )}
        data-testid={`role-badge-${user.role}`}
      >
        {user.role === "admin" ? "Admin" : "Neighbor"}
      </span>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  )
}
