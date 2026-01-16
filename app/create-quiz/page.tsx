"use client"

import { useState, useEffect } from "react"
import { v4 as uuid } from "uuid"
import { createQuiz } from "@/lib/helpers/createQuiz"
import { getSession } from "@/lib/auth-actions"

// Question type options
type QuestionType = "mcq" | "true-false"

// Option structure
interface Option {
  id: string
  text: string
  isCorrect: boolean
}

// Question structure
interface Question {
  id: string
  text: string
  type: QuestionType
  options: Option[]
  description: string
  timerLimit: number // NEW: timer per question in seconds
}

// Main Create Quiz Page
export default function CreateQuizPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion()])

  // Proctoring settings
  const [blurQuestion, setBlurQuestion] = useState(false)
  const [disableCopyPaste, setDisableCopyPaste] = useState(false)
  const [tabMonitoring, setTabMonitoring] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession()
      if (session?.userId) setUserId(session?.userId)
    }
    fetchUser()
  }, [])

  function createEmptyQuestion(): Question {
    return {
      id: uuid(),
      text: "",
      description: "",
      type: "mcq",
      timerLimit: 30, // default 30 seconds
      options: [
        { id: uuid(), text: "", isCorrect: true },
        { id: uuid(), text: "", isCorrect: false },
        { id: uuid(), text: "", isCorrect: false },
        { id: uuid(), text: "", isCorrect: false },
      ],
    }
  }

  const addQuestion = () => setQuestions(prev => [...prev, createEmptyQuestion()])
  const removeQuestion = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id))
  const updateQuestionText = (id: string, newText: string) =>
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, text: newText } : q)))
  const updateOptionText = (questionId: string, optionId: string, newText: string) =>
    setQuestions(prev =>
      prev.map(q =>
        q.id !== questionId
          ? q
          : {
              ...q,
              options: q.options.map(o => (o.id === optionId ? { ...o, text: newText } : o)),
            },
      ),
    )
  const setCorrectAnswer = (questionId: string, optionId: string) =>
    setQuestions(prev =>
      prev.map(q =>
        q.id !== questionId
          ? q
          : {
              ...q,
              options: q.options.map(o => ({ ...o, isCorrect: o.id === optionId })),
            },
      ),
    )
  const setQuestionType = (questionId: string, newType: QuestionType) =>
    setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, type: newType } : q)))
  const setQuestionTimer = (questionId: string, seconds: number) =>
    setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, timerLimit: seconds } : q)))

  const submitQuiz = async () => {
    if (!userId) return alert("User not logged in")
    if (!title) return alert("Quiz title cannot be empty")
    if (questions.length === 0) return alert("Add at least one question")

    try {
      const quiz = await createQuiz(
          userId,
          title,
          questions,
          description,
          blurQuestion,
          disableCopyPaste,
          tabMonitoring
        )

      alert(`Quiz created! ID: ${quiz.quizId}, Joined Code: ${quiz.joinCode}`)
      setTitle("")
      setDescription("")
      setQuestions([createEmptyQuestion()])
      setBlurQuestion(false)
      setDisableCopyPaste(false)
      setTabMonitoring(false)
    } catch (err) {
      console.error(err)
      alert("Failed to create quiz")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submitQuiz() }}>
        {/* Quiz Info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-2xl font-semibold">Quiz Information</h2>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background p-3 rounded-md"
              placeholder="Quiz title"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background p-3 rounded-md"
              rows={2}
              placeholder="Quiz description"
            />
          </div>
        </div>

        {/* Proctoring */}
        <div className="card p-5 space-y-3">
          <h2 className="text-2xl font-semibold">Proctoring Features</h2>
          <div className="flex gap-2 items-center">
            <input type="checkbox" checked={blurQuestion} onChange={(e) => setBlurQuestion(e.target.checked)} />
            <p className="font-semibold">👁️ Window and Tab Monitoring</p>
          </div>
          {/* <div className="flex gap-2 items-center">
            <input type="checkbox" checked={disableCopyPaste} onChange={(e) => setDisableCopyPaste(e.target.checked)} />
            <p className="font-semibold">🚫 Disable Copy & Paste</p>
          </div> */}
          {/* <div className="flex gap-2 items-center">
            <input type="checkbox" checked={tabMonitoring} onChange={(e) => setTabMonitoring(e.target.checked)} />
            <p className="font-semibold">📊 Tab Monitoring</p>
          </div> */}
        </div>

        {/* Questions Section */}
        <div className="card p-5 space-y-4">
          <h2 className="text-2xl font-semibold">Questions</h2>

          {questions.map((question, index) => (
            <div key={question.id} className="bg-background p-4 rounded-md space-y-3">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h3>Question {index + 1}</h3>
                <div className="flex gap-2">
                  <select
                    value={question.type}
                    className="bg-secondary p-1 rounded-md w-28"
                    onChange={(e) => setQuestionType(question.id, e.target.value as QuestionType)}
                  >
                    <option value="mcq">MCQ</option>
                    <option value="true-false">True / False</option>
                  </select>
                  <button
                    onClick={(e) => { e.preventDefault(); removeQuestion(question.id) }}
                    className="bg-secondary py-1 px-2 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestionText(question.id, e.target.value)}
                placeholder="Enter question"
                className="w-full bg-secondary p-2 rounded-md"
              />

              {/* Timer per question */}
              <div className="flex flex-col w-40">
                <label className="font-semibold">Timer (seconds)</label>
                <input
                  type="number"
                  min={5}
                  value={question.timerLimit}
                  onChange={(e) => setQuestionTimer(question.id, Number(e.target.value))}
                  className="w-full bg-secondary p-2 rounded-md"
                />
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {question.options.map((option, i) => (
                  <input
                    key={option.id}
                    value={option.text}
                    onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="w-full bg-secondary p-2 rounded-md"
                  />
                ))}
              </div>

              {/* Correct answer selector */}
              <div className="flex flex-col w-40">
                <label>Correct Answer:</label>
                <select
                  className="bg-secondary p-1 rounded"
                  value={question.options.find(o => o.isCorrect)?.id || ""}
                  onChange={(e) => setCorrectAnswer(question.id, e.target.value)}
                >
                  {question.options.map((option, i) => (
                    <option key={option.id} value={option.id}>
                      Option {String.fromCharCode(65 + i)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            onClick={(e) => { e.preventDefault(); addQuestion() }}
            className="w-full p-2 border border-dashed rounded-md"
          >
            + Add Question
          </button>
        </div>

        <button type="submit" className="w-full bg-primary p-3 font-semibold rounded-md">
          Create Quiz
        </button>
      </form>
    </div>
  )
}
