"use client"

import { useEffect, useState } from "react"
import QuestionImageUploader from "@/components/QuestionImageUploader"
interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  text: string
  type: "mcq" | "true-false"
  options: Option[]
  timerLimit: number
  imageUrl?: string
  points: number
}

interface CreateQuestionMCQProps {
  question: Question
  index: number
  isSubmitting: boolean
  onRemove: (id: string) => void
  onQuestionTextChange: (id: string, value: string) => void
  onOptionTextChange: (questionId: string, optionId: string, value: string) => void
  onSetCorrect: (questionId: string, optionId: string) => void
  onTimerChange: (questionId: string, seconds: number) => void
  onQuestionImageChange?: (id: string, value: string) => void
  onPointsChange: (questionId: string, points: number) => void
  showRemove?: boolean
}

export default function CreateQuestionMCQ({
  question,
  index,
  isSubmitting,
  onRemove,
  onQuestionTextChange,
  onOptionTextChange,
  onSetCorrect,
  onTimerChange,
  onQuestionImageChange,
  onPointsChange,
  showRemove = true,
}: CreateQuestionMCQProps) {
  const [pointsInput, setPointsInput] = useState<string>(String(question.points ?? ""))

  useEffect(() => {
    setPointsInput(question.points === undefined ? "" : String(question.points))
  }, [question.points])
  return (
    <div className="bg-background p-4 rounded-md space-y-3">
      <div className="flex justify-between items-center">
        {/* <h3>Question {index + 1}</h3> */}
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
          {question.imageUrl && (
            <div className="rounded-md border border-border/60 bg-background p-2">
              <img
                src={question.imageUrl}
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
        {question.options.map((option, i) => (
          <input
            key={option.id}
            value={option.text}
            onChange={(e) => onOptionTextChange(question.id, option.id, e.target.value)}
            placeholder={`Option ${String.fromCharCode(65 + i)}`}
            className="w-full bg-secondary p-2 rounded-md"
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col w-40">
          <label>Correct Answer:</label>
          <select
            className="bg-secondary p-2 rounded-md"
            value={question.options.find((o) => o.isCorrect)?.id || ""}
            onChange={(e) => onSetCorrect(question.id, e.target.value)}
          >
            {question.options.map((option, i) => (
              <option key={option.id} value={option.id}>
                Option {String.fromCharCode(65 + i)}
              </option>
            ))}
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
    </div>
  )
}
