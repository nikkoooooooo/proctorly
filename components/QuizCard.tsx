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
}

export default function QuizCard({ question, choices, onSelect }: QuizCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const labels = ["A", "B", "C", "D"]

  const handleClick = (choice: Option) => {
    setSelectedId(choice.id)
    onSelect(choice)    // <-- pass selected option TO parent
  }

  return (
    <div className="card p-4 w-full text-center">
      <h2 
      className="font-semibold my-10 text-2xl" 
      onCopy={(e) => e.preventDefault()}>
        {question}
      </h2>

      <div className="flex flex-col gap-2">
        {choices.map((choice, index) => (
          <div key={choice.id} className="bg-background p-4 rounded-md">
            <div className="flex gap-4 items-center">

              <span className="p-2 bg-[#3b82f630] text-primary rounded-[50%] w-10">
                {labels[index] || String.fromCharCode(65 + index)}
              </span>

              <button
                onClick={() => handleClick(choice)}
                className={`
                  cursor-pointer font-semibold text-xl px-4 py-2 rounded-md w-full text-left transition
                  ${selectedId === choice.id ? "bg-blue-500 text-white" : "bg-background"}
                  hover:bg-blue-300
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
