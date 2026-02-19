"use client"
import { useState } from "react"

interface QuizCardTorFProps {
  question: string
  time: number
  tabSwitch: number
  onSelect: (value: boolean) => void
  onSubmit?: () => void
  submitLabel?: string
  isSubmitDisabled?: boolean
  isSubmitting?: boolean
  imageUrl?: string
}

function QuizCardTorF({
  question,
  time,
  tabSwitch,
  onSelect,
  onSubmit,
  submitLabel = "Submit Answer",
  isSubmitDisabled = false,
  isSubmitting = false,
  imageUrl,
}: QuizCardTorFProps) {
  const [selectedValue, setSelectedValue] = useState<boolean | null>(null)

  const handleSelect = (value: boolean) => {
    setSelectedValue(value)
    onSelect(value)
  }

  const renderChoiceClass = (value: boolean) =>
    [
      "w-full rounded-[var(--radius-button)] border px-4 py-3 text-lg font-semibold transition",
      selectedValue === value
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-foreground border-border/60 hover:bg-primary/10",
    ].join(" ")

  return (
    <div className="card p-4 w-full text-center wrap-anywhere">
      {imageUrl && (
        <div className="mb-4 rounded-[var(--radius-card)] border border-border/60 bg-background p-2">
          <img
            src={imageUrl}
            alt="Question"
            className="max-h-56 w-full rounded-[var(--radius-card)] object-contain"
          />
        </div>
      )}
      <h2 className="font-semibold my-5 text-2xl" onCopy={(e) => e.preventDefault()}>
        {question}
      </h2>

      <div className="mt-4 flex flex-col gap-4 ">
        <div className="flex flex-col items-start text-left w-full">
          <span className="text-xl font-semibold text-muted-foreground">
            Time left:{" "}
            <span className="text-destructive">
              {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}
            </span>
          </span>
          <span className="text-xl font-semibold text-muted-foreground whitespace-nowrap">
            Tab Switches: <span className="text-destructive">{tabSwitch}</span>
          </span>
        </div>

        <div className="w-full flex justify-center">
            <div className="flex w-full flex-row justify-center gap-3 sm:max-w-xs">
                <button type="button" className={renderChoiceClass(true)} onClick={() => handleSelect(true)}>
                    True
                </button>
                <button type="button" className={renderChoiceClass(false)} onClick={() => handleSelect(false)}>
                    False
                </button>
            </div>
        </div>

        
      </div>

      <div className="my-6 h-px w-full bg-border/60" />

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitDisabled || isSubmitting}
        className="w-full rounded-[var(--radius-button)] bg-foreground px-5 py-3 text-lg font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : submitLabel}
      </button>
    </div>
  )
}

export default QuizCardTorF
