// FOR GETTING A STABLE QUESTION ORDER PER ATTEMPT
"use client" // this hook runs on the client

import { useEffect, useState } from "react" // React state + effects
import { getOrCreateAttemptQuestionOrderAction } from "@/lib/actions/getOrCreateAttemptQuestionOrderAction" // server action for stable order

interface Question { // minimal question shape needed here
  id: string // question id
  timeLimit?: number // optional timer limit
}

interface UseAttemptOrderResult { // return type for the hook
  orderedQuestions: Question[] // questions in stable order
  answeredIds: string[] // ids already answered
  remainingTimeById: Record<string, number> // saved remaining time per question
}

export function useAttemptOrder( // custom hook signature
  attemptId: string, // attempt to load order for
  questions: Question[], // raw questions from server
): UseAttemptOrderResult { // explicit return type
  const [orderedQuestions, setOrderedQuestions] = useState<Question[]>(questions) // ordered list state
  const [answeredIds, setAnsweredIds] = useState<string[]>([]) // answered ids state
  const [remainingTimeById, setRemainingTimeById] = useState<Record<string, number>>({}) // time map state

  useEffect(() => { // run when attempt or questions change
    if (!attemptId || questions.length === 0) return // skip if missing data

    const run = async () => { // async wrapper for server call
      // Get or create a stable per-attempt order
      const res = await getOrCreateAttemptQuestionOrderAction(attemptId) // fetch stable order
      if (!res.success || !res.order?.length) return // exit if no order

      const map = new Map(questions.map((q) => [q.id, q])) // map for id -> question
      const ordered = res.order.map((id) => map.get(id)).filter(Boolean) as Question[] // build ordered list

      // Save the stable order for rendering
      setOrderedQuestions(ordered) // update ordered questions
      // Save answered IDs to skip completed questions
      setAnsweredIds(res.answeredIds ?? []) // update answered ids
      // Save remaining time map for accurate timer resume
      setRemainingTimeById(res.remainingTimeById ?? {}) // update time map
    }

    void run() // start async work
  }, [attemptId, questions]) // dependencies for effect

  return { orderedQuestions, answeredIds, remainingTimeById } // return hook data
}
