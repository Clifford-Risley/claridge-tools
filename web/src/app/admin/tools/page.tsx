"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ChevronRight, Plus, ShieldCheck } from "lucide-react"
import { AddToolModal } from "@/components/add-tool-modal"
import { ToolCard, type Tool } from "@/components/tool-card"
import { useAdminTools, useDeleteTool } from "@/lib/hooks/useTools"
import { cn } from "@/lib/utils"
import type { ToolReadWithOwner } from "@/lib/api"

type Filter = "all" | "available"

function apiToolToCard(t: ToolReadWithOwner): Tool {
  const initials = t.owner_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return {
    id: String(t.id),
    name: t.name,
    description: t.description ?? "",
    category: t.category_tag ?? "",
    owner: t.owner_name,
    ownerInitials: initials || "?",
    ownerImageUrl: null,
    imageUrl: null,
    removed: false,
  }
}

const EMPTY_MESSAGES: Record<Filter, string> = {
  all: "No tools yet.",
  available: "No available tools.",
}

export default function AdminToolsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<Filter>("all")
  const [modalOpen, setModalOpen] = useState(false)

  const { data: apiTools = [], isLoading, error } = useAdminTools()
  const deleteTool = useDeleteTool()

  useEffect(() => {
    if (!isLoaded) return
    if (!user || user.publicMetadata?.role !== "admin") {
      router.replace("/")
    }
  }, [isLoaded, user, router])

  if (!isLoaded || user?.publicMetadata?.role !== "admin") return null

  const tools = apiTools.map(apiToolToCard)
  const filteredTools = activeFilter === "available" ? tools : tools

  const allCount = tools.length
  const availableCount = tools.length

  function handleRemove(id: string) {
    deleteTool.mutate(Number(id), { onSuccess: () => setConfirmId(null) })
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
          Manage all tools across the community.
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
        </div>

        {/* Tool list */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <p className="py-12 text-center text-sm text-destructive">{error.message}</p>
        ) : filteredTools.length === 0 ? (
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
              />
            ))}
          </div>
        )}
      </div>

      <AddToolModal open={modalOpen} onOpenChange={setModalOpen} />
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
          </div>
        </div>
      ))}
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
