"use client"

import { useState } from "react"
import { v4 as uuid } from "uuid"
import CreateQuestionMCQ from "@/components/create-quiz/CreateQuestionMCQ"
import CreateQuestionTorF from "@/components/create-quiz/CreateQuestionTorF"

type QuestionType = "mcq" | "true-false"

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  text: string
  type: QuestionType
  options: Option[]
  timerLimit: number
  correctAnswer: "true" | "false"
  imageUrl?: string
  points: number
}

function createMcqQuestion(): Question {
  return {
    id: uuid(),
    text: "What is 2 + 2?",
    type: "mcq",
    timerLimit: 30,
    correctAnswer: "true",
    points: 1,
    options: [
      { id: uuid(), text: "3", isCorrect: false },
      { id: uuid(), text: "4", isCorrect: true },
      { id: uuid(), text: "5", isCorrect: false },
      { id: uuid(), text: "6", isCorrect: false },
    ],
  }
}

function createMcqQuestionWithImage(): Question {
  return {
    id: uuid(),
    text: "Identify the animal shown in the image.",
    type: "mcq",
    timerLimit: 30,
    correctAnswer: "true",
    imageUrl: "https://images.unsplash.com/photo-1501706362039-c6e08f7d0c2a?auto=format&fit=crop&w=1200&q=80",
    points: 2,
    options: [
      { id: uuid(), text: "Cat", isCorrect: false },
      { id: uuid(), text: "Dog", isCorrect: false },
      { id: uuid(), text: "Lion", isCorrect: true },
      { id: uuid(), text: "Bear", isCorrect: false },
    ],
  }
}

function createTorFQuestion(): Question {
  return {
    id: uuid(),
    text: "The Earth orbits the Sun.",
    type: "true-false",
    timerLimit: 30,
    correctAnswer: "true",
    points: 1,
    options: [],
  }
}

function createTorFQuestionWithImage(): Question {
  return {
    id: uuid(),
    text: "This is the Eiffel Tower.",
    type: "true-false",
    timerLimit: 30,
    correctAnswer: "true",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    points: 2,
    options: [],
  }
}

export default function DevCreateQuizComponentsPage() {
  const [questions, setQuestions] = useState<Question[]>([
    createMcqQuestion(),
    createMcqQuestionWithImage(),
    createTorFQuestion(),
    createTorFQuestionWithImage(),
  ])

  const setQuestionType = (questionId: string, type: QuestionType) => {
    setQuestions((prev) => {
      return prev.map((q) => {
        if (q.id !== questionId) return q
        if (q.type === type) return q

        if (type === "true-false") {
          return {
            ...q,
            type,
            options: [],
            correctAnswer: "true",
          }
        }

        return {
          ...q,
          type,
          options: [
            { id: uuid(), text: "", isCorrect: true },
            { id: uuid(), text: "", isCorrect: false },
            { id: uuid(), text: "", isCorrect: false },
            { id: uuid(), text: "", isCorrect: false },
          ],
        }
      })
    })
  }

  const addQuestion = (type: QuestionType) => {
    const next = type === "true-false" ? createTorFQuestion() : createMcqQuestion()
    setQuestions((prev) => [...prev, next])
  }

  const updateQuestion = (id: string, updater: (q: Question) => Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updater(q) : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="card p-5 space-y-2">
        <h1 className="text-2xl font-semibold">Create Quiz Components (Dev)</h1>
        <p className="text-muted-foreground">
          This page is for previewing authoring components without touching the real create-quiz page.
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-xl font-semibold">Questions (Dev)</h2>
        <p className="text-muted-foreground">
          Default is MCQ. Switch type per question to preview UI.
        </p>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <select
                  value={question.type}
                  className="bg-background border border-border/60 p-1 rounded-md w-28"
                  onChange={(e) => setQuestionType(question.id, e.target.value as QuestionType)}
                >
                  <option value="mcq">MCQ</option>
                  <option value="true-false">True / False</option>
                </select>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removeQuestion(question.id)
                    }}
                    className="bg-background border border-border/60 py-1 px-2 rounded-[var(--radius-button)]"
                  >
                    Remove
                  </button>
                )}
              </div>

              {question.type === "true-false" ? (
                <CreateQuestionTorF
                  question={question}
                  index={index}
                  isSubmitting={false}
                  onRemove={removeQuestion}
                  showRemove={false}
                  onQuestionTextChange={(id, value) =>
                    updateQuestion(id, (prev) => ({ ...prev, text: value }))
                  }
                  onTimerChange={(questionId, seconds) =>
                    updateQuestion(questionId, (prev) => ({ ...prev, timerLimit: seconds }))
                  }
                  onCorrectAnswerChange={(questionId, value) =>
                    updateQuestion(questionId, (prev) => ({ ...prev, correctAnswer: value }))
                  }
                  onQuestionImageChange={(id, value) =>
                    updateQuestion(id, (prev) => ({ ...prev, imageUrl: value }))
                  }
                  onPointsChange={(id, points) =>
                    updateQuestion(id, (prev) => ({ ...prev, points }))
                  }
                />
              ) : (
                <CreateQuestionMCQ
                  question={question}
                  index={index}
                  isSubmitting={false}
                  onRemove={removeQuestion}
                  showRemove={false}
                  onQuestionTextChange={(id, value) =>
                    updateQuestion(id, (prev) => ({ ...prev, text: value }))
                  }
                  onOptionTextChange={(questionId, optionId, value) =>
                    updateQuestion(questionId, (prev) => ({
                      ...prev,
                      options: prev.options.map((o) => (o.id === optionId ? { ...o, text: value } : o)),
                    }))
                  }
                  onSetCorrect={(questionId, optionId) =>
                    updateQuestion(questionId, (prev) => ({
                      ...prev,
                      options: prev.options.map((o) => ({ ...o, isCorrect: o.id === optionId })),
                    }))
                  }
                  onTimerChange={(questionId, seconds) =>
                    updateQuestion(questionId, (prev) => ({ ...prev, timerLimit: seconds }))
                  }
                  onQuestionImageChange={(id, value) =>
                    updateQuestion(id, (prev) => ({ ...prev, imageUrl: value }))
                  }
                  onPointsChange={(id, points) =>
                    updateQuestion(id, (prev) => ({ ...prev, points }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addQuestion("mcq")}
           className="w-full p-2 border border-gray-400 border-dashed cursor-pointer rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
        
          + Add Question
        </button>
      </div>
    </div>
  )
}
