"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Camera, ShieldCheck, X } from "lucide-react"
import { cn } from "@/lib/utils"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 2014 }, (_, i) => CURRENT_YEAR - i)

export interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  isAdmin?: boolean
  initialName: string
  initialEmail: string | null
  initialPhone: string | null
  initialAddress: string | null
  initialMemberSinceYear: number | null
  initialImageUrl: string | null
}

export function EditProfileModal({
  open,
  onClose,
  isAdmin = false,
  initialName,
  initialEmail,
  initialPhone,
  initialAddress,
  initialMemberSinceYear,
  initialImageUrl,
}: EditProfileModalProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone ?? "")
  const [address, setAddress] = useState(initialAddress ?? "")
  const [memberSinceYear, setMemberSinceYear] = useState(
    initialMemberSinceYear ?? CURRENT_YEAR,
  )
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl)
  const [nameError, setNameError] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [adminEnabled, setAdminEnabled] = useState(isAdmin)
  const [isDirty, setIsDirty] = useState(false)

  // Reset form state each time the modal opens so stale edits don't leak across sessions
  useEffect(() => {
    if (!open) return
    setName(initialName)
    setPhone(initialPhone ?? "")
    setAddress(initialAddress ?? "")
    setMemberSinceYear(initialMemberSinceYear ?? CURRENT_YEAR)
    setImageUrl(initialImageUrl)
    setNameError("")
    setSaveError(null)
    setAdminEnabled(isAdmin)
    setIsDirty(false)
  }, [open, initialName, initialPhone, initialAddress, initialMemberSinceYear, initialImageUrl, isAdmin])

  const initials = initialName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function handleRequestClose() {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) return
    onClose()
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string)
      setIsDirty(true)
    }
    reader.readAsDataURL(file)
  }

  function handleAdminToggle() {
    if (adminEnabled) {
      if (!window.confirm("Remove admin access? This account will lose admin privileges."))
        return
    }
    setAdminEnabled((prev) => !prev)
    setIsDirty(true)
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError("Full name is required.")
      return
    }
    setNameError("")
    setSaveError(null)
    // TODO: submit to API; on failure: setSaveError("Something went wrong. Please try again.")
    setIsDirty(false)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleRequestClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Popup
          className={cn(
            "fixed inset-x-4 top-1/2 z-50 max-h-[90dvh] -translate-y-1/2 overflow-y-auto",
            "rounded-2xl bg-background shadow-xl",
            "focus:outline-none",
          )}
        >
          <div className="p-6">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <Dialog.Title className="text-base font-bold text-foreground">
                Edit Profile
              </Dialog.Title>
              <Dialog.Close
                className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              Update your profile information.
            </Dialog.Description>

            {/* Avatar + Change Photo */}
            <div className="mb-5 flex flex-col items-center gap-3">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile photo"
                  className="size-20 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium",
                  "transition-colors hover:bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Camera className="size-3" aria-hidden />
                Change Photo
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={handlePhotoChange}
              />
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setIsDirty(true)
                    if (nameError && e.target.value.trim()) setNameError("")
                  }}
                  placeholder="Your full name"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "profile-name-error" : undefined}
                  className={cn(
                    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2",
                    !nameError ? "border-input focus:ring-ring" : "border-destructive focus:ring-destructive/50",
                  )}
                />
                {nameError && (
                  <p id="profile-name-error" className="text-xs text-destructive" role="alert">
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email — visibly disabled, non-editable */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={initialEmail ?? ""}
                  disabled
                  readOnly
                  aria-describedby="profile-email-note"
                  className={cn(
                    "w-full rounded-lg border border-input bg-muted px-3 py-2.5 text-sm",
                    "cursor-not-allowed select-none text-muted-foreground",
                  )}
                />
                <p id="profile-email-note" className="text-xs text-muted-foreground">
                  Email address cannot be changed.
                </p>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-phone" className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="(555) 555-5555"
                  className={cn(
                    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                />
              </div>

              {/* Home Address */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-address" className="text-sm font-medium text-foreground">
                  Home Address
                </label>
                <input
                  id="profile-address"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="123 Claridge Drive"
                  className={cn(
                    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                />
              </div>

              {/* Neighbor Since */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-since" className="text-sm font-medium text-foreground">
                  Neighbor Since
                </label>
                <select
                  id="profile-since"
                  value={memberSinceYear}
                  onChange={(e) => {
                    setMemberSinceYear(Number(e.target.value))
                    setIsDirty(true)
                  }}
                  className={cn(
                    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Admin Access — only for admins */}
            {isAdmin && (
              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-700" aria-hidden />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Admin Access</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Controls whether this account has admin privileges across Claridge Tools.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={adminEnabled}
                    onClick={handleAdminToggle}
                    data-testid="admin-access-toggle"
                    aria-label={`Admin access ${adminEnabled ? "enabled" : "disabled"}`}
                    className={cn(
                      "relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      adminEnabled ? "bg-green-600" : "bg-input",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                        adminEnabled ? "translate-x-5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Save error */}
            {saveError && (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {saveError}
              </p>
            )}

            {/* Save Changes */}
            <button
              type="button"
              onClick={handleSave}
              className={cn(
                "mt-5 flex w-full items-center justify-center rounded-lg",
                "bg-green-600 px-4 py-3 text-sm font-semibold text-white",
                "transition-colors hover:bg-green-700 active:translate-y-px",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2",
              )}
            >
              Save Changes
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
