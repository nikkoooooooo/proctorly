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

  // Quiz and attempt state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<Option | null>(null)
  const [attemptId, setAttemptId] = useState<string>("")

  // Proctoring state
  const [tabSwitches, setTabSwitches] = useState(0)
  const [blurScreen, setBlurScreen] = useState(false)
  const [proctoring, setProctoring] = useState<{ blurQuestion: boolean; tabMonitoring: boolean } | null>(null)

  // Timer and modal
  const [timeLeft, setTimeLeft] = useState(0)
  const [modal, setModal] = useState(true)
  const [progressLoaded, setProgressLoaded] = useState(false)

  // -----------------------------
  // 1️⃣ FETCH QUESTIONS + PROCTORING SETTINGS
  // -----------------------------
  useEffect(() => {
    const fetchData = async () => {
      const data = await getQuestionsByQuizIdAction(quizId)
      if (!data.success) {
        toast.error(data.error || "Failed to fetch questions", {
          icon: "⚠️",
          style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" },
        })
        return
      }
      setQuestions(data.questions || [])

      // Fetch proctoring flags
      const proctoringRes = await getQuizProctoringByIdAction(quizId)
      if (proctoringRes.success && proctoringRes.quiz) {
        setProctoring({
          blurQuestion: proctoringRes.quiz.blurQuestion,
          tabMonitoring: proctoringRes.quiz.tabMonitoring,
        })
      } else {
        setProctoring({ blurQuestion: false, tabMonitoring: false })
      }
    }
    fetchData()
  }, [quizId])

  // -----------------------------
  // 2️⃣ SET TIMER WHEN QUESTION CHANGES
  // -----------------------------
  useEffect(() => {
    if (questions.length === 0) return
    const q = questions[currentQuestion]
    setTimeLeft(q.timeLimit ? Number(q.timeLimit) : 0)
    setSelectedChoice(null)
  }, [currentQuestion, questions])

  // -----------------------------
  // 3️⃣ TIMER COUNTDOWN
  // -----------------------------
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

  // -----------------------------
  // 4️⃣ TAB SWITCH / BLUR DETECTION
  // -----------------------------
 useEffect(() => {
  if (modal || !proctoring?.blurQuestion) return

  let leaveCounted = false // flag to prevent double count

  const handleLeave = () => {
    if (leaveCounted) return
    leaveCounted = true
    setTabSwitches(prev => prev + 1)
    setBlurScreen(true)
    setTimeout(() => setBlurScreen(false), 3000)
  }

  const handleReturn = () => {
    leaveCounted = false // reset flag when user comes back
  }

  const handleVisibility = () => {
    if (document.hidden) handleLeave()
    else handleReturn()
  }

  window.addEventListener("blur", handleLeave)
  window.addEventListener("focus", handleReturn) // reset when window comes back
  document.addEventListener("visibilitychange", handleVisibility)

  return () => {
    window.removeEventListener("blur", handleLeave)
    window.removeEventListener("focus", handleReturn)
    document.removeEventListener("visibilitychange", handleVisibility)
  }
}, [modal, proctoring?.blurQuestion])



  // -----------------------------
  // 5️⃣ START QUIZ
  // -----------------------------
  const handleStart = async () => {
    const session = await getSession()
    if (!session) return

    try {
      const result = await createAttemptAction({ quizId, userId: session.userId })
      if (!result.success || !result.data?.attempt) {
        toast.error(result.error || "Attempt creation failed", { icon: "⚠️", style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" } })
        return
      }

      const attemptData = result.data.attempt
      setAttemptId(attemptData.id)

      const progressResult = await getAttemptProgressAction(attemptData.id)
      if (progressResult.success && progressResult.answers?.length) {
        const answeredIds = progressResult.answers.map(p => p.questionId)
        const nextIndex = questions.findIndex(q => !answeredIds.includes(q.id))
        setCurrentQuestion(nextIndex === -1 ? 0 : nextIndex)
      }

      setModal(false)
      setProgressLoaded(true)

      toast.success("Quiz started!", { icon: "✅", style: { background: "#ffffff", color: "#2563eb", fontWeight: "bold" }, duration: 3000 })
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err), { icon: "⚠️", style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" }, duration: 5000 })
    }
  }

  // -----------------------------
  // 6️⃣ SUBMIT ANSWER
  // -----------------------------
  const submitAnswer = async () => {
    if (!selectedChoice || !attemptId) return
    const q = questions[currentQuestion]

    try {
      const response = await answerAttemptAction({ attemptId, questionId: q.id, optionId: selectedChoice.id, isCorrect: selectedChoice.isCorrect })
      if (!response.success) {
        toast.error(response.error || "Failed to save answer", { icon: "⚠️", style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" } })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err), { icon: "⚠️", style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" } })
    }
  }

  // -----------------------------
  // 7️⃣ NEXT QUESTION / FINISH
  // -----------------------------
  const handleNext = async () => {
    await submitAnswer()

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      try {
        const scoreRes = await calculateScoreAction(attemptId)
        if (!scoreRes.success) {
          toast.error(scoreRes.error || "Failed to calculate score", { icon: "⚠️", style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" } })
        } else {
          toast.success("Quiz finished!", { icon: "✅", style: { background: "#ffffff", color: "#2563eb", fontWeight: "bold" }, duration: 3000 })
          confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } })
        }

        const tabRes = await saveTabSwitchCountAction(attemptId, tabSwitches)
        if (!tabRes.success) {
          toast.error(tabRes.error || "Failed to save tab switches", { icon: "⚠️", style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" } })
        }

        router.push(`/quiz/${quizId}/results/${attemptId}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err), { icon: "⚠️", style: { background: "#ffffff", color: "#b91c1c", fontWeight: "bold" } })
      }
    }
  }

  // -----------------------------
  // 8️⃣ SELECT CHOICE
  // -----------------------------
  const handleSelect = (choice: Option) => setSelectedChoice(choice)

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center p-4">
      {blurScreen && (
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-center items-center">
          <p className="text-white font-semibold text-xl">You left the tab!</p>
        </div>
      )}

      {modal && (
        <div className="w-full flex justify-center items-center mt-20">
          <div className="card w-96 p-4 max-w-sm text-center">
            <p className="text-muted">This quiz is monitored — tab switches are counted.</p>
            <button onClick={handleStart} className="mt-4 bg-primary p-2 rounded-md font-semibold cursor-pointer">Start Quiz</button>
          </div>
        </div>
      )}

      {!modal && questions.length > 0 && (
        <div className="flex flex-col gap-6 w-full max-w-4xl mt-10">
          <div className="flex justify-center gap-10">
            <TimerCard time={timeLeft} />
            <TabSwitchesCard count={tabSwitches} />
          </div>

          <QuizCard question={questions[currentQuestion].text} choices={questions[currentQuestion].option} onSelect={handleSelect} />

          <button
            onClick={handleNext}
            className={`mt-4 p-2 rounded-md font-semibold cursor-pointer ${
              currentQuestion === questions.length - 1 ? "bg-green-600 text-white hover:bg-green-700" : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
          </button>
        </div>
      )}

      {!modal && questions.length === 0 && <p>No questions found for this quiz.</p>}
    </div>
  )
}
