"use client"
import { useState } from "react"

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizCardProps {
  question: string
  choices: Option[]
  onSelect: (choice: Option) => void   // <-- callback FROM parent
  time: number
  tabSwitch: number
  imageUrl?: string
}



export default function QuizCard({ question, choices, onSelect, time, tabSwitch, imageUrl  }: QuizCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const labels = ["A", "B", "C", "D"]

  const handleClick = (choice: Option) => {
    setSelectedId(choice.id)
    onSelect(choice)    // <-- pass selected option TO parent
  }

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
      onCopy={(e) => e.preventDefault()}>
        {question}
      </h2>

      <div className="flex flex-col items-start">
          {/* Use muted-foreground so labels are readable in both themes */}
          <span className="text-2xl font-semibold text-muted-foreground">
            Time left: <span className="text-destructive">{Math.floor(time/60)}:{String(time%60).padStart(2,'0')}</span>
          </span>
          <span className="text-2xl font-semibold text-muted-foreground">
            Tab Switches: <span className="text-destructive">{tabSwitch}</span>
          </span>
      </div>


      <div className="flex flex-col gap-2 mt-4">
        {(choices || []).map((choice, index) => (
          <div key={choice.id} className="bg-background p-4 rounded-[var(--radius-card)]">
            <div className="flex gap-4 items-center">

              <span className="p-2 bg-primary/20 text-primary rounded-[50%] w-10">
                {labels[index] || String.fromCharCode(65 + index)}
              </span>

              <button
                onClick={() => handleClick(choice)}
                className={`
                  cursor-pointer font-semibold text-xl px-4 py-2 rounded-[var(--radius-button)] w-full text-left transition
                  ${selectedId === choice.id ? "bg-primary text-primary-foreground" : "bg-background"}
                  hover:bg-primary/20
                `}
              >
                {choice.text}
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
