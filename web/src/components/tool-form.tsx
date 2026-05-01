"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_DESC = 300

export interface ToolFormProps {
  mode: "new" | "edit"
  initialName?: string
  initialDescription?: string
  initialImageUrl?: string | null
}

export function ToolForm({
  mode,
  initialName = "",
  initialDescription = "",
  initialImageUrl = null,
}: ToolFormProps) {
  const router = useRouter()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl)
  const [nameError, setNameError] = useState("")
  const [isDirty, setIsDirty] = useState(false)

  // Pick up an image passed through from the photo-upload modal flow
  useEffect(() => {
    if (mode !== "new") return
    try {
      const pending = sessionStorage.getItem("pending-tool-image")
      if (pending) {
        setImageUrl(pending)
        sessionStorage.removeItem("pending-tool-image")
        setIsDirty(true)
      }
    } catch {
      // sessionStorage unavailable — continue without image
    }
  }, [mode])

  function handleBack() {
    if (isDirty && !window.confirm("You have unsaved changes. Leave anyway?")) return
    router.back()
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string)
      setIsDirty(true)
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError("Tool name is required.")
      return
    }
    setNameError("")
    // TODO: submit to API — navigate to My Tools on success
    router.push("/my-listings")
  }

  return (
    <div className="flex flex-col">
      {/* Flow header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <div>
          <h1 className="text-base font-semibold leading-tight">
            {mode === "new" ? "Add a Tool" : "Edit Tool"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Add some basic details about your tool.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-5 p-4">
        {/* Image preview / upload area */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className={cn(
            "flex h-44 w-full items-center justify-center overflow-hidden rounded-xl",
            "border-2 border-dashed border-border bg-muted",
            "transition-colors hover:border-green-600 hover:bg-green-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Upload tool photo"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Tool preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Camera className="size-8" aria-hidden />
              <span className="text-sm">Tap to add a photo</span>
            </div>
          )}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-hidden
          tabIndex={-1}
          onChange={handleImageChange}
        />

        {/* Tool Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tool-name" className="text-sm font-medium text-foreground">
            Tool Name
          </label>
          <input
            id="tool-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setIsDirty(true)
              if (nameError && e.target.value.trim()) setNameError("")
            }}
            placeholder="e.g. DeWalt 20V Cordless Drill"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "tool-name-error" : undefined}
            className={cn(
              "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2",
              !nameError && "border-input focus:ring-ring",
              nameError && "border-destructive focus:ring-destructive/50",
            )}
          />
          {nameError && (
            <p id="tool-name-error" className="text-xs text-destructive" role="alert">
              {nameError}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="tool-description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <span
              className={cn(
                "text-xs tabular-nums",
                description.length >= MAX_DESC ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {description.length}/{MAX_DESC}
            </span>
          </div>
          <textarea
            id="tool-description"
            value={description}
            onChange={(e) => {
              if (e.target.value.length > MAX_DESC) return
              setDescription(e.target.value)
              setIsDirty(true)
            }}
            placeholder="Describe your tool — condition, accessories, any important notes."
            rows={4}
            className={cn(
              "w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
            )}
          />
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className={cn(
            "flex w-full items-center justify-center rounded-lg",
            "bg-green-600 px-4 py-3 text-sm font-semibold text-white",
            "transition-colors hover:bg-green-700 active:translate-y-px",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2",
          )}
        >
          Save Tool
        </button>
      </div>
    </div>
  )
}
