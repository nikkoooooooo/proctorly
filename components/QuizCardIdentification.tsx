"use client"

interface QuizCardIdentificationProps {
  question?: string
  value: string
  onChange: (value: string) => void
  time: number
  tabSwitch: number
  imageUrl?: string
  showCapsLockLabel?: boolean
}

export default function QuizCardIdentification({
  question,
  value,
  onChange,
  time,
  tabSwitch,
  imageUrl,
  showCapsLockLabel,
}: QuizCardIdentificationProps) {
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
      <h2
        className="font-semibold my-5 text-2xl"
        onCopy={(e) => e.preventDefault()}
      >
        {question}
      </h2>

      <div className="flex flex-col items-start">
        <span className="text-2xl font-semibold text-muted-foreground">
          Time left:{" "}
          <span className="text-destructive">
            {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}
          </span>
        </span>
        <span className="text-2xl font-semibold text-muted-foreground">
          Tab Switches: <span className="text-destructive">{tabSwitch}</span>
        </span>
      </div>

      <div className="mt-4">
        {showCapsLockLabel && (
          <div className="mb-2 text-sm font-semibold text-destructive">
            Answer must be CAPS LOCK
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here"
          className="w-full bg-background p-4 rounded-[var(--radius-card)] text-left text-xl font-semibold"
          rows={4}
        />
      </div>
    </div>
  )
}
