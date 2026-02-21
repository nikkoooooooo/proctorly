"use client"

import { useState, useEffect } from "react"
import { v4 as uuid } from "uuid"
import { createQuiz, QuestionInput } from "@/lib/quiz/helpers/createQuiz"
import { authClient } from "@/client/auth-client"
import Link from "next/link"
import toast from "react-hot-toast"
import { Copy } from "lucide-react"
import CreateQuestionMCQ from "@/components/create-quiz/CreateQuestionMCQ"
import CreateQuestionTorF from "@/components/create-quiz/CreateQuestionTorF"

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
  points: number
  correctAnswer: "true" | "false"
  imageUrl?: string
}

// Main Create Quiz Page
export default function CreateQuizPage() {
  const { data } = authClient.useSession()
  const user = data?.user
  const session = data?.session

  

  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion()])
  const [createdQuizCode, setCreatedQuizCode] = useState<string | null>(null)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [isCopyingCode, setIsCopyingCode] = useState(false)

  // Proctoring settings
  const [blurQuestion, setBlurQuestion] = useState(false)
  const [disableCopyPaste, setDisableCopyPaste] = useState(false)
  const [tabMonitoring, setTabMonitoring] = useState(false)


  useEffect(() => {
    if (!user) return
    setUserId(user.id)
  }, [user])

 

  function createEmptyQuestion(): Question {
    return {
      id: uuid(),
      text: "",
      description: "",
      type: "mcq",
      timerLimit: 30, // default 30 seconds
      points: 1,
      correctAnswer: "true",
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
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q
        if (q.type === newType) return q
        if (newType === "true-false") {
          return {
            ...q,
            type: newType,
            correctAnswer: "true",
            options: [],
          }
        }
        return {
          ...q,
          type: newType,
          options: [
            { id: uuid(), text: "", isCorrect: true },
            { id: uuid(), text: "", isCorrect: false },
            { id: uuid(), text: "", isCorrect: false },
            { id: uuid(), text: "", isCorrect: false },
          ],
        }
      }),
    )
  const setQuestionTimer = (questionId: string, seconds: number) =>
    setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, timerLimit: seconds } : q)))
  const setQuestionPoints = (questionId: string, points: number) =>
    setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, points } : q)))
  const setQuestionImage = (questionId: string, imageUrl: string) =>
    setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, imageUrl } : q)))
  const setCorrectAnswerTorF = (questionId: string, value: "true" | "false") =>
    setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, correctAnswer: value } : q)))

  const submitQuiz = async () => {
    if (isSubmittingQuiz) return
    if (!userId) return alert("User not logged in")
    if (!title) return alert("Quiz title cannot be empty")
    if (questions.length === 0) return alert("Add at least one question")

    setIsSubmittingQuiz(true)
    try {
      const normalizedQuestions: QuestionInput[] = questions.map((q) => {
        if (q.type === "true-false") {
          return {
            text: q.text,
            type: q.type,
            timerLimit: q.timerLimit,
            points: q.points ?? 1,
            imageUrl: q.imageUrl,
            options: [
              { text: "True", isCorrect: q.correctAnswer === "true" },
              { text: "False", isCorrect: q.correctAnswer === "false" },
            ],
          }
        }
        return {
          text: q.text,
          type: q.type,
          timerLimit: q.timerLimit,
          points: q.points ?? 1,
          imageUrl: q.imageUrl,
          options: q.options.map((opt) => ({ text: opt.text, isCorrect: opt.isCorrect })),
        }
      })

      const quiz = await createQuiz(
        userId,
        title,
        normalizedQuestions,
        description,
        blurQuestion,
        disableCopyPaste,
        tabMonitoring
      )

      // Show a friendly success toast instead of browser alert
      toast.success("Quiz created successfully!")
      // Save join code for the on-page copy UI
      setCreatedQuizCode(quiz.joinCode)
      setTitle("")
      setDescription("")
      setQuestions([createEmptyQuestion()])
      setBlurQuestion(false)
      setDisableCopyPaste(false)
      setTabMonitoring(false)
    } catch (err) {
      console.error(err)
      // Use toast for errors to keep UX consistent
      toast.error("Failed to create quiz")
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
          <Link href={"/dashboard"} className="text-4xl font-bold">←</Link>
      </div>
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

        {/* Created quiz code modal */}
        {createdQuizCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
            {/* Modal card */}
            <div className="card w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Quiz Created</h2>
                {/* Close modal */}
                <button
                  type="button"
                  onClick={() => setCreatedQuizCode(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <p className="text-muted-foreground">
                Share this join code with your students.
              </p>
              <div className="flex items-center gap-3">
                <span className="bg-primary/20 text-primary px-3 py-2 rounded-[var(--radius-button)] font-semibold">
                  {createdQuizCode}
                </span>
                {/* Copy button for quick sharing */}
                <button
                  type="button"
                  onClick={async () => {
                    if (isCopyingCode) return
                    setIsCopyingCode(true)
                    try {
                      await navigator.clipboard.writeText(createdQuizCode)
                      toast.success("Code copied")
                    } catch (error) {
                      console.error("Failed to copy code:", error)
                      toast.error("Failed to copy code")
                    } finally {
                      setIsCopyingCode(false)
                    }
                  }}
                  disabled={isCopyingCode}
                  className="bg-secondary text-secondary-foreground px-3 py-2 rounded-[var(--radius-button)] hover:bg-secondary/80 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Copy quiz code"
                  title="Copy quiz code"
                >
                  {isCopyingCode ? "Copying..." : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Proctoring */}
        <div className="card p-5 space-y-3">
          <h2 className="text-2xl font-semibold">Proctoring Features</h2>
          <div className="flex gap-2 items-center">
            <input type="checkbox" checked={blurQuestion} onChange={(e) => setBlurQuestion(e.target.checked)} />
            <p className="font-semibold">👁️ Window and Tab Monitoring</p>
          </div>
        </div>

        {/* Questions Section */}
        <div className="card p-5 space-y-4">
          <h2 className="text-2xl font-semibold">Questions</h2>

          {questions.map((question, index) => (
            <div key={question.id} className="bg-background p-4 rounded-md space-y-3">
              {/* Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3>Question {index + 1}</h3>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={question.type}
                    className="bg-secondary p-1 rounded-md w-28"
                    onChange={(e) => setQuestionType(question.id, e.target.value as QuestionType)}
                  >
                    <option value="mcq">MCQ</option>
                    <option value="true-false">True / False</option>
                  </select>
                  {questions.length >= 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeQuestion(question.id);
                        }}
                        disabled={isSubmittingQuiz}
                        className="bg-secondary py-1 px-2 rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    )}
                </div>
              </div>

              {question.type === "true-false" ? (
                <CreateQuestionTorF
                  question={question}
                  index={index}
                  isSubmitting={isSubmittingQuiz}
                  onRemove={removeQuestion}
                  showRemove={false}
                  onQuestionTextChange={updateQuestionText}
                  onTimerChange={setQuestionTimer}
                  onCorrectAnswerChange={setCorrectAnswerTorF}
                  onQuestionImageChange={setQuestionImage}
                  onPointsChange={setQuestionPoints}
                />
              ) : (
                <CreateQuestionMCQ
                  question={question}
                  index={index}
                  isSubmitting={isSubmittingQuiz}
                  onRemove={removeQuestion}
                  showRemove={false}
                  onQuestionTextChange={updateQuestionText}
                  onOptionTextChange={updateOptionText}
                  onSetCorrect={setCorrectAnswer}
                  onTimerChange={setQuestionTimer}
                  onQuestionImageChange={setQuestionImage}
                  onPointsChange={setQuestionPoints}
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); addQuestion() }}
            disabled={isSubmittingQuiz}
            className="w-full p-2 border border-gray-400 border-dashed cursor-pointer rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            + Add Question
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmittingQuiz}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 p-3 font-semibold rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmittingQuiz ? "Creating..." : "Create Quiz"}
        </button>
      </form>
    </div>
  )
}
