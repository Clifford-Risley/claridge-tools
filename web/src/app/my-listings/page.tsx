"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ChevronRight, Pencil, Plus, Trash2, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddToolModal } from "@/components/add-tool-modal"
import { useCurrentUser } from "@/lib/hooks/useUsers"
import { useMyTools, useDeleteTool } from "@/lib/hooks/useTools"
import { cn } from "@/lib/utils"
import type { ToolRead } from "@/lib/api"

export default function MyListingsPage() {
  return (
    <Suspense>
      <MyListingsView />
    </Suspense>
  )
}

function MyListingsView() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const showEmpty = searchParams.get("empty") === "true"

  const { data: currentUser } = useCurrentUser()
  const { data: tools = [], isLoading, error } = useMyTools(currentUser?.id ?? 0)

  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const deleteTool = useDeleteTool()

  const displayTools = showEmpty ? [] : tools

  function handleRemove(id: number) {
    deleteTool.mutate(id, { onSuccess: () => setConfirmId(null) })
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
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

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">My Tools</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the tools you share with your neighbors.
          </p>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : displayTools.length === 0 ? (
          <EmptyState onAddTool={() => setModalOpen(true)} />
        ) : (
          <div className="flex flex-col gap-3">
            {displayTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                confirming={confirmId === tool.id}
                deleting={deleteTool.isPending && confirmId === tool.id}
                onConfirmStart={() => setConfirmId(tool.id)}
                onConfirmCancel={() => setConfirmId(null)}
                onConfirmRemove={() => handleRemove(tool.id)}
              />
            ))}
            <AddToolButton onClick={() => setModalOpen(true)} />
          </div>
        )}
      </div>

      <AddToolModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading your tools">
      {[1, 2].map((n) => (
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

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="font-medium text-destructive">Failed to load your tools</p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function EmptyState({ onAddTool }: { onAddTool: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <Wrench className="size-12 text-muted-foreground/30" aria-hidden />
      <div>
        <p className="font-medium text-foreground">No tools yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first tool to share with neighbors.
        </p>
      </div>
      <AddToolButton onClick={onAddTool} />
    </div>
  )
}

function AddToolButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg",
        "bg-green-600 px-4 py-3 text-sm font-semibold text-white",
        "transition-colors hover:bg-green-700 active:translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2",
      )}
    >
      <Plus className="size-4" aria-hidden />
      Add a Tool
    </button>
  )
}

function ToolCard({
  tool,
  confirming,
  deleting,
  onConfirmStart,
  onConfirmCancel,
  onConfirmRemove,
}: {
  tool: ToolRead
  confirming: boolean
  deleting: boolean
  onConfirmStart: () => void
  onConfirmCancel: () => void
  onConfirmRemove: () => void
}) {
  return (
    <div
      className="flex overflow-hidden rounded-lg border border-border bg-card"
      data-testid="tool-card"
    >
      <div className="flex w-[120px] shrink-0 items-center justify-center bg-muted">
        <Wrench className="size-8 text-muted-foreground/30" aria-hidden />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-3">
        <div className="flex flex-col gap-1">
          <p className="font-semibold leading-snug text-foreground">{tool.name}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
          <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Available
          </span>
        </div>

        {confirming ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-destructive">Remove this tool?</p>
            <div className="flex gap-2">
              <Button
                size="xs"
                variant="destructive"
                onClick={onConfirmRemove}
                disabled={deleting}
                aria-label={`Confirm remove ${tool.name}`}
              >
                {deleting ? "Removing…" : "Remove"}
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={onConfirmCancel}
                disabled={deleting}
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
        )}
      </div>
    </div>
  )
}
