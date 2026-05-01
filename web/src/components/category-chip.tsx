"use client"

import { cn } from "@/lib/utils"

interface CategoryChipProps {
  label: string
  active: boolean
  onClick: () => void
}

export function CategoryChip({ label, active, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active
          ? "bg-green-600 text-white"
          : "border border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  )
}
