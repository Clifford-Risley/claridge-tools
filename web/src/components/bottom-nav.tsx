"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Home, LayoutDashboard, Search, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

const BASE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/directory", label: "Search", icon: Search },
  { href: "/my-listings", label: "My Tools", icon: Wrench },
]

const ADMIN_NAV_ITEM = { href: "/admin", label: "Admin", icon: LayoutDashboard }

const HIDDEN_PATHS = ["/sign-in"]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useUser()

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null

  const isAdmin = user?.publicMetadata?.role === "admin"
  const navItems = isAdmin ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex h-14">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/")
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                  active
                    ? "text-green-700"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon aria-hidden className="size-5" />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
