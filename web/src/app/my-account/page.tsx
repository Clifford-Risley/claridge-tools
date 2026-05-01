"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { ChevronRight, Heart } from "lucide-react"
import { EditProfileModal } from "@/components/edit-profile-modal"
import { ProfileCard } from "@/components/profile-card"
import { cn } from "@/lib/utils"

const SECTIONS = [
  {
    title: "Community",
    rows: [
      { label: "Community Guidelines", href: "/community-guidelines" },
      { label: "Report a User", href: "/report-user" },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "Send Feedback", href: "/feedback" },
      { label: "Something Not Working?", href: "/support" },
    ],
  },
  {
    title: "Legal",
    rows: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
]

export default function MyAccountPage() {
  const { user } = useUser()
  const [editOpen, setEditOpen] = useState(false)

  const isAdmin = user?.publicMetadata?.role === "admin"

  const fullName =
    (user?.fullName ??
      [user?.firstName, user?.lastName].filter(Boolean).join(" ")) ||
    "Neighbor"

  const email = user?.primaryEmailAddress?.emailAddress ?? null
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? null
  const address: string | null = null
  const memberSinceYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : null

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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
        <h1 className="mb-4 text-2xl font-bold text-foreground">My Account</h1>

        <ProfileCard
          imageUrl={user?.imageUrl ?? null}
          fullName={fullName}
          email={email}
          phone={phone}
          address={address}
          memberSinceYear={memberSinceYear}
          onEditProfile={() => setEditOpen(true)}
          isAdmin={isAdmin}
        />

        <div className="mt-5 flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
              <div className="divide-y divide-border">
                {section.rows.map((row) => (
                  <Link
                    key={row.label}
                    href={row.href}
                    data-testid="section-row"
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 text-sm text-foreground",
                      "transition-colors hover:bg-muted",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    )}
                  >
                    <span>{row.label}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Heart className="size-4 text-red-400" aria-hidden />
          <span>Thanks for being a great neighbor.</span>
        </footer>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        isAdmin={isAdmin}
        initialName={fullName}
        initialEmail={email}
        initialPhone={phone}
        initialAddress={address}
        initialMemberSinceYear={memberSinceYear}
        initialImageUrl={user?.imageUrl ?? null}
      />
    </div>
  )
}
