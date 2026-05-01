"use client"

import { Bookmark, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Tool {
  id: string
  name: string
  description: string
  category: string
  owner: string
  ownerInitials: string
  ownerImageUrl?: string | null
  imageUrl: string | null
  removed: boolean
}

interface ToolCardProps {
  tool: Tool
  bookmarked: boolean
  onBookmarkToggle: () => void
}

export function ToolCard({ tool, bookmarked, onBookmarkToggle }: ToolCardProps) {
  return (
    <div
      className="flex overflow-hidden rounded-lg border border-border bg-card"
      data-testid="tool-card"
    >
      {/* Image — 120 px wide, full card height; rounded left corners via parent overflow-hidden */}
      <div className="flex w-[120px] shrink-0 items-center justify-center bg-muted">
        {tool.imageUrl ? (
          <img
            src={tool.imageUrl}
            alt={tool.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Wrench className="size-8 text-muted-foreground/30" aria-hidden />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-2 p-3">
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold leading-snug text-foreground">{tool.name}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-1.5">
          {tool.ownerImageUrl ? (
            <img
              src={tool.ownerImageUrl}
              alt={tool.owner}
              className="size-5 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
              {tool.ownerInitials}
            </div>
          )}
          <span className="text-xs text-muted-foreground">{tool.owner}</span>
        </div>
      </div>

      {/* Bookmark */}
      <button
        type="button"
        onClick={onBookmarkToggle}
        aria-label={bookmarked ? `Remove ${tool.name} from saved` : `Save ${tool.name}`}
        aria-pressed={bookmarked}
        className={cn(
          "flex shrink-0 items-start p-3",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          bookmarked
            ? "text-green-600 hover:text-green-700"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Bookmark
          className={cn("size-5", bookmarked && "fill-current")}
          aria-hidden
        />
      </button>
    </div>
  )
}
