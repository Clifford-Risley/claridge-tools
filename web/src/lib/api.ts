const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function apiFetch<T>(
  path: string,
  token: string | null,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ToolRead {
  id: number
  owner_id: number
  name: string
  description: string | null
  category_tag: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ToolReadWithOwner extends ToolRead {
  owner_name: string
}

export interface ToolCreate {
  name: string
  description?: string
  category_tag?: string
  notes?: string
}

export interface ToolUpdate {
  name?: string
  description?: string
  category_tag?: string
  notes?: string
}

export interface UserRead {
  id: number
  clerk_id: string | null
  email: string
  display_name: string
  phone: string | null
  address: string | null
  role: "member" | "admin"
  created_at: string
}

// ── Tool endpoints ───────────────────────────────────────────────────────────

export const getTools = (q: string | undefined, token: string | null) => {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ""
  return apiFetch<ToolRead[]>(`/tools${qs}`, token)
}

export const getTool = (id: number, token: string | null) =>
  apiFetch<ToolRead>(`/tools/${id}`, token)

export const createTool = (body: ToolCreate, token: string | null) =>
  apiFetch<ToolRead>("/tools", token, {
    method: "POST",
    body: JSON.stringify(body),
  })

export const updateTool = (id: number, body: ToolUpdate, token: string | null) =>
  apiFetch<ToolRead>(`/tools/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  })

export const deleteTool = (id: number, token: string | null) =>
  apiFetch<void>(`/tools/${id}`, token, { method: "DELETE" })

// ── User endpoints ───────────────────────────────────────────────────────────

export const getCurrentUser = (token: string | null) =>
  apiFetch<UserRead>("/users/me", token)

// ── Admin endpoints ──────────────────────────────────────────────────────────

export const getAdminTools = (token: string | null) =>
  apiFetch<ToolReadWithOwner[]>("/admin/tools", token)

export const getAdminUsers = (token: string | null) =>
  apiFetch<UserRead[]>("/admin/users", token)

export const inviteUser = (email: string, token: string | null) =>
  apiFetch<{ invited: boolean; email: string }>("/admin/invite", token, {
    method: "POST",
    body: JSON.stringify({ email }),
  })

export const removeUser = (clerkId: string, token: string | null) =>
  apiFetch<{ deleted: boolean; clerk_id: string }>(`/admin/users/${clerkId}`, token, {
    method: "DELETE",
  })
