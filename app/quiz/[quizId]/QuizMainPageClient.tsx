"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

  // Main states
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<Option | null>(null)
  const [attemptId, setAttemptId] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [modal, setModal] = useState(true)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [blurScreen, setBlurScreen] = useState(false)
  const [progressLoaded, setProgressLoaded] = useState(false)

  // 1️⃣ Fetch all questions
  useEffect(() => {
    const fetchQuestions = async () => {
      const data = await getQuestionsByQuizIdAction(quizId)
      setQuestions(data)
    }
    fetchQuestions()
  }, [quizId])

  // 2️⃣ Reset timer & selection when question changes
  useEffect(() => {
    if (!questions[currentQuestion]) return
    setTimeLeft(questions[currentQuestion].timeLimit || 30)
    setSelectedChoice(null)
  }, [currentQuestion, questions])

  // 3️⃣ Timer countdown
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

  // 4️⃣ Track tab switches / blur
  useEffect(() => {
    if (modal) return

    const handleLeave = () => {
      setTabSwitches(prev => prev + 1)
      setBlurScreen(true)
      setTimeout(() => setBlurScreen(false), 1000)
    }

    const handleVisibility = () => {
      if (document.hidden) handleLeave()
    }

    window.addEventListener("blur", handleLeave)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("blur", handleLeave)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [modal])

  // 5️⃣ Start Quiz - create attempt and restore progress
  const handleStart = async () => {
    const session = await getSession()
    if (!session) return
    if (questions.length === 0) return // Wait for questions

    try {
      // 5a️⃣ Create or fetch attempt
      const result = await createAttemptAction({
        quizId,
        userId: session.userId,
      })
      setAttemptId(result.attempt.id)

      // 5b️⃣ Get progress: which questions were already answered
      const progress = await getAttemptProgressAction(result.attempt.id)
      if (progress.length > 0) {
        const answeredIds = progress.map(p => p.questionId)
        const nextIndex = questions.findIndex(q => !answeredIds.includes(q.id))
        setCurrentQuestion(nextIndex === -1 ? questions.length - 1 : nextIndex)
      }

      setModal(false)
      setProgressLoaded(true)
    } catch (err: any) {
      console.error(err)
    }
  }

  // 6️⃣ Submit current answer
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

  // 7️⃣ Next / Finish
  const handleNext = async () => {
    await submitAnswer()

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Finish Quiz: calculate score & update tab switch count
      await calculateScoreAction(attemptId)
      await saveTabSwitchCountAction(attemptId, tabSwitches)

      // Redirect to dynamic result page
      router.push(`/quiz/${quizId}/results/${attemptId}`)
    }
  }

  // 8️⃣ Choice selection
  const handleSelect = (choice: Option) => {
    setSelectedChoice(choice)
  }

  // 9️⃣ Restore progress after questions loaded
  useEffect(() => {
    if (attemptId && questions.length > 0 && !progressLoaded) {
      handleStart()
    }
  }, [attemptId, questions, progressLoaded])

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
            <p className="text-muted">
              This quiz is being monitored.<br />
              Every tab change you make is counted.
            </p>
            <button
              onClick={handleStart}
              className="mt-4 bg-primary p-2 rounded-md font-semibold cursor-pointer"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {!modal && questions.length > 0 && (
        <div className="flex flex-col gap-6 w-full max-w-4xl mt-10">
          <div className="flex justify-center gap-10">
            <TimerCard time={timeLeft} />
            <TabSwitchesCard count={tabSwitches} />
          </div>

          <QuizCard
            question={questions[currentQuestion].text}
            choices={questions[currentQuestion].option}
            onSelect={handleSelect}
          />

          <button
            onClick={handleNext}
            className={`mt-4 p-2 rounded-md font-semibold cursor-pointer ${
              currentQuestion === questions.length - 1
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
          </button>
        </div>
      )}

      {!modal && questions.length === 0 && (
        <p>No questions found for this quiz.</p>
      )}
    </div>
  )
}
