"use client"

import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { ChevronRight, Search, Toolbox } from "lucide-react"
import { cn } from "@/lib/utils"

function greeting(firstName: string | null | undefined): string {
  if (firstName) return `Hi ${firstName}`
  if (process.env.NODE_ENV === "development") return "Hi Anna"
  return "Hi there"
}

export default function HomePage() {
  const { user } = useUser()

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-5">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/flamingo-logo.png"
            width={50}
            height={50}
            alt="Claridge Tools"
            priority
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

      {/* Main content — fills remaining space, centered vertically */}
      <main className="flex flex-1 flex-col justify-center gap-8 py-6">
        <h1 className="text-4xl font-bold text-foreground">{greeting(user?.firstName)}</h1>

        <div className="flex flex-col gap-5">
          <ActionTile
            href="/directory"
            icon={<Search className="size-14 text-green-700" aria-hidden />}
            title="Search Tools"
            description="Browse tools available from your neighbors."
          />
          <ActionTile
            href="/my-listings"
            icon={<Toolbox className="size-14 text-green-700" aria-hidden />}
            title="Manage My Tools"
            description="See and edit the tools you've listed to share."
          />
        </div>
      </main>
    </div>
  )
}

function ActionTile({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center shadow-sm",
        "transition-colors hover:bg-accent active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {icon}
      <div>
        <p className="text-lg font-bold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
