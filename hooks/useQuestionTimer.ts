"use client"

// FOR SAVING AND RESUMING THE QUESTION TIMER
"use client" // this hook runs on the client

import { useEffect, useRef, useState } from "react" // React utilities
import { updateAttemptQuestionTimeAction } from "@/lib/attempt/actions/updateAttemptQuestionTimeAction" // server action to persist time

interface UseQuestionTimerProps { // input shape for the hook
  attemptId: string // attempt id for persistence
  questionId: string // current question id
  initialTime: number // starting time for the question
  enabled: boolean // whether timer should run
  onTimeUp?: () => void | Promise<void> // callback when timer reaches 0
}

export function useQuestionTimer({ // custom hook signature
  attemptId, // attempt id
  questionId, // question id
  initialTime, // initial time value
  enabled, // enable flag
  onTimeUp, // timeout callback
}: UseQuestionTimerProps) { // explicit props type
  const [timeLeft, setTimeLeft] = useState(initialTime) // visible timer state
  const timeRef = useRef(initialTime) // ref for latest time without re-renders
  const lastResetQuestionIdRef = useRef<string>("") // track last question reset

  useEffect(() => { // reset timer only when question changes
    if (!questionId) return // avoid resetting before question is ready
    if (lastResetQuestionIdRef.current === questionId) return // do not reset same question repeatedly
    // Reset timer when moving to a different question
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(initialTime) // update state
    timeRef.current = initialTime // update ref
    lastResetQuestionIdRef.current = questionId // record reset boundary
  }, [questionId, initialTime]) // include initialTime while guarding by question id

  useEffect(() => { // countdown effect
    if (!enabled || timeLeft <= 0) return // stop if disabled or no time

    const timer = setInterval(() => { // tick every second
      setTimeLeft((prev) => { // update time
        if (prev <= 1) { // stop and trigger callback on timeout
          clearInterval(timer) // clear timer when reaching 0
          timeRef.current = 0 // keep ref in sync at 0
          void onTimeUp?.() // fire optional timeout callback
          return 0 // lock at zero
        }
        // Keep ref in sync without re-rendering
        const next = prev - 1 // calculate next value
        timeRef.current = next // sync ref with latest value
        return next // decrement time
      })
    }, 1000) // 1 second interval

    return () => clearInterval(timer) // cleanup interval
  }, [enabled, timeLeft, onTimeUp]) // re-run on enable/time/callback change

  useEffect(() => { // persistence effect
    if (!enabled || !attemptId || !questionId) return // skip if missing data

    const interval = setInterval(() => { // save every 5 seconds
      // Persist remaining time so resume stays accurate
      void updateAttemptQuestionTimeAction({ // fire-and-forget update
        attemptId, // pass attempt id
        questionId, // pass question id
        remainingTime: timeRef.current, // pass latest remaining time
      })
    }, 5000) // 5 second interval

    return () => clearInterval(interval) // cleanup interval
  }, [attemptId, questionId, enabled]) // re-run on id/enable changes

  return { timeLeft, setTimeLeft } // expose timer state + setter
}
