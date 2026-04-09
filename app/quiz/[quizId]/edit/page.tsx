"use client"

import { useEffect, useState, use } from "react"
import { v4 as uuid } from "uuid"
import Link from "next/link"
import toast from "react-hot-toast"
import { authClient } from "@/client/auth-client"
import CreateQuestionMCQ from "@/components/create-quiz/CreateQuestionMCQ"
import CreateQuestionTorF from "@/components/create-quiz/CreateQuestionTorF"
import CreateQuestionIdentification, { type IdentificationConfig } from "@/components/create-quiz/CreateQuestionIdentification"
import { getQuizForEditAction } from "@/lib/quiz/actions/getQuizForEditAction"
import { updateQuizAction } from "@/lib/quiz/actions/updateQuizAction"
import { saveQuizCertificateCustomizationAction } from "@/lib/certificate/actions/saveQuizCertificateCustomizationAction"

type QuestionType = "mcq" | "true-false" | "identification"

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
  identification: IdentificationConfig
}

type LoadedQuestion = {
  id: string
  text: string
  type: string
  timerLimit?: number | null
  points?: number | null
  imageUrl?: string | null
  correctAnswers?: unknown
  matchStrategy?: string | null
  caseSensitive?: boolean | null
  trimWhitespace?: boolean | null
  normalize?: boolean | null
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
  const [isReadOnly, setIsReadOnly] = useState(false)

  const [blurQuestion, setBlurQuestion] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")
  const [passingPercentage, setPassingPercentage] = useState("")
  const [retakeLimit, setRetakeLimit] = useState(0)
  const [isPaidQuiz, setIsPaidQuiz] = useState(false)
  const [paidQuizFee, setPaidQuizFee] = useState("")
  const [certificateEnabled, setCertificateEnabled] = useState(false)
  const [certificateDescription, setCertificateDescription] = useState("")
  const [certificateInstructorLabel, setCertificateInstructorLabel] = useState("")
  const [certificateInstructorValue, setCertificateInstructorValue] = useState("")
  const [certificateShowScore, setCertificateShowScore] = useState(true)
  const [certificateLogoFile, setCertificateLogoFile] = useState<File | null>(null)
  const [certificateSignatureFile, setCertificateSignatureFile] = useState<File | null>(null)
  const CERT_DESCRIPTION_MAX = 160

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
      identification: {
        correctAnswers: [],
        matchStrategy: "exact",
        caseSensitive: false,
        trimWhitespace: true,
        normalize: false,
      },
      options: [
        { id: uuid(), text: "", isCorrect: true },
        { id: uuid(), text: "", isCorrect: false },
        { id: uuid(), text: "", isCorrect: false },
        { id: uuid(), text: "", isCorrect: false },
      ],
    }
  }

  const toLocalDatetimeInputValue = (value?: string | Date | null) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    const offsetMs = date.getTimezoneOffset() * 60000
    const local = new Date(date.getTime() - offsetMs)
    return local.toISOString().slice(0, 16)
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
        setExpiresAt(toLocalDatetimeInputValue(res.quiz.expiresAt))
        setIsReadOnly(!!res.readOnly)
        setPassingPercentage(
          res.quiz.passingPercentage != null ? String(res.quiz.passingPercentage) : ""
        )
        setRetakeLimit(res.quiz.retakeLimit ?? 0)
        setIsPaidQuiz(!!res.quiz.isPaidQuiz)
        setPaidQuizFee(
          res.quiz.paidQuizFee != null ? String(res.quiz.paidQuizFee / 100) : ""
        )
        setCertificateEnabled(!!res.quiz.certificateEnabled)
        setCertificateDescription(res.quiz.certificateDescription ?? "")
        setCertificateInstructorLabel(res.quiz.certificateInstructorLabel ?? "")
        setCertificateInstructorValue(res.quiz.certificateInstructorValue ?? "")
        setCertificateShowScore(res.quiz.certificateShowScore ?? true)

        
        const mapped: Question[] = res.questions.map((q: LoadedQuestion) => {
          const rawType: QuestionType =
            q.type === "true-false" ? "true-false" : q.type === "identification" ? "identification" : "mcq"
          const options: Option[] = (q.options ?? []).map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: !!o.isCorrect,
          }))
          const identification: IdentificationConfig = {
            correctAnswers: Array.isArray(q.correctAnswers) ? (q.correctAnswers as string[]) : [],
            matchStrategy:
              q.matchStrategy === "contains" || q.matchStrategy === "regex" ? q.matchStrategy : "exact",
            caseSensitive: q.caseSensitive ?? false,
            trimWhitespace: q.trimWhitespace ?? true,
            normalize: q.normalize ?? false,
          }
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
              identification,
            }
          }
          if (rawType === "identification") {
            return {
              id: q.id,
              text: q.text,
              description: "",
              type: rawType,
              timerLimit: q.timerLimit ?? 30,
              points: q.points ?? 1,
              correctAnswer: "true",
              options: [],
              imageUrl: q.imageUrl ?? undefined,
              identification,
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
            identification,
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

  const updateIdentificationConfig = (questionId: string, value: IdentificationConfig) =>
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, identification: value } : q)))

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
        if (newType === "identification") {
          return {
            ...q,
            type: newType,
            options: [],
            identification: {
              correctAnswers: [],
              matchStrategy: "exact",
              caseSensitive: false,
              trimWhitespace: true,
              normalize: false,
            },
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
    if (!isReadOnly) {
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
      if (questions.some((q) => q.type === "identification" && q.identification.correctAnswers.length === 0)) {
        toast.error("Identification questions must have at least one acceptable answer")
        return
      }
      const passingValue = passingPercentage ? Number(passingPercentage) : null
      if (passingValue === null) {
        toast.error("Passing percentage is required")
        return
      }
      if (Number.isNaN(passingValue) || passingValue <= 0 || passingValue > 100) {
        toast.error("Passing percentage must be between 1 and 100")
        return
      }
      if (Number.isNaN(retakeLimit) || retakeLimit < 0) {
        toast.error("Retake limit must be 0 or higher")
        return
      }
      if (isPaidQuiz) {
        if (!paidQuizFee || Number(paidQuizFee) < 100) {
          toast.error("Minimum quiz fee is 100")
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title,
        description,
        blurQuestion,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        expiryOnly: isReadOnly,
        retakeLimit,
        isPaidQuiz,
        paidQuizFee: isPaidQuiz ? Math.round(Number(paidQuizFee) * 100) : null,
        passingPercentage: passingPercentage ? Number(passingPercentage) : null,
        certificateEnabled,
        certificateShowScore,
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

      {isReadOnly && (
        <div className="card p-4 text-sm text-muted-foreground">
          This quiz already has attempts. You can still edit expiry, passing percentage,
          retake limit, and certificate settings.
        </div>
      )}

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submitQuiz() }}>
        <div className="card p-5 space-y-4">
          <h2 className="text-2xl font-semibold">Quiz Information</h2>
          <fieldset disabled={isReadOnly || isSubmitting} className="space-y-4">
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
          </fieldset>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Passing percentage</label>
              <input
                type="number"
                min="1"
                max="100"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(e.target.value)}
                className="bg-background p-3 rounded-md"
                placeholder="Set a passing percentage (1–100)"
              />
              <p className="text-sm text-muted-foreground">Leave blank if not required.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Retake limit</label>
              <input
                type="number"
                min="0"
                value={retakeLimit}
                onChange={(e) => setRetakeLimit(Number(e.target.value))}
                className="bg-background p-3 rounded-md"
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground">
                0 = no retake. 1 = allow one retake (2 total attempts).
              </p>
            </div>
          </fieldset>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Expiry (creator local time)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-background p-3 rounded-md datetime-white"
            />
            <p className="text-sm text-muted-foreground">Leave blank for no expiry.</p>
          </div>
        </div>

        <fieldset disabled={isReadOnly || isSubmitting}>
          <div className="card p-5 space-y-3">
            <h2 className="text-2xl font-semibold">Certification</h2>
            <p className="text-sm text-muted-foreground">
              Enable certificates for students who complete this quiz.
            </p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={certificateEnabled}
                onChange={(e) => setCertificateEnabled(e.target.checked)}
              />
              Enable Certificate
            </label>
            <p className="text-sm text-muted-foreground">
              Uses the ProctorlyX default certificate template.
            </p>
            {certificateEnabled && (
              <p className="text-xs text-muted-foreground">
                Final score and issue date are included on every certificate.
              </p>
            )}
            {certificateEnabled && (
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Certificate Description (optional)</label>
                  <textarea
                    value={certificateDescription}
                    onChange={(e) => setCertificateDescription(e.target.value)}
                    className="bg-background p-3 rounded-[var(--radius-button)]"
                    rows={2}
                    maxLength={CERT_DESCRIPTION_MAX}
                    placeholder="Shown under the student name. Leave blank for the default description."
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Max {CERT_DESCRIPTION_MAX} characters. Up to 3 lines.</span>
                    <span
                      className={
                        certificateDescription.length >= CERT_DESCRIPTION_MAX ? "text-red-400" : ""
                      }
                    >
                      {certificateDescription.length}/{CERT_DESCRIPTION_MAX}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Logo (optional)</label>
                  <label className="flex items-center justify-between gap-3 border border-dashed border-muted-foreground/40 p-3 rounded-[var(--radius-button)] cursor-pointer hover:border-muted-foreground/70 transition-colors">
                    <span className="text-sm text-muted-foreground">
                      {certificateLogoFile?.name || "Click to upload logo (PNG/JPG)"}
                    </span>
                    <span className="text-xs text-muted-foreground">Choose file</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => setCertificateLogoFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Signature Image (optional)</label>
                  <label className="flex items-center justify-between gap-3 border border-dashed border-muted-foreground/40 p-3 rounded-[var(--radius-button)] cursor-pointer hover:border-muted-foreground/70 transition-colors">
                    <span className="text-sm text-muted-foreground">
                      {certificateSignatureFile?.name || "Click to upload signature (PNG/JPG)"}
                    </span>
                    <span className="text-xs text-muted-foreground">Choose file</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => setCertificateSignatureFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Instructor Label (optional)</label>
                  <input
                    value={certificateInstructorLabel}
                    onChange={(e) => setCertificateInstructorLabel(e.target.value)}
                    className="bg-background p-3 rounded-[var(--radius-button)]"
                    placeholder="Default: AUTHORIZED INSTRUCTOR"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Instructor Name (optional)</label>
                  <input
                    value={certificateInstructorValue}
                    onChange={(e) => setCertificateInstructorValue(e.target.value)}
                    className="bg-background p-3 rounded-[var(--radius-button)]"
                    placeholder="Default: quiz creator name"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-[var(--radius-button)] bg-primary text-primary-foreground font-semibold disabled:opacity-60"
                    disabled={isSubmitting}
                    onClick={async () => {
                      const customizationData = new FormData()
                      if (certificateDescription) {
                        customizationData.set("certificateDescription", certificateDescription)
                      }
                      customizationData.set("certificateShowScore", certificateShowScore ? "1" : "0")
                      if (certificateInstructorLabel) {
                        customizationData.set("certificateInstructorLabel", certificateInstructorLabel)
                      }
                      if (certificateInstructorValue) {
                        customizationData.set("certificateInstructorValue", certificateInstructorValue)
                      }
                      if (certificateLogoFile) {
                        customizationData.set("certificateLogo", certificateLogoFile)
                      }
                      if (certificateSignatureFile) {
                        customizationData.set("certificateSignature", certificateSignatureFile)
                      }
                      const customizationResult = await saveQuizCertificateCustomizationAction(
                        quizId,
                        customizationData
                      )
                      if (!customizationResult.success) {
                        toast.error(customizationResult.error || "Failed to save certificate settings.")
                        return
                      }
                      toast.success("Certificate settings saved.")
                    }}
                  >
                    Save Certificate Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </fieldset>

        <fieldset disabled={isReadOnly || isSubmitting} className="space-y-6">
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
                      <option value="identification">Identification</option>
                    </select>
                    {questions.length >= 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          removeQuestion(question.id)
                        }}
                        className="bg-secondary py-1 px-2 rounded-(--radius-button) disabled:opacity-60 disabled:cursor-not-allowed"
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
                    isSubmitting={isSubmitting || isReadOnly}
                    onRemove={removeQuestion}
                    showRemove={false}
                    onQuestionTextChange={updateQuestionText}
                    onTimerChange={setQuestionTimer}
                    onCorrectAnswerChange={setCorrectAnswerTorF}
                    onQuestionImageChange={setQuestionImage}
                    onPointsChange={setQuestionPoints}
                  />
                ) : question.type === "identification" ? (
                  <CreateQuestionIdentification
                    userId={userId ?? ""}
                    question={question}
                    index={index}
                    isSubmitting={isSubmitting || isReadOnly}
                    onRemove={removeQuestion}
                    showRemove={false}
                    onQuestionTextChange={updateQuestionText}
                    onTimerChange={setQuestionTimer}
                    onQuestionImageChange={setQuestionImage}
                    onPointsChange={setQuestionPoints}
                    onIdentificationChange={updateIdentificationConfig}
                  />
                ) : (
                  <CreateQuestionMCQ
                    userId={userId ?? ""}
                    question={question}
                    index={index}
                    isSubmitting={isSubmitting || isReadOnly}
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
              className="w-full p-2 border border-gray-400 border-dashed cursor-pointer rounded-(--radius-button) disabled:opacity-60 disabled:cursor-not-allowed"
            >
              + Add Question
            </button>
          </div>
        </fieldset>

        <fieldset disabled={isReadOnly || isSubmitting}>
          <div className="card p-5 space-y-3">
            <h2 className="text-2xl font-semibold">Paid Quiz</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPaidQuiz}
                onChange={(e) => setIsPaidQuiz(e.target.checked)}
              />
              Paid Quiz (Require payment before taking quiz)
            </label>

            {isPaidQuiz && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>Quiz fee:</span>
                  <div className="flex items-center">
                    <span className="bg-background border border-border rounded-l-md px-2 py-2">₱</span>
                    <input
                      type="number"
                      min="100"
                      value={paidQuizFee}
                      onChange={(e) => setPaidQuizFee(e.target.value)}
                      className="bg-background p-2 rounded-r-md w-32 border border-border border-l-0"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">Minimum ₱100 (PayMongo)</span>
                </div>
              </div>
            )}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 p-3 font-semibold rounded-(--radius-button) disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
