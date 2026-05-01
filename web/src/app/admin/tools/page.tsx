"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ChevronRight, Plus, ShieldCheck } from "lucide-react"
import { AddToolModal } from "@/components/add-tool-modal"
import { ToolCard, type Tool } from "@/components/tool-card"
import { cn } from "@/lib/utils"

type Filter = "all" | "available" | "removed"

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
    id: "4",
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
    id: "5",
    name: "Old Chainsaw",
    description: "Gas chainsaw, no longer serviceable. Removed from listings.",
    category: "Power Tools",
    owner: "Frank W.",
    ownerInitials: "FW",
    ownerImageUrl: null,
    imageUrl: null,
    removed: true,
    removedDate: "Mar 12, 2025",
  },
  {
    id: "6",
    name: "Broken Hedge Trimmer",
    description: "Electric hedge trimmer, motor failed. Removed pending repair.",
    category: "Yard Work",
    owner: "Lisa M.",
    ownerInitials: "LM",
    ownerImageUrl: null,
    imageUrl: null,
    removed: true,
    removedDate: "Jan 8, 2025",
  },
]

const EMPTY_MESSAGES: Record<Filter, string> = {
  all: "No tools yet.",
  available: "No available tools.",
  removed: "No removed tools.",
}

export default function AdminToolsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [tools, setTools] = useState<Tool[]>(SEED_TOOLS)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<Filter>("all")
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!user || user.publicMetadata?.role !== "admin") {
      router.replace("/")
    }
  }, [isLoaded, user, router])

  if (!isLoaded || user?.publicMetadata?.role !== "admin") return null

  const allCount = tools.length
  const availableCount = tools.filter((t) => !t.removed).length
  const removedCount = tools.filter((t) => t.removed).length

  const filteredTools = tools.filter((t) => {
    if (activeFilter === "available") return !t.removed
    if (activeFilter === "removed") return t.removed
    return true
  })

  function handleRemove(id: string) {
    setTools((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              removed: true,
              removedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : t,
      ),
    )
    setConfirmId(null)
  }

  function handleRestore(id: string) {
    setTools((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, removed: false, removedDate: null } : t,
      ),
    )
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
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.firstName ?? "Account"}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
              {user.firstName?.[0] ?? "?"}
            </div>
          )}
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </Link>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
        {/* Page heading + badge */}
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Admin Tools</h1>
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <ShieldCheck className="size-3.5" aria-hidden />
            Admin Mode
          </span>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Manage all tools across the community, including removed listings.
        </p>

        {/* Add a Tool */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={cn(
            "mb-4 flex w-full items-center justify-center gap-2 rounded-lg",
            "bg-green-600 px-4 py-3 text-sm font-semibold text-white",
            "transition-colors hover:bg-green-700 active:translate-y-px",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2",
          )}
        >
          <Plus className="size-4" aria-hidden />
          Add a Tool
        </button>

        {/* Filter pills */}
        <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill
            label="All Tools"
            count={allCount}
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <FilterPill
            label="Available"
            count={availableCount}
            active={activeFilter === "available"}
            onClick={() => setActiveFilter("available")}
          />
          <FilterPill
            label="Removed"
            count={removedCount}
            active={activeFilter === "removed"}
            onClick={() => setActiveFilter("removed")}
          />
        </div>

        {/* Tool list */}
        {filteredTools.length === 0 ? (
          <p
            className="py-12 text-center text-sm text-muted-foreground"
            data-testid="empty-state"
          >
            {EMPTY_MESSAGES[activeFilter]}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                adminMode
                confirming={confirmId === tool.id}
                onConfirmStart={() => setConfirmId(tool.id)}
                onConfirmCancel={() => setConfirmId(null)}
                onConfirmRemove={() => handleRemove(tool.id)}
                onRestore={() => handleRestore(tool.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddToolModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active
          ? "bg-green-600 text-white"
          : "border border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-xs font-semibold",
          active ? "bg-green-700 text-white" : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  )
}
