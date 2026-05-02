"use client"

import { useRouter } from "next/navigation"
import { ToolForm } from "@/components/tool-form"
import { useTool, useUpdateTool } from "@/lib/hooks/useTools"
import type { ToolUpdate } from "@/lib/api"

export function EditToolView({ toolId }: { toolId: number }) {
  const router = useRouter()
  const { data, isLoading, error } = useTool(toolId)
  const updateTool = useUpdateTool()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-4 pt-20">
        <div className="h-44 w-full animate-pulse rounded-xl bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-28 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (error ?? !data) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 pt-20 text-center">
        <p className="font-medium text-destructive">Failed to load tool</p>
        <p className="text-sm text-muted-foreground">{error?.message ?? "Tool not found"}</p>
      </div>
    )
  }

  return (
    <ToolForm
      mode="edit"
      initialName={data.name}
      initialDescription={data.description ?? ""}
      onSubmit={(formData) => {
        const patch: ToolUpdate = {}
        if (formData.name !== data.name) patch.name = formData.name
        if (formData.description !== (data.description ?? "")) {
          patch.description = formData.description
        }
        updateTool.mutate(
          { id: toolId, body: patch },
          { onSuccess: () => router.push("/my-listings") },
        )
      }}
      isSaving={updateTool.isPending}
      saveError={updateTool.error?.message ?? null}
    />
  )
}
