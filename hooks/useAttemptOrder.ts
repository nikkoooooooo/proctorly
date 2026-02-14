"use client"

import { useCallback, useState } from "react" // React state + callbacks
import { getOrCreateAttemptQuestionOrderAction } from "@/lib/attempt/actions/getOrCreateAttemptQuestionOrderAction" // server action for stable order

interface QuestionBase { // minimal question shape needed here
  id: string // question id
  timeLimit?: number // optional timer limit
}

interface LoadAttemptOrderResult<TQuestion> { // return type for load function
  success: boolean // whether load succeeded
  orderedQuestions: TQuestion[] // questions in stable order
  answeredIds: string[] // ids already answered
  remainingTimeById: Record<string, number> // saved remaining time per question
  error?: string // optional error message
}

export function useAttemptOrder() { // custom hook signature
  const [orderedQuestions, setOrderedQuestions] = useState<QuestionBase[]>([]) // ordered list state
  const [answeredIds, setAnsweredIds] = useState<string[]>([]) // answered ids state
  const [remainingTimeById, setRemainingTimeById] = useState<Record<string, number>>({}) // time map state

  const loadAttemptOrder = useCallback(async <TQuestion extends QuestionBase>(
    attemptId: string, // attempt to load order for
    questions: TQuestion[], // raw questions from server
  ): Promise<LoadAttemptOrderResult<TQuestion>> => {
    if (!attemptId || questions.length === 0) { // skip if missing data
      return { success: false, orderedQuestions: [], answeredIds: [], remainingTimeById: {}, error: "Missing attempt or questions" }
    }

    // Get or create a stable per-attempt order
    const res = await getOrCreateAttemptQuestionOrderAction(attemptId) // fetch stable order
    if (!res.success || !res.order?.length) { // stop if no valid order
      return { success: false, orderedQuestions: [], answeredIds: [], remainingTimeById: {}, error: res.error || "Could not prepare question order" }
    }

    const map = new Map(questions.map((q) => [q.id, q])) // map for id -> question
    const ordered = res.order.map((id) => map.get(id)).filter(Boolean) as TQuestion[] // build ordered list
    if (!ordered.length || ordered.length !== res.order.length) { // validate full mapping
      return { success: false, orderedQuestions: [], answeredIds: [], remainingTimeById: {}, error: "Question order is invalid" }
    }

    // Save the stable order for rendering
    setOrderedQuestions(ordered) // update ordered questions
    // Save answered IDs to skip completed questions
    setAnsweredIds(res.answeredIds ?? []) // update answered ids
    // Save remaining time map for accurate timer resume
    setRemainingTimeById(res.remainingTimeById ?? {}) // update time map

    const result = {
      success: true,
      orderedQuestions: ordered,
      answeredIds: res.answeredIds ?? [],
      remainingTimeById: res.remainingTimeById ?? {},
    }
    return result
  }, [])

  return { orderedQuestions, answeredIds, remainingTimeById, loadAttemptOrder } // return hook data + loader
}
