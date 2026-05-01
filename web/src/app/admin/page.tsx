"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import {
  ChevronRight,
  Mail,
  Search,
  ShieldCheck,
  Toolbox,
  X,
} from "lucide-react"
import { AdminUserRow, type AdminUser } from "@/components/admin-user-row"
import { cn } from "@/lib/utils"

const SEED_USERS: AdminUser[] = [
  { id: "u1", name: "Anna Smith", email: "anna.smith@claridge.com", role: "admin" },
  { id: "u2", name: "David Smith", email: "david.smith@claridge.com", role: "neighbor" },
  { id: "u3", name: "Jennifer Smith", email: "jennifer.smith@claridge.com", role: "neighbor" },
  { id: "u4", name: "Mike Peterson", email: "mike.peterson@claridge.com", role: "neighbor" },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AdminPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [trustedEmail, setTrustedEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [addedEmails, setAddedEmails] = useState<string[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Redirect non-admins away
  useEffect(() => {
    if (!isLoaded) return
    if (!user || user.publicMetadata?.role !== "admin") {
      router.replace("/")
    }
  }, [isLoaded, user, router])

  // 300ms debounce on search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  // Render nothing until loaded and confirmed admin
  if (!isLoaded || user?.publicMetadata?.role !== "admin") return null

  const trimmed = debouncedQuery.trim().toLowerCase()
  const showResults = trimmed.length > 0
  const searchResults = showResults
    ? SEED_USERS.filter(
        (u) =>
          u.name.toLowerCase().includes(trimmed) ||
          u.email.toLowerCase().includes(trimmed),
      )
    : []

  function handleAddEmail() {
    const email = trustedEmail.trim()
    if (!EMAIL_RE.test(email)) {
      setEmailError("Enter a valid email address.")
      return
    }
    if (addedEmails.includes(email.toLowerCase())) {
      setEmailError("This email has already been added.")
      return
    }
    setAddedEmails((prev) => [...prev, email.toLowerCase()])
    setTrustedEmail("")
    setEmailError(null)
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
          <h1 className="text-2xl font-bold text-foreground">Admin</h1>
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <ShieldCheck className="size-3.5" aria-hidden />
            Admin Mode
          </span>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Manage users and tools across the community.
        </p>

        <div className="flex flex-col gap-4">
          {/* Manage Users card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Add Trusted Email */}
            <div className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <Mail className="size-5 text-green-700" aria-hidden />
                <p className="font-semibold text-foreground">Add Trusted Email</p>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Grant access to a neighbor by email address.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={trustedEmail}
                  onChange={(e) => {
                    setTrustedEmail(e.target.value)
                    if (emailError) setEmailError(null)
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddEmail() }}
                  placeholder="neighbor@example.com"
                  aria-label="Trusted email address"
                  aria-invalid={emailError !== null}
                  aria-describedby={emailError ? "trusted-email-error" : undefined}
                  className={cn(
                    "flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    emailError ? "border-destructive" : "border-input",
                  )}
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className={cn(
                    "shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white",
                    "transition-colors hover:bg-green-700 active:translate-y-px",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2",
                  )}
                >
                  Add
                </button>
              </div>
              {emailError && (
                <p
                  id="trusted-email-error"
                  role="alert"
                  className="mt-2 text-xs font-medium text-destructive"
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Search Users */}
            <div className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <Search className="size-5 text-green-700" aria-hidden />
                <p className="font-semibold text-foreground">Manage Users</p>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Search neighbors by name or email.
              </p>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  aria-label="Search users"
                  className={cn(
                    "w-full rounded-lg border border-input bg-background py-2.5 pl-9 text-sm text-foreground",
                    searchQuery ? "pr-9" : "pr-3",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                )}
              </div>
            </div>

            {/* Search results */}
            {showResults && (
              <div className="border-t border-border">
                <p className="px-4 py-2 text-xs font-medium text-muted-foreground">
                  {searchResults.length === 0
                    ? "No users found"
                    : `${searchResults.length} ${searchResults.length === 1 ? "user" : "users"} found`}
                </p>
                {searchResults.length > 0 && (
                  <div className="divide-y divide-border">
                    {searchResults.map((u) => (
                      <AdminUserRow key={u.id} user={u} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manage Tools card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <Toolbox className="size-5 text-green-700" aria-hidden />
                <p className="font-semibold text-foreground">Manage Tools</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Browse and manage all tools listed in the community.
              </p>
            </div>
            <div className="border-t border-border">
              <Link
                href="/admin/tools"
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 text-sm",
                  "transition-colors hover:bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                )}
              >
                <span className="font-medium text-foreground">View Tools</span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Admin Access card */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="size-5 text-green-700" aria-hidden />
              <p className="font-semibold text-foreground">Admin Access</p>
            </div>
            <p className="text-sm text-muted-foreground">
              You have full administrative access to manage users and tools across Claridge Tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
