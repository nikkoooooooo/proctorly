"use client"

import { answerAttemptAction } from "@/lib/attempt/actions/answerAttemptAction" // server action to save answers
import { calculateScoreAction } from "@/lib/attempt/actions/calculateScoreAction" // server action to finalize score
import { sendAttemptEvent } from "@/lib/attempt/client-events"

interface Option { // minimal option shape
  id: string // option id
  isCorrect: boolean // correctness flag
}

interface Question { // minimal question shape
  id: string // question id
}

interface UseAnswerFlowProps { // input shape for the hook
  attemptId: string // attempt id
  questions: Question[] // list of questions
  currentQuestionIndex: number // current question index
  selectedChoice: Option | null // current selected choice
  setCurrentQuestion: (updater: (prev: number) => number) => void // setter for question index
  answeredIds: string[] // ids already answered
  setAnsweredIds: (updater: (prev: string[]) => string[]) => void // setter for answered ids
  onFinish: (attemptId: string) => void // callback for finish action
}

export function useAnswerFlow({ // custom hook signature
  attemptId, // attempt id
  questions, // questions list
  currentQuestionIndex, // current index
  selectedChoice, // selected choice
  setCurrentQuestion, // setter for index
  answeredIds, // answered ids
  setAnsweredIds, // setter for answered ids
  onFinish, // finish callback
}: UseAnswerFlowProps) { // explicit props type
  const submitAnswer = async (questionId: string, choice?: Option) => { // submit answer helper
    if (!attemptId || !choice) return // skip if missing data
    await answerAttemptAction({ // save answer on server
      attemptId, // pass attempt id
      questionId, // pass question id
      optionId: choice.id, // pass option id
      isCorrect: choice.isCorrect, // pass correctness
    })
    void sendAttemptEvent(attemptId, "answered", {
      questionId,
      questionNo: currentQuestionIndex + 1,
    })
  }

  const autoFail = async (questionId: string) => { // auto-fail helper
    if (!attemptId) return // skip if no attempt
    await answerAttemptAction({ // save auto-fail answer
      attemptId, // pass attempt id
      questionId, // pass question id
      isAutoFail: true, // mark as auto-fail
    })
    void sendAttemptEvent(attemptId, "auto_fail", {
      questionId,
      questionNo: currentQuestionIndex + 1,
    })
  }

  const markAnswered = (questionId: string) => { // mark a question as answered locally
    setAnsweredIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId])) // avoid duplicates
  }

  const findNextUnansweredIndex = () => { // find next unanswered question index
    for (let i = currentQuestionIndex + 1; i < questions.length; i += 1) { // scan forward
      if (!answeredIds.includes(questions[i].id)) return i // return first unanswered
    }
    return -1 // no more unanswered questions
  }

  const finishQuiz = async () => { // finish helper
    if (!attemptId) return // skip if no attempt
    void sendAttemptEvent(attemptId, "submit")
    await calculateScoreAction(attemptId) // compute final score
    onFinish(attemptId) // trigger finish callback
  }

  const handleNext = async (autoFailFlag = false) => { // next/finish flow
    const q = questions[currentQuestionIndex] // get current question
    if (!q) return // safety check

    // Auto-fail when time runs out and no answer is selected
    if (autoFailFlag && !selectedChoice) {
      // If this is the last question, auto-fail and finish immediately
      if (currentQuestionIndex >= questions.length - 1) {
        await autoFail(q.id) // mark as auto-fail
        markAnswered(q.id) // mark answered locally
        await finishQuiz() // finish immediately on last question
        return
      }
      await autoFail(q.id) // mark as auto-fail
      markAnswered(q.id) // mark answered locally
    } else {
      await submitAnswer(q.id, selectedChoice ?? undefined) // save normal answer
      markAnswered(q.id) // mark answered locally
    }

    const nextIndex = findNextUnansweredIndex() // compute next unanswered index
    if (nextIndex !== -1) {
      setCurrentQuestion(() => nextIndex) // jump to next unanswered
      return
    }

    await finishQuiz() // finish quiz if nothing left
  }

  return { submitAnswer, autoFail, finishQuiz, handleNext } // expose helpers
}
