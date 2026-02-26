"use client"

import { useEffect, useState, use } from "react"
import { v4 as uuid } from "uuid"
import Link from "next/link"
import toast from "react-hot-toast"
import { authClient } from "@/client/auth-client"
import CreateQuestionMCQ from "@/components/create-quiz/CreateQuestionMCQ"
import CreateQuestionTorF from "@/components/create-quiz/CreateQuestionTorF"
import { getQuizForEditAction } from "@/lib/quiz/actions/getQuizForEditAction"
import { updateQuizAction } from "@/lib/quiz/actions/updateQuizAction"

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
  description: string
  timerLimit: number
  points: number
  correctAnswer: "true" | "false"
  imageUrl?: string
}

type LoadedQuestion = {
  id: string
  text: string
  type: string
  timerLimit?: number | null
  points?: number | null
  imageUrl?: string | null
  options?: Array<{ id: string; text: string; isCorrect: boolean | null }>
}

interface EditPageProps {
  params: Promise<{ quizId: string }>
}

export default function EditQuizPage({ params }: EditPageProps) {
  const { quizId } = use<{ quizId: string }>(params)

  const { data } = authClient.useSession()
  const user = data?.user
  const [userId, setUserId] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [blurQuestion, setBlurQuestion] = useState(false)

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
      timerLimit: 30,
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

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        const res = await getQuizForEditAction(quizId)
        if (!res.success || !res.quiz) {
          const message = res.error ?? "Failed to load quiz"
          toast.error(message)
          setLoadError(message)
          return
        }

        setTitle(res.quiz.title ?? "")
        setDescription(res.quiz.description ?? "")
        setBlurQuestion(!!res.quiz.blurQuestion)

        const mapped: Question[] = res.questions.map((q: LoadedQuestion) => {
          const rawType = q.type === "true-false" ? "true-false" : "mcq"
          const options: Option[] = (q.options ?? []).map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: !!o.isCorrect,
          }))
          if (rawType === "true-false") {
            const trueOption = options.find((o) => o.text.toLowerCase() === "true")
            const falseOption = options.find((o) => o.text.toLowerCase() === "false")
            const correctAnswer = trueOption?.isCorrect ? "true" : falseOption?.isCorrect ? "false" : "true"
            return {
              id: q.id,
              text: q.text,
              description: "",
              type: rawType,
              timerLimit: q.timerLimit ?? 30,
              points: q.points ?? 1,
              correctAnswer,
              options: [],
              imageUrl: q.imageUrl ?? undefined,
            }
          }

          return {
            id: q.id,
            text: q.text,
            description: "",
            type: rawType,
            timerLimit: q.timerLimit ?? 30,
            points: q.points ?? 1,
            correctAnswer: "true",
            options,
            imageUrl: q.imageUrl ?? undefined,
          }
        })

        setQuestions(mapped.length > 0 ? mapped : [createEmptyQuestion()])
      } catch (err) {
        console.error(err)
        toast.error("Failed to load quiz")
      } finally {
        setIsLoading(false)
      }
    }

    loadQuiz()
  }, [quizId])

  const addQuestion = () => setQuestions((prev) => [...prev, createEmptyQuestion()])
  const removeQuestion = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id))

  const updateQuestionText = (id: string, newText: string) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text: newText } : q)))

  const updateOptionText = (questionId: string, optionId: string, newText: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, text: newText } : o)),
            },
      ),
    )

  const setCorrectAnswer = (questionId: string, optionId: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : {
              ...q,
              options: q.options.map((o) => ({ ...o, isCorrect: o.id === optionId })),
            },
      ),
    )

  const setQuestionType = (questionId: string, newType: QuestionType) =>
    setQuestions((prev) =>
      prev.map((q) => {
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
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, timerLimit: seconds } : q)))

  const setQuestionPoints = (questionId: string, points: number) =>
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, points } : q)))

  const setQuestionImage = (questionId: string, imageUrl: string) =>
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, imageUrl } : q)))

  const setCorrectAnswerTorF = (questionId: string, value: "true" | "false") =>
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, correctAnswer: value } : q)))

  const submitQuiz = async () => {
    if (isSubmitting) return
    if (!title) return alert("Quiz title cannot be empty")
    if (questions.length === 0) return alert("Add at least one question")
    if (
      questions.some((q) => {
        const hasText = q.text.trim().length > 0
        const hasImage = (q.imageUrl ?? "").trim().length > 0
        return !hasText && !hasImage
      })
    ) {
      toast.error("Each question must have text or an image")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title,
        description,
        blurQuestion,
        questions,
      }
      const res = await updateQuizAction(quizId, payload)
      if (!res.success) {
        toast.error(res.error ?? "Failed to update quiz")
        return
      }
      toast.success("Quiz updated successfully!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (loadError) {
    return (
      <div className="p-6 space-y-4">
        <Link href={"/created-quiz"} className="text-2xl font-bold">← Back</Link>
        <p className="text-foreground">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href={"/created-quiz"} className="text-4xl font-bold">←</Link>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submitQuiz() }}>
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

        <div className="card p-5 space-y-3">
          <h2 className="text-2xl font-semibold">Proctoring Features</h2>
          <div className="flex gap-2 items-center">
            <input type="checkbox" checked={blurQuestion} onChange={(e) => setBlurQuestion(e.target.checked)} />
            <p className="font-semibold">👁️ Window and Tab Monitoring</p>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-2xl font-semibold">Questions</h2>

          {questions.map((question, index) => (
            <div key={question.id} className="bg-background p-4 rounded-md space-y-3">
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
                        e.preventDefault()
                        removeQuestion(question.id)
                      }}
                      disabled={isSubmitting}
                      className="bg-secondary py-1 px-2 rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {question.type === "true-false" ? (
                <CreateQuestionTorF
                  userId={userId ?? ""}
                  question={question}
                  index={index}
                  isSubmitting={isSubmitting}
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
                  userId={userId ?? ""}
                  question={question}
                  index={index}
                  isSubmitting={isSubmitting}
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
            onClick={(e) => {
              e.preventDefault()
              addQuestion()
            }}
            disabled={isSubmitting}
            className="w-full p-2 border border-gray-400 border-dashed cursor-pointer rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            + Add Question
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 p-3 font-semibold rounded-[var(--radius-button)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
