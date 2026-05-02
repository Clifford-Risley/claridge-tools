"use client"

import { useRouter } from "next/navigation"
import { ToolForm } from "@/components/tool-form"
import { useCreateTool } from "@/lib/hooks/useTools"

export default function NewToolPage() {
  const router = useRouter()
  const createTool = useCreateTool()

  return (
    <ToolForm
      mode="new"
      onSubmit={(data) =>
        createTool.mutate(
          { name: data.name, description: data.description },
          { onSuccess: () => router.push("/my-listings") },
        )
      }
      isSaving={createTool.isPending}
      saveError={createTool.error?.message ?? null}
    />
  )
}
