"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import confetti from "canvas-confetti"

import QuizCard from "@/components/QuizCard"
import TimerCard from "@/components/TimerCard"
import TabSwitchesCard from "@/components/TabSwitchesCard"

import { getQuestionsByQuizIdAction } from "@/lib/actions/getQuestionsByQuizIdAction"
import { getSession } from "@/lib/auth-actions"
import { createAttemptAction } from "@/lib/actions/createAttemptAction"
import { answerAttemptAction } from "@/lib/actions/answerAttemptAction"
import { saveTabSwitchCountAction } from "@/lib/actions/saveTabSwitchCountAction"
import { calculateScoreAction } from "@/lib/actions/calculateScoreAction"
import { getAttemptProgressAction } from "@/lib/actions/getAttemptProgressAction"
import { getQuizProctoringByIdAction } from "@/lib/actions/getQuizProctoringByIdAction"

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  quizId: string
  text: string
  option: Option[]
  timeLimit?: number
}

export default function QuizMainPageClient({ quizId }: { quizId: string }) {
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<Option | null>(null)
  const [attemptId, setAttemptId] = useState("")

  const [tabSwitches, setTabSwitches] = useState(0)
  const [blurScreen, setBlurScreen] = useState(false)
  const [proctoring, setProctoring] = useState<{ blurQuestion: boolean; tabMonitoring: boolean } | null>(null)

  const [timeLeft, setTimeLeft] = useState(0)
  const [modal, setModal] = useState(true)

  // 1️⃣ FETCH QUESTIONS + PROCTORING
  useEffect(() => {
    const fetchData = async () => {
      const data = await getQuestionsByQuizIdAction(quizId)
      if (!data.success) {
        toast.error(data.error || "Failed to fetch questions")
        return
      }
      setQuestions(data.questions || [])

      const proctoringRes = await getQuizProctoringByIdAction(quizId)
      setProctoring(
        proctoringRes.success && proctoringRes.quiz
          ? {
              blurQuestion: proctoringRes.quiz.blurQuestion,
              tabMonitoring: proctoringRes.quiz.tabMonitoring,
            }
          : { blurQuestion: false, tabMonitoring: false }
      )
    }
    fetchData()
  }, [quizId])

  // 2️⃣ SET TIMER PER QUESTION
  useEffect(() => {
    if (!questions.length) return
    const q = questions[currentQuestion]
    setTimeLeft(q?.timeLimit ? Number(q.timeLimit) : 0)
    setSelectedChoice(null)
  }, [currentQuestion, questions])

  // 3️⃣ TIMER COUNTDOWN
  useEffect(() => {
    if (modal || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleNext()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, modal])

  // 4️⃣ TAB SWITCH / BLUR DETECTION (PURE)
  useEffect(() => {
    if (modal || !proctoring?.blurQuestion) return

    let counted = false

    const handleLeave = () => {
      if (counted) return
      counted = true

      setTabSwitches(prev => prev + 1)

      setBlurScreen(true)
      setTimeout(() => setBlurScreen(false), 3000)
    }

    const handleReturn = () => {
      counted = false
    }

    const handleVisibility = () => {
      document.hidden ? handleLeave() : handleReturn()
    }

    window.addEventListener("blur", handleLeave)
    window.addEventListener("focus", handleReturn)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("blur", handleLeave)
      window.removeEventListener("focus", handleReturn)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [modal, proctoring?.blurQuestion])

  // ✅ 5️⃣ SYNC TAB SWITCH COUNT TO SERVER (SAFE)
  useEffect(() => {
    if (!attemptId) return
    void saveTabSwitchCountAction(attemptId, tabSwitches)
  }, [tabSwitches, attemptId])

  // 6️⃣ START QUIZ
  const handleStart = async () => {
    const session = await getSession()
    if (!session) return

    const result = await createAttemptAction({ quizId, userId: session.userId })
    if (!result.success || !result.data?.attempt) {
      toast.error(result.error || "Attempt creation failed")
      return
    }

    const attempt = result.data.attempt
    setAttemptId(attempt.id)
    setTabSwitches(attempt.tabSwitchCount)

    const progress = await getAttemptProgressAction(attempt.id)
    if (progress.success && progress.answers?.length) {
      const answered = progress.answers.map(a => a.questionId)
      const next = questions.findIndex(q => !answered.includes(q.id))
      setCurrentQuestion(next === -1 ? 0 : next)
    }

    setModal(false)
    toast.success("Quiz started!")
  }

  // 7️⃣ SUBMIT ANSWER
  const submitAnswer = async () => {
    if (!selectedChoice || !attemptId) return
    const q = questions[currentQuestion]
    await answerAttemptAction({
      attemptId,
      questionId: q.id,
      optionId: selectedChoice.id,
      isCorrect: selectedChoice.isCorrect,
    })
  }

  // 8️⃣ NEXT / FINISH
  const handleNext = async () => {
    await submitAnswer()

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(p => p + 1)
    } else {
      await calculateScoreAction(attemptId)
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } })
      router.push(`/quiz/${quizId}/results/${attemptId}`)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4">
      {blurScreen && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <p className="text-white text-xl font-semibold">You left the quiz 😡</p>
        </div>
      )}

      {modal ? (
        <div className="mt-20 text-center">
          <p>This quiz is monitored — tab switches are counted.</p>
          <button onClick={handleStart} className="mt-4 bg-primary p-2 rounded">
            Start Quiz
          </button>
        </div>
      ) : (
        <div className="max-w-4xl w-full mt-10 space-y-6">
          <div className="flex justify-center gap-10">
            <TimerCard time={timeLeft} />
            <TabSwitchesCard count={tabSwitches} />
          </div>

          <QuizCard
            question={questions[currentQuestion]?.text}
            choices={questions[currentQuestion]?.option}
            onSelect={setSelectedChoice}
          />

          <button
            onClick={handleNext}
            className={`mt-4 p-2 rounded-md font-semibold w-full cursor-pointer ${
              currentQuestion === questions.length - 1
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
          </button>

        </div>
      )}
    </div>
  )
}
