"use client"

import { useEffect, useState } from "react"
import QuestionImageUploader from "@/components/QuestionImageUploader"

export type IdentificationConfig = {
  correctAnswers: string[]
  matchStrategy: "exact" | "contains" | "regex"
  caseSensitive: boolean
  trimWhitespace: boolean
  normalize: boolean
}

interface Question {
  id: string
  text: string
  type: "mcq" | "true-false" | "identification"
  timerLimit: number
  imageUrl?: string
  points: number
  identification: IdentificationConfig
}

interface CreateQuestionIdentificationProps {
  userId: string
  question: Question
  index: number
  isSubmitting: boolean
  onRemove: (id: string) => void
  onQuestionTextChange: (id: string, value: string) => void
  onTimerChange: (questionId: string, seconds: number) => void
  onQuestionImageChange?: (id: string, value: string) => void
  onPointsChange: (questionId: string, points: number) => void
  onIdentificationChange: (questionId: string, value: IdentificationConfig) => void
  showRemove?: boolean
}

export default function CreateQuestionIdentification({
  userId,
  question,
  index,
  isSubmitting,
  onRemove,
  onQuestionTextChange,
  onTimerChange,
  onQuestionImageChange,
  onPointsChange,
  onIdentificationChange,
  showRemove = true,
}: CreateQuestionIdentificationProps) {
  const [pointsInput, setPointsInput] = useState<string>(String(question.points ?? ""))
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [answersInput, setAnswersInput] = useState<string>(
    question.identification.correctAnswers.join(", "),
  )

  useEffect(() => {
    setPointsInput(question.points === undefined ? "" : String(question.points))
  }, [question.points])

  useEffect(() => {
    setAnswersInput(question.identification.correctAnswers.join(", "))
  }, [question.id])

  useEffect(() => {
    let cancelled = false

    async function loadPreview() {
      if (!question.imageUrl) {
        setPreviewUrl(null)
        return
      }

      if (question.imageUrl.startsWith("http://") || question.imageUrl.startsWith("https://")) {
        setPreviewUrl(question.imageUrl)
        return
      }

      try {
        const res = await fetch("/api/images/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: question.imageUrl }),
        })

        if (!res.ok) throw new Error("Failed to sign image")
        const data = await res.json()
        if (!cancelled) setPreviewUrl(data.url || null)
      } catch {
        if (!cancelled) setPreviewUrl(null)
      }
    }

    loadPreview()
    return () => {
      cancelled = true
    }
  }, [question.imageUrl])

  return (
    <div className="bg-background p-4 rounded-md space-y-3">
      <div className="flex justify-between items-center">
        {showRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onRemove(question.id)
            }}
            disabled={isSubmitting}
            className="bg-secondary py-1 px-2 rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Remove
          </button>
        )}
      </div>

      <input
        type="text"
        value={question.text}
        onChange={(e) => onQuestionTextChange(question.id, e.target.value)}
        placeholder="Enter question (optional)"
        className="w-full bg-secondary p-2 rounded-md"
      />

      {onQuestionImageChange && (
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Question Image (optional)</label>
          {!question.imageUrl && (
            <QuestionImageUploader
              userId={userId}
              questionId={question.id}
              onUploaded={(url) => onQuestionImageChange(question.id, url)}
            />
          )}
          <input
            type="text"
            value={question.imageUrl ?? ""}
            onChange={(e) => onQuestionImageChange(question.id, e.target.value)}
            placeholder="Or paste an image URL"
            className="w-full bg-secondary p-2 rounded-md"
          />
          {question.imageUrl && (
            <button
              type="button"
              onClick={() => onQuestionImageChange(question.id, "")}
              className="self-start rounded-[var(--radius-button)] bg-secondary px-3 py-1 text-xs font-semibold text-foreground hover:bg-secondary/80"
            >
              Remove Image
            </button>
          )}
          {question.imageUrl && previewUrl && (
            <div className="rounded-md border border-border/60 bg-background p-2">
              <img
                src={previewUrl}
                alt="Question"
                className="max-h-48 w-full rounded-md object-contain"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col w-40">
        <label className="font-semibold">Timer (seconds)</label>
        <input
          type="number"
          min={5}
          value={question.timerLimit}
          onChange={(e) => onTimerChange(question.id, Number(e.target.value))}
          className="w-full bg-secondary p-2 rounded-md"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold">Acceptable Answers (comma-separated)</label>
        <textarea
          value={answersInput}
          onChange={(e) => {
            const nextValue = e.target.value
            setAnswersInput(nextValue)
            onIdentificationChange(question.id, {
              ...question.identification,
              correctAnswers: nextValue
                .split(/[,\n]/)
                .map((value) => value.trim())
                .filter(Boolean),
            })
          }}
          placeholder="e.g. yellow, blue"
          className="w-full bg-secondary p-2 rounded-md"
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col w-48">
          <label>Match Strategy:</label>
          <select
            className="bg-secondary p-2 rounded-md"
            value={question.identification.matchStrategy}
            onChange={(e) =>
              onIdentificationChange(question.id, {
                ...question.identification,
                matchStrategy: e.target.value as IdentificationConfig["matchStrategy"],
              })
            }
          >
            <option value="exact">Exact</option>
            <option value="contains">Contains</option>
            <option value="regex">Regex</option>
          </select>
        </div>

        <div className="flex flex-col w-40">
          <label>Points:</label>
          <input
            type="number"
            min={1}
            value={pointsInput}
            onChange={(e) => {
              setPointsInput(e.target.value)
            }}
            onBlur={() => {
              const nextValue = Number(pointsInput)
              const safeValue = Number.isFinite(nextValue) && nextValue >= 1 ? nextValue : 1
              onPointsChange(question.id, safeValue)
              setPointsInput(String(safeValue))
            }}
            className="w-full bg-secondary p-2 rounded-md"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={question.identification.caseSensitive}
            onChange={(e) =>
              onIdentificationChange(question.id, {
                ...question.identification,
                caseSensitive: e.target.checked,
              })
            }
          />
          Case sensitive (caps must match)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={question.identification.trimWhitespace}
            onChange={(e) =>
              onIdentificationChange(question.id, {
                ...question.identification,
                trimWhitespace: e.target.checked,
              })
            }
          />
          Trim whitespace (leading and trailing)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={question.identification.normalize}
            onChange={(e) =>
              onIdentificationChange(question.id, {
                ...question.identification,
                normalize: e.target.checked,
              })
            }
          />
          Normalize internal spacing
        </label>
      </div>
    </div>
  )
}
