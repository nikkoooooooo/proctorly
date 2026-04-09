"use client"

import { useState, useEffect } from "react"
import { v4 as uuid } from "uuid"
import { QuestionInput } from "@/lib/quiz/helpers/createQuiz"
import { createQuizAction } from "@/lib/quiz/actions/createQuizAction"
import { authClient } from "@/client/auth-client"
import Link from "next/link"
import toast from "react-hot-toast"
import { Copy } from "lucide-react"
import CreateQuestionMCQ from "@/components/create-quiz/CreateQuestionMCQ"
import CreateQuestionTorF from "@/components/create-quiz/CreateQuestionTorF"
import CreateQuestionIdentification, { type IdentificationConfig } from "@/components/create-quiz/CreateQuestionIdentification"
import { saveQuizCertificateCustomizationAction } from "@/lib/certificate/actions/saveQuizCertificateCustomizationAction"

// Question type options
type QuestionType = "mcq" | "true-false" | "identification"

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
  identification: IdentificationConfig
}

// Main Create Quiz Page
export default function CreateQuizPage() {
  const { data } = authClient.useSession()
  const user = data?.user
  const session = data?.session

  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion(), createEmptyQuestion(), createEmptyQuestion(), createEmptyQuestion(), createEmptyQuestion()])
  const [createdQuizCode, setCreatedQuizCode] = useState<string | null>(null)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [isCopyingCode, setIsCopyingCode] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null)

  // Proctoring settings
  const [blurQuestion, setBlurQuestion] = useState(false)
  const [isPaidQuiz, setIsPaidQuiz] = useState(false)
  const [paidQuizFee, setPaidQuizFee] = useState("")
  const [passingPercentage, setPassingPercentage] = useState("")
  const [retakeLimit, setRetakeLimit] = useState(0)
  const [certificateEnabled, setCertificateEnabled] = useState(false)
  const [certificateDescription, setCertificateDescription] = useState("")
  const [certificateInstructorLabel, setCertificateInstructorLabel] = useState("")
  const [certificateInstructorValue, setCertificateInstructorValue] = useState("")
  const [certificateShowScore, setCertificateShowScore] = useState(true)
  const [certificateLogoFile, setCertificateLogoFile] = useState<File | null>(null)
  const [certificateSignatureFile, setCertificateSignatureFile] = useState<File | null>(null)
  const [pendingCertificateSave, setPendingCertificateSave] = useState(false)
  const CERT_DESCRIPTION_MAX = 160


  useEffect(() => {
    if (!user) return
    setUserId(user.id ?? null)
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

  const updateIdentificationConfig = (questionId: string, value: IdentificationConfig) =>
    setQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, identification: value } : q)))

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
        if (q.type === "identification") {
          return {
            text: q.text,
            type: q.type,
            timerLimit: q.timerLimit,
            points: q.points ?? 1,
            imageUrl: q.imageUrl,
            correctAnswers: q.identification.correctAnswers,
            matchStrategy: q.identification.matchStrategy,
            caseSensitive: q.identification.caseSensitive,
            trimWhitespace: q.identification.trimWhitespace,
            normalize: q.identification.normalize,
            options: [],
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

      const result = await createQuizAction(
        title,
        normalizedQuestions,
        userId,
        description,
        blurQuestion,
        expiresAt ? new Date(expiresAt).toISOString() : null,
        retakeLimit,
        isPaidQuiz,
        isPaidQuiz ? Math.round(Number(paidQuizFee) * 100) : null,
        passingPercentage ? Number(passingPercentage) : null,
        certificateEnabled,
        certificateShowScore,
      )

      if (!result.success || !result.quiz) {
        toast.error(result.error || "Failed to create quiz")
        return
      }

      // Show a friendly success toast instead of browser alert
      toast.success("Quiz created successfully!")
      // Save join code for the on-page copy UI
      setCreatedQuizCode(result.quiz.joinCode)
      setCreatedQuizId(result.quiz.quizId)

      if (certificateEnabled && pendingCertificateSave) {
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
          result.quiz.quizId,
          customizationData
        )
        if (!customizationResult.success) {
          toast.error(customizationResult.error || "Failed to save certificate settings.")
        } else {
          toast.success("Certificate settings saved.")
          setPendingCertificateSave(false)
        }
      }
      setTitle("")
      setDescription("")
      setQuestions([createEmptyQuestion()])
      setBlurQuestion(false)
      setExpiresAt("")
      setIsPaidQuiz(false)
      setPaidQuizFee("")
      setPassingPercentage("")
      setRetakeLimit(0)
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
              className="bg-background p-3 rrounded-(--radius-button)"
              placeholder="Quiz title"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background p-3 rounded-(--radius-button)"
              rows={2}
              placeholder="Quiz description"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Passing percentage</label>
            <input
              type="number"
              min="1"
              max="100"
              value={passingPercentage}
              onChange={(e) => setPassingPercentage(e.target.value)}
              className="bg-background p-3 rounded-(--radius-button)"
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
              className="bg-background p-3 rounded-(--radius-button)"
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground">
              0 = no retake. 1 = allow one retake (2 total attempts).
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Expiry (creator local time)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-background p-3 rounded-(--radius-button) datetime-white"
            />
            <p className="text-sm text-muted-foreground">Leave blank for no expiry.</p>
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
                <span className="bg-primary/20 text-primary px-3 py-2 rounded-(--radius-button) font-semibold">
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
                  className="bg-secondary text-secondary-foreground px-3 py-2 rounded-(--radius-button)hover:bg-secondary/80 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Copy quiz code"
                  title="Copy quiz code"
                >
                  {isCopyingCode ? "Copying..." : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Certification */}
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
                  onClick={async () => {
                    if (!createdQuizId) {
                      setPendingCertificateSave(true)
                      toast.success("Certificate settings queued. Create the quiz to apply them.")
                      return
                    }
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
                      createdQuizId,
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
                {!createdQuizId && pendingCertificateSave && (
                  <span className="text-xs text-muted-foreground">
                    Will save after quiz creation.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

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
                    <option value="identification">Identification</option>
                  </select>
                  {questions.length >= 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeQuestion(question.id);
                        }}
                        disabled={isSubmittingQuiz}
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
                  isSubmitting={isSubmittingQuiz}
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
                  isSubmitting={isSubmittingQuiz}
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
            className="w-full p-2 border border-gray-400 border-dashed cursor-pointer rounded-(--radius-button) disabled:opacity-60 disabled:cursor-not-allowed"
          >
            + Add Question
          </button>
        </div>

        {/* Paid Quiz */}
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

        <button
          type="submit"
          disabled={isSubmittingQuiz}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 p-3 font-semibold rounded-(--radius-button) disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmittingQuiz ? "Creating..." : "Create Quiz"}
        </button>
      </form>
    </div>
  )
}
