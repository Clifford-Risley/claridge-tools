import { useAuth } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api"

export function useSearchTools(q: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ["tools", { q }],
    queryFn: async () => {
      const token = await getToken()
      return api.getTools(q || undefined, token)
    },
  })
}

export function useMyTools(currentUserId: number) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ["tools", { myTools: true }],
    queryFn: async () => {
      const token = await getToken()
      const tools = await api.getTools(undefined, token)
      return tools.filter((t) => t.owner_id === currentUserId)
    },
    enabled: currentUserId > 0,
  })
}

export function useTool(toolId: number) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ["tools", toolId],
    queryFn: async () => {
      const token = await getToken()
      return api.getTool(toolId, token)
    },
    enabled: toolId > 0,
  })
}

export function useAdminTools() {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ["admin", "tools"],
    queryFn: async () => {
      const token = await getToken()
      return api.getAdminTools(token)
    },
  })
}

export function useCreateTool() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: api.ToolCreate) => {
      const token = await getToken()
      return api.createTool(body, token)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tools"] })
    },
  })
}

export function useUpdateTool() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: api.ToolUpdate }) => {
      const token = await getToken()
      return api.updateTool(id, body, token)
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["tools", id] })
      void queryClient.invalidateQueries({ queryKey: ["tools"] })
    },
  })
}

export function useDeleteTool() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken()
      return api.deleteTool(id, token)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tools"] })
      void queryClient.invalidateQueries({ queryKey: ["admin", "tools"] })
    },
  })
}
