"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react"
import { Dialog } from "@base-ui/react/dialog"
import { CategoryChip } from "@/components/category-chip"
import { ToolCard, type Tool } from "@/components/tool-card"
import { cn } from "@/lib/utils"

const CATEGORIES = ["Power Tools", "Ladders", "Yard Work", "Cleaning", "More"]

const SEED_TOOLS: Tool[] = [
  {
    id: "1",
    name: "DeWalt Power Drill",
    description: "18V cordless drill with two batteries, charger, and full bit set.",
    category: "Power Tools",
    owner: "Mike T.",
    ownerInitials: "MT",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  },
  {
    id: "2",
    name: "24 ft Extension Ladder",
    description: "Aluminum extension ladder, excellent condition. Great for gutters and rooflines.",
    category: "Ladders",
    owner: "Sarah K.",
    ownerInitials: "SK",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  },
  {
    id: "3",
    name: "Circular Saw",
    description: '7-1/4" circular saw with blade guard, hard case, and extra blade.',
    category: "Power Tools",
    owner: "Jim R.",
    ownerInitials: "JR",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  },
  {
    id: "4",
    name: "Lawn Mower",
    description: "Self-propelled gas lawn mower. Easy pull-start, sharp blade, recently serviced.",
    category: "Yard Work",
    owner: "Anna P.",
    ownerInitials: "AP",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  },
  {
    id: "5",
    name: "Pressure Washer",
    description: "2,000 PSI electric pressure washer with 25 ft hose and four nozzle tips.",
    category: "Cleaning",
    owner: "Tom B.",
    ownerInitials: "TB",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  },
  {
    id: "6",
    name: "6 ft Step Ladder",
    description: "Fiberglass step ladder, 250 lb rated. Non-slip rubber feet, excellent condition.",
    category: "Ladders",
    owner: "Lisa M.",
    ownerInitials: "LM",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  },
  {
    id: "7",
    name: "Leaf Blower",
    description: "Cordless 40V leaf blower with battery and charger. Lightweight, low noise.",
    category: "Yard Work",
    owner: "Dave C.",
    ownerInitials: "DC",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  },
  {
    // removed — must never appear in results
    id: "8",
    name: "Old Chainsaw",
    description: "Gas chainsaw, no longer available.",
    category: "Power Tools",
    owner: "Frank W.",
    ownerInitials: "FW",
    ownerImageUrl: null,
    imageUrl: null,
    removed: true,
  },
]

export default function DirectoryPage() {
  const { user } = useUser()
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filteredTools = SEED_TOOLS.filter((t) => {
    if (t.removed) return false
    const q = query.toLowerCase().trim()
    if (
      q &&
      !t.name.toLowerCase().includes(q) &&
      !t.description.toLowerCase().includes(q)
    )
      return false
    // "More" acts as a pass-through placeholder until additional categories are defined
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
          {/* Search input */}
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

          {/* Filters button */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium",
              "transition-colors hover:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
          </button>
        </div>

        {/* Category chips — horizontally scrollable, negative margin to bleed to edges */}
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
        <span className="text-foreground">({filteredTools.length})</span>
      </p>

      {/* Scrollable results list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredTools.length === 0 ? (
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

      {/* Filters stub modal */}
      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
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

function FiltersModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Popup
          className={cn(
            "fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl",
            "focus:outline-none",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-bold text-foreground">
              Filters
            </Dialog.Title>
            <Dialog.Close
              className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close filters"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-sm text-muted-foreground">
            Filters coming soon.
          </Dialog.Description>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
