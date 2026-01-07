"use client"
import { useState, useEffect } from "react"
import QuizCard from "@/components/QuizCard"
import { getQuestionsByQuizIdAction } from "@/lib/actions/getQuestionsByQuizIdAction"

interface Option {
  id: string
  text: string
  isCorrect: boolean | false
}

interface Questions {
  id: string
  quizId: string
  text: string
  option: Option[]
}

export default function QuizMainPageClient({ quizId }: { quizId: string }) {
  const [questions, setQuestions] = useState<Questions[]>([])
  const [modal, setModal] = useState(true)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes example
  const [tabSwitches, setTabSwitches] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      const data = await getQuestionsByQuizIdAction(quizId)
      setQuestions(data)
    }
    fetchQuestions()
  }, [quizId])

  // Timer
  useEffect(() => {
    if (modal) return // don't start until modal is closed
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [modal])

  // Tab switch detection
  useEffect(() => {
    if (modal) return
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [modal])

  // Move to next question
  const nextQuestion = () => {
    setCurrentQuestion(prev => Math.min(prev + 1, questions.length - 1))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4">
      {/* Modal */}
      {modal && (
        <div className="w-full flex justify-center items-center mt-20">
          <div className="card w-96 p-4 max-w-sm text-center">
            <p className="text-muted">
              This quiz is being monitored.<br />
              Every tab change you make is counted.
            </p>
            <button 
              onClick={() => setModal(false)}
              className="mt-4 bg-primary p-2 rounded-md font-semibold cursor-pointer"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz content */}
      {!modal && questions.length > 0 && (
        <div className="flex flex-col gap-6 w-full max-w-4xl mt-10">
          {/* Timer and Tab */}
          <div className="flex justify-center gap-10">
            <div className="w-32 p-4 flex flex-col items-center gap-2 bg-secondary rounded-md">
              <span className="text-4xl">⏱️</span>
              <span className="text-2xl font-semibold">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
              <p className="text-muted">Time Left</p>
            </div>

            <div className="w-32 p-4 flex flex-col items-center gap-2 bg-secondary rounded-md">
              <span className="text-4xl">🔄</span>
              <span className="text-2xl font-semibold">{tabSwitches}</span>
              <p className="text-muted">Tab Switches</p>
            </div>
          </div>

          {/* Current Question */}
          <QuizCard
            question={questions[currentQuestion].text}
            choices={questions[currentQuestion].option}
          />

          {/* Next Question */}
          {currentQuestion < questions.length - 1 && (
            <button
              onClick={nextQuestion}
              className="mt-4 bg-primary p-2 rounded-md font-semibold cursor-pointer"
            >
              Next Question
            </button>
          )}
        </div>
      )}

      {!modal && questions.length === 0 && (
        <p>No questions found for this quiz.</p>
      )}
    </div>
  )
}
