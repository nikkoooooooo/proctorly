// FOR SAVING AND RESUMING THE QUESTION TIMER
"use client" // this hook runs on the client

import { useEffect, useRef, useState } from "react" // React utilities
import { updateAttemptQuestionTimeAction } from "@/lib/actions/updateAttemptQuestionTimeAction" // server action to persist time

interface UseQuestionTimerProps { // input shape for the hook
  attemptId: string // attempt id for persistence
  questionId: string // current question id
  initialTime: number // starting time for the question
  enabled: boolean // whether timer should run
}

export function useQuestionTimer({ // custom hook signature
  attemptId, // attempt id
  questionId, // question id
  initialTime, // initial time value
  enabled, // enable flag
}: UseQuestionTimerProps) { // explicit props type
  const [timeLeft, setTimeLeft] = useState(initialTime) // visible timer state
  const timeRef = useRef(initialTime) // ref for latest time without re-renders

  useEffect(() => { // reset timer on question change
    // Reset timer when question changes
    setTimeLeft(initialTime) // update state
    timeRef.current = initialTime // update ref
  }, [initialTime]) // depends on initialTime

  useEffect(() => { // countdown effect
    if (!enabled || timeLeft <= 0) return // stop if disabled or no time

    const timer = setInterval(() => { // tick every second
      setTimeLeft((prev) => { // update time
        // Keep ref in sync without re-rendering
        timeRef.current = prev // sync ref
        return prev - 1 // decrement time
      })
    }, 1000) // 1 second interval

    return () => clearInterval(timer) // cleanup interval
  }, [enabled, timeLeft]) // re-run on enable/time change

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
