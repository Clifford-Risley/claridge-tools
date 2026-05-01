"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog } from "@base-ui/react/dialog"
import { Camera, ChevronRight, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AddToolModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToolModal({ open, onOpenChange }: AddToolModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleManualEntry() {
    onOpenChange(false)
    router.push("/tools/new")
  }

  function handlePhotoClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      // No file selected — fall through to manual entry
      onOpenChange(false)
      router.push("/tools/new")
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        sessionStorage.setItem("pending-tool-image", ev.target?.result as string)
      } catch {
        // sessionStorage unavailable — continue without persisted image
      }
      onOpenChange(false)
      router.push("/tools/new")
    }
    reader.onerror = () => {
      // Read failed — navigate to manual entry without image
      onOpenChange(false)
      router.push("/tools/new")
    }
    reader.readAsDataURL(file)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => onOpenChange(v)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Popup
          className={cn(
            "fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl",
            "focus:outline-none",
          )}
        >
          {/* Header row */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-base font-bold text-foreground">
                Add a Tool
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                How would you like to add your tool?
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          {/* Manual entry option */}
          <button
            type="button"
            onClick={handleManualEntry}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4",
              "transition-colors hover:bg-accent active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Pencil className="size-5 text-green-700" aria-hidden />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Enter Details Manually</p>
              <p className="text-xs text-muted-foreground">Fill in the name and description</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>

          {/* OR divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Photo upload option */}
          <button
            type="button"
            onClick={handlePhotoClick}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4",
              "transition-colors hover:bg-accent active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Camera className="size-5 text-green-700" aria-hidden />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Upload a Photo</p>
              <p className="text-xs text-muted-foreground">Pick from your library or camera</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>

          {/* Hidden file input — triggered by photo button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-hidden
            tabIndex={-1}
            onChange={handleFileChange}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
