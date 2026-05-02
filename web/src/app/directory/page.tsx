"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { ChevronRight, Search } from "lucide-react"
import { CategoryChip } from "@/components/category-chip"
import { ToolCard, type Tool } from "@/components/tool-card"
import { useSearchTools } from "@/lib/hooks/useTools"
import { cn } from "@/lib/utils"
import type { ToolRead } from "@/lib/api"

const CATEGORIES = ["Power Tools", "Ladders", "Yard Work", "Cleaning", "More"]

function apiToolToCard(t: ToolRead): Tool {
  return {
    id: String(t.id),
    name: t.name,
    description: t.description ?? "",
    category: t.category_tag ?? "",
    owner: "Neighbor",
    ownerInitials: "?",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  }
}

export default function DirectoryPage() {
  const { user } = useUser()
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  const { data, isLoading, error } = useSearchTools(query)

  const filteredTools = (data ?? [])
    .map(apiToolToCard)
    .filter((t) => {
      if (activeCategory && activeCategory !== "More" && t.category !== activeCategory)
        return false
      return true
    })

  function toggleBookmark(id: string) {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearFilters() {
    setQuery("")
    setActiveCategory(null)
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <Image
            src="/flamingo-logo.png"
            width={40}
            height={40}
            alt="Claridge Tools"
            priority
            unoptimized
          />
          <span className="text-base font-bold text-green-700">Claridge Tools</span>
        </div>

        <Link
          href="/my-account"
          className="flex items-center gap-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account settings"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.firstName ?? "Account"}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
              {user?.firstName?.[0] ?? "?"}
            </div>
          )}
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </Link>
      </header>

      {/* Search row + category chips */}
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              aria-label="Search tools"
              className={cn(
                "w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring",
              )}
            />
          </div>
        </div>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() =>
                setActiveCategory((prev) => (prev === cat ? null : cat))
              }
            />
          ))}
        </div>
      </div>

      {/* Results heading */}
      <p className="shrink-0 px-4 py-2.5 text-sm font-medium text-muted-foreground">
        Tools nearby{" "}
        {!isLoading && !error && (
          <span className="text-foreground">({filteredTools.length})</span>
        )}
      </p>

      {/* Scrollable results list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error.message} onClear={clearFilters} />
        ) : filteredTools.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                bookmarked={bookmarks.has(tool.id)}
                onBookmarkToggle={() => toggleBookmark(tool.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading tools">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex h-28 animate-pulse overflow-hidden rounded-lg border border-border bg-card">
          <div className="w-[120px] shrink-0 bg-muted" />
          <div className="flex flex-1 flex-col gap-2 p-3">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message, onClear }: { message: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="font-medium text-destructive">Failed to load tools</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          "mt-1 rounded-lg border border-border px-4 py-2 text-sm font-medium",
          "transition-colors hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        Clear filters
      </button>
    </div>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Search className="size-10 text-muted-foreground/30" aria-hidden />
      <div>
        <p className="font-medium text-foreground">No tools found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search or clear your filters.
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          "mt-1 rounded-lg border border-border px-4 py-2 text-sm font-medium",
          "transition-colors hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        Clear filters
      </button>
    </div>
  )
}
