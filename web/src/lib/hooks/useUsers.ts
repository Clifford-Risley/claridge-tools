import { useAuth } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AdminUser } from "@/components/admin-user-row"
import * as api from "@/lib/api"

export function useCurrentUser() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const token = await getToken()
      return api.getCurrentUser(token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useAdminUsers() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const token = await getToken()
      const users = await api.getAdminUsers(token)
      return users.map((u): AdminUser => ({
        id: u.clerk_id ?? String(u.id),
        name: u.display_name,
        email: u.email,
        role: u.role === "admin" ? "admin" : "neighbor",
      }))
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useInviteUser() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (email: string) => {
      const token = await getToken()
      return api.inviteUser(email, token)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useRemoveUser() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (clerkId: string) => {
      const token = await getToken()
      return api.removeUser(clerkId, token)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}
