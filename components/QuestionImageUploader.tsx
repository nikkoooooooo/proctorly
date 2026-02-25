"use client"

import { useRef, useState } from "react"

export default function QuestionImageUploader({
  userId,
  questionId,
  onUploaded,
}: {
  userId: string
  questionId: string
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!userId) {
      setError("You must be logged in to upload images.")
      return
    }
    setError(null)
    setIsUploading(true)
    try {
      const res = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          questionId,
          contentType: file.type,
          size: file.size,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to get upload URL")
      }

      const { key, url } = await res.json()

      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })


      if (!uploadRes.ok) {
          const text = await uploadRes.text().catch(() => "")
          throw new Error(`Upload failed: ${uploadRes.status} ${text}`)
        }

      onUploaded(key)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed border-gray-700 bg-secondary p-4 text-center">
      <p className="text-sm text-muted-foreground">Upload an image (JPG, PNG, WEBP)</p>
      <button
        type="button"
        className="rounded-[var(--radius-button)] bg-background px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading || !userId}
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>
      <p className="text-xs text-muted-foreground">or paste a URL below</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          if (inputRef.current) inputRef.current.value = ""
        }}
      />
    </div>
  )
}
