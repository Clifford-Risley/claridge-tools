"use client"

import { Mail, MapPin, Pencil, Phone, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileCardProps {
  imageUrl: string | null
  fullName: string
  email: string | null
  phone: string | null
  address: string | null
  memberSinceYear: number | null
  onEditProfile: () => void
}

export function ProfileCard({
  imageUrl,
  fullName,
  email,
  phone,
  address,
  memberSinceYear,
  onEditProfile,
}: ProfileCardProps) {
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      data-testid="profile-card"
    >
      <div className="flex gap-4">
        {/* Left column: avatar + edit button */}
        <div className="flex flex-col items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={fullName}
              className="size-20 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={onEditProfile}
            aria-label="Edit your profile"
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium",
              "transition-colors hover:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Pencil className="size-3" aria-hidden />
            Edit Profile
          </button>
        </div>

        {/* Right column: name + detail rows */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <p className="font-bold leading-snug text-foreground">{fullName}</p>
          <ProfileField icon={Mail} value={email} />
          <ProfileField icon={Phone} value={phone} />
          <ProfileField icon={MapPin} value={address} />
          <ProfileField
            icon={ShieldCheck}
            value={memberSinceYear !== null ? `Neighbor since ${memberSinceYear}` : null}
          />
        </div>
      </div>
    </div>
  )
}

function ProfileField({
  icon: Icon,
  value,
}: {
  icon: React.ElementType
  value: string | null
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span
        className={cn(
          "truncate text-sm",
          value ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {value ?? "Not provided"}
      </span>
    </div>
  )
}
