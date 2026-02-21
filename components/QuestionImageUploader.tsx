"use client"

import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

export default function QuestionImageUploader({
  onUploaded,
}: {
  onUploaded: (url: string) => void
}) {
  return (
    <UploadButton<OurFileRouter, "questionImage">
      endpoint="questionImage"
      content={{
        button: ({}) => (
          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Drag and drop an image here</p>
            <span className="rounded-[var(--radius-button)] bg-background px-4 py-2 text-xs font-semibold text-foreground">
              Upload Image
            </span>
            <p className="text-xs text-muted-foreground">or paste a URL below</p>
          </div>
        ),
        allowedContent: "",
      }}
      appearance={{
        button:
          "w-full text-center rounded-[var(--radius-button)] bg-secondary px-3 py-4 text-sm font-semibold text-foreground",
        allowedContent: "hidden",
        container:
          "flex w-full flex-col items-center gap-2 rounded-md border-2 border-gray-700 border-dashed bg-secondary p-4 text-center [&>input[type=file]]:hidden",
      }}
      onClientUploadComplete={(res) => {
        const url = res?.[0]?.ufsUrl
        if (url) onUploaded(url)
      }}
      onUploadError={(error) => {
        console.error("Upload error:", error)
      }}
    />
  )
}
