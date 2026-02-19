"use client"

import { useState } from "react"
import QuizCardMCQ from "@/components/QuizCardMCQ"
import QuizCardTorF from "@/components/QuizCardTorF"

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

export default function DevQuizCardsPage() {
  const [mcqSelection, setMcqSelection] = useState<Option | null>(null)
  const [torfSelection, setTorfSelection] = useState<boolean | null>(null)

  const mcqChoices: Option[] = [
    { id: "a", text: "Option A", isCorrect: false },
    { id: "b", text: "Option B", isCorrect: true },
    { id: "c", text: "Option C", isCorrect: false },
    { id: "d", text: "Option D", isCorrect: false },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="card p-5 space-y-2">
        <h1 className="text-2xl font-semibold">Quiz Cards (Dev)</h1>
        <p className="text-muted-foreground">
          This page previews quiz-taking cards without touching the real quiz flow.
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-xl font-semibold">MCQ Card</h2>
        <QuizCardMCQ
          question="Which planet is known as the Red Planet?"
          choices={mcqChoices}
          onSelect={(choice) => setMcqSelection(choice)}
          time={30}
          tabSwitch={2}
        />
        <p className="text-muted-foreground">
          Selected: {mcqSelection ? mcqSelection.text : "None"}
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-xl font-semibold">MCQ Card (With Image)</h2>
        <QuizCardMCQ
          question="Identify the animal in the image."
          choices={mcqChoices}
          onSelect={(choice) => setMcqSelection(choice)}
          time={30}
          tabSwitch={2}
          imageUrl="https://images.unsplash.com/photo-1501706362039-c6e08f7d0c2a?auto=format&fit=crop&w=1200&q=80"
        />
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-xl font-semibold">True / False Card</h2>
        <QuizCardTorF
          question="Light travels faster than sound."
          time={30}
          tabSwitch={1}
          onSelect={(value) => setTorfSelection(value)}
          onSubmit={() => {}}
          submitLabel="Submit Answer"
        />
        <p className="text-muted-foreground">
          Selected: {torfSelection === null ? "None" : torfSelection ? "True" : "False"}
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-xl font-semibold">True / False Card (With Image)</h2>
        <QuizCardTorF
          question="This is the Eiffel Tower."
          time={30}
          tabSwitch={1}
          onSelect={(value) => setTorfSelection(value)}
          onSubmit={() => {}}
          submitLabel="Submit Answer"
          imageUrl="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
        />
      </div>
    </div>
  )
}
