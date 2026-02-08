// FOR SUBMITTING ANSWERS AND FINISHING THE QUIZ
"use client" // this hook runs on the client

import { answerAttemptAction } from "@/lib/actions/answerAttemptAction" // server action to save answers
import { calculateScoreAction } from "@/lib/actions/calculateScoreAction" // server action to finalize score

interface Option { // minimal option shape
  id: string // option id
  isCorrect: boolean // correctness flag
}

interface Question { // minimal question shape
  id: string // question id
}

interface UseAnswerFlowProps { // input shape for the hook
  attemptId: string // attempt id
  quizId: string // quiz id
  questions: Question[] // list of questions
  onFinish: (attemptId: string) => void // callback for finish action
}

export function useAnswerFlow({ // custom hook signature
  attemptId, // attempt id
  quizId, // quiz id
  questions, // questions list
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
  }

  const autoFail = async (questionId: string) => { // auto-fail helper
    if (!attemptId) return // skip if no attempt
    await answerAttemptAction({ // save auto-fail answer
      attemptId, // pass attempt id
      questionId, // pass question id
      isAutoFail: true, // mark as auto-fail
    })
  }

  const finishQuiz = async () => { // finish helper
    if (!attemptId) return // skip if no attempt
    await calculateScoreAction(attemptId) // compute final score
    onFinish(attemptId) // trigger finish callback
  }

  return { submitAnswer, autoFail, finishQuiz } // expose helpers
}
