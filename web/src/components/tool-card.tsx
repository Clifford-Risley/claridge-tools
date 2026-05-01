"use client"

import Link from "next/link"
import { Bookmark, Pencil, RotateCcw, Trash2, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/status-pill"
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
  removedDate?: string | null
}

interface ToolCardProps {
  tool: Tool
  // Browse mode (directory)
  bookmarked?: boolean
  onBookmarkToggle?: () => void
  // Admin mode
  adminMode?: boolean
  confirming?: boolean
  onConfirmStart?: () => void
  onConfirmCancel?: () => void
  onConfirmRemove?: () => void
  onRestore?: () => void
}

export function ToolCard({
  tool,
  bookmarked,
  onBookmarkToggle,
  adminMode = false,
  confirming = false,
  onConfirmStart,
  onConfirmCancel,
  onConfirmRemove,
  onRestore,
}: ToolCardProps) {
  const isRemovedAdmin = adminMode && tool.removed

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg border border-border bg-card",
        isRemovedAdmin && "opacity-75",
      )}
      data-testid="tool-card"
    >
      {/* Image — 120 px wide, full card height */}
      <div
        className={cn(
          "flex w-[120px] shrink-0 items-center justify-center bg-muted",
          isRemovedAdmin && "grayscale",
        )}
      >
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
        {/* Name + description + optional status pill */}
        <div className="flex flex-col gap-0.5">
          <p
            className={cn(
              "font-semibold leading-snug",
              isRemovedAdmin ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {tool.name}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {tool.description}
          </p>
          {adminMode && (
            <div className="mt-0.5 flex items-center gap-2">
              <StatusPill variant={tool.removed ? "removed" : "available"} />
              {tool.removed && tool.removedDate && (
                <span className="text-xs text-muted-foreground">
                  {tool.removedDate}
                </span>
              )}
            </div>
          )}
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

        {/* Admin actions */}
        {adminMode &&
          (tool.removed ? (
            <Button
              size="xs"
              variant="outline"
              onClick={onRestore}
              aria-label={`Restore ${tool.name}`}
              className="w-full"
            >
              <RotateCcw className="size-3" aria-hidden />
              Restore
            </Button>
          ) : confirming ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-destructive">
                Remove this tool?
              </p>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={onConfirmRemove}
                  aria-label={`Confirm remove ${tool.name}`}
                >
                  Remove
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={onConfirmCancel}
                  aria-label="Cancel remove"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href={`/tools/${tool.id}/edit`} className="flex-1">
                <Button
                  size="xs"
                  variant="outline"
                  className="w-full"
                  aria-label={`Edit ${tool.name}`}
                >
                  <Pencil className="size-3" aria-hidden />
                  Edit
                </Button>
              </Link>
              <Button
                size="xs"
                variant="destructive"
                onClick={onConfirmStart}
                aria-label={`Remove ${tool.name}`}
              >
                <Trash2 className="size-3" aria-hidden />
                Remove
              </Button>
            </div>
          ))}
      </div>

      {/* Bookmark — browse mode only */}
      {!adminMode && onBookmarkToggle && (
        <button
          type="button"
          onClick={onBookmarkToggle}
          aria-label={
            bookmarked ? `Remove ${tool.name} from saved` : `Save ${tool.name}`
          }
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
      )}
    </div>
  )
}
