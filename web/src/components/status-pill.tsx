"use client"

import { cn } from "@/lib/utils"

type PillVariant = "available" | "removed" | "admin" | "neighbor"

const STYLES: Record<PillVariant, string> = {
  available: "bg-green-100 text-green-700",
  removed: "bg-muted text-muted-foreground",
  admin: "bg-green-100 text-green-700",
  neighbor: "bg-muted text-muted-foreground",
}

const LABELS: Record<PillVariant, string> = {
  available: "Available",
  removed: "Removed",
  admin: "Admin",
  neighbor: "Neighbor",
}

export function StatusPill({
  variant,
  className,
}: {
  variant: PillVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        STYLES[variant],
        className,
      )}
    >
      {LABELS[variant]}
    </span>
  )
}
