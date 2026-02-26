"use client"
import { useState, useEffect, useRef, useCallback } from "react" // React hooks for state/effects/refs/callbacks
import { useRouter } from "next/navigation" // Next router for redirects
import toast from "react-hot-toast" // toast notifications for user feedback
import confetti from "canvas-confetti" // finish animation

import QuizCardMCQ from "@/components/QuizCardMCQ" // presentational quiz card component
import { authClient } from "@/client/auth-client" // auth session client
import { getQuestionsByQuizIdAction } from "@/lib/quiz/actions/getQuestionsByQuizIdAction" // fetch quiz questions
import { createAttemptAction } from "@/lib/attempt/actions/createAttemptAction" // create quiz attempt
import { getQuizProctoringByIdAction } from "@/lib/quiz/actions/getQuizProctoringByIdAction" // fetch proctoring settings + title
import { getUserNameFromQuizAction } from "@/lib/user/actions/getUserName" // fetch instructor name
import { useAnswerFlow } from "@/hooks/useAnswerFlow" // answer submission + finish logic
import { useAttemptOrder } from "@/hooks/useAttemptOrder" // stable shuffled order loader
import { useProctoring } from "@/hooks/useProctoring" // tab switch + blur tracking
import { useQuestionTimer } from "@/hooks/useQuestionTimer" // per-question timer + persistence

interface Option { // answer option shape
  id: string // option id
  text: string // option label
  isCorrect: boolean // correctness flag for scoring
}

interface Question { // quiz question shape
  id: string // question id
  quizId: string // parent quiz id
  text: string // question text
  option: Option[] // available options
  timeLimit?: number // optional time limit in seconds
  imageUrl?: string | null

}

export default function QuizMainPageClient({
  quizId,
  hasActiveAttempt,
}: {
  quizId: string
  hasActiveAttempt: boolean
}) {
  const router = useRouter() // initialize router

  const { data } = authClient.useSession() // read active auth session
  const session = data?.session // extract session payload

  // -------------------- Core Quiz State --------------------
  const [questions, setQuestions] = useState<Question[]>([]) // currently active ordered questions
  const [quizTitle, setQuizTitle] = useState("") // quiz title for header
  const [instructorName, setInstructorName] = useState("") // instructor name for header
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0) // current question index
  const [selectedChoice, setSelectedChoice] = useState<Option | null>(null) // selected option for current question
  const [attemptId, setAttemptId] = useState("") // active attempt id
  const remainingTimeByIdRef = useRef<Record<string, number>>({}) // in-memory timer cache per question id
  const hasStartedRef = useRef(false) // prevent late fetch from overwriting ordered questions after start
  const [answeredIds, setAnsweredIds] = useState<string[]>([]) // answered question ids for skip logic
  const [isPreparingStart, setIsPreparingStart] = useState(false) // prevent double-click start race







  
  // -------------------- Hook Interfaces --------------------
  const { loadAttemptOrder } = useAttemptOrder() // get imperative order loader from hook

  const [proctoring, setProctoring] = useState<{ blurQuestion: boolean } | null>(null) // proctoring config
  const [modal, setModal] = useState(true) // pre-start modal visibility

  const { tabSwitches, blurScreen, setTabSwitches } = useProctoring(
    attemptId, // persist count against active attempt
    !modal && !!proctoring?.blurQuestion, // enable only when quiz started and blur monitoring enabled
  )

  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false) // disable next button while submitting
  const isSubmittingAnswerRef = useRef(false) // sync guard to avoid concurrent submit calls

  const { handleNext } = useAnswerFlow({
    attemptId, // attempt id used by answer action
    questions, // ordered questions list used by answer flow
    currentQuestionIndex: currentQuestion, // active index used by answer flow
    selectedChoice, // selected answer for submission
    setCurrentQuestion, // index state setter used by answer flow
    answeredIds, // already answered ids for next-unanswered navigation
    setAnsweredIds, // update answered ids after submissions
    onFinish: (id) => { // called when last question finishes
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } }) // show finish animation
      router.push(`/quiz/${quizId}/results/${id}`) // go to attempt result page
    },
  })

  const runHandleNext = useCallback(
    async (autoFailFlag = false) => {
      if (isSubmittingAnswerRef.current) return // ignore if a submit is already in progress
      isSubmittingAnswerRef.current = true // lock submit guard
      setIsSubmittingAnswer(true) // update UI disabled/loading state
      try {
        await handleNext(autoFailFlag) // submit current answer or auto-fail on timeout
      } catch (error) {
        console.error("Failed to submit answer:", error) // log technical error
        toast.error("Failed to submit answer. Please try again.") // show user-friendly error
      } finally {
        isSubmittingAnswerRef.current = false // unlock submit guard
        setIsSubmittingAnswer(false) // reset loading state
      }
    },
    [handleNext], // refresh callback only when hook handler changes
  )

  



  // -------------------- Timer Hook State --------------------
  const currentQuestionId = questions[currentQuestion]?.id || "" // current question id or empty when unavailable
  const savedTimeForCurrent = currentQuestionId ? remainingTimeByIdRef.current[currentQuestionId] : undefined // read cached time for this question
  const currentInitialTime = savedTimeForCurrent != null
    ? Number(savedTimeForCurrent) // prefer cached remaining time when available
    : Number(questions[currentQuestion]?.timeLimit || 0) // fallback to configured question time limit

  const { timeLeft } = useQuestionTimer({
    attemptId, // attempt id for periodic DB save
    questionId: currentQuestionId, // question id for timer row key
    initialTime: currentInitialTime, // initial value for current question timer
    enabled: !modal && !!attemptId && !!currentQuestionId, // only run timer during active quiz question
    onTimeUp: async () => {
      await runHandleNext(true) // auto-fail current question when timer reaches zero
    },
  })

  useEffect(() => {
    if (!currentQuestionId) return // skip until a valid question id exists
    remainingTimeByIdRef.current = {
      ...remainingTimeByIdRef.current, // preserve existing question timer cache
      [currentQuestionId]: timeLeft, // update current question remaining time
    }
  }, [currentQuestionId, timeLeft]) // update cache whenever active question time changes








  // -------------------- Fetch Quiz Setup Data --------------------
  useEffect(() => {
    const fetchData = async () => {
      const data = await getQuestionsByQuizIdAction(quizId) // fetch raw question set for this quiz
      if (!data.success) {
        toast.error(data.error || "Failed to fetch questions") // show fetch error
        return
      }

      if (!hasStartedRef.current) {
        setQuestions(data.questions || []) // only set raw questions before start flow orders them
      }

      const proctoringRes = await getQuizProctoringByIdAction(quizId) // fetch proctoring config and title
      setProctoring(
        proctoringRes.success && proctoringRes.quiz
          ? { blurQuestion: proctoringRes.quiz.blurQuestion } // use server blur setting
          : { blurQuestion: false }, // default to disabled if unavailable
      )

      if (proctoringRes.success && proctoringRes.quiz?.title) {
        setQuizTitle(proctoringRes.quiz.title) // display title in quiz header
      }
      if (proctoringRes.success && proctoringRes.quiz?.expiresAt) {
        setExpiresAt(String(proctoringRes.quiz.expiresAt))
      } else {
        setExpiresAt(null)
      }

      const instructorRes = await getUserNameFromQuizAction(quizId) // fetch owner/instructor display name
      if (instructorRes.success && instructorRes.username) {
        setInstructorName(instructorRes.username) // display instructor name
      }
    }

    void fetchData() // run async setup loader
  }, [quizId]) // re-run only when route quiz id changes

  useEffect(() => {
    if (!questions.length) return // no reset needed when questions are not loaded
    setSelectedChoice(null) // clear selection when moving between questions
  }, [currentQuestion, questions]) // reset selection on index/order changes



  // -------------------- Start Quiz --------------------
  const handleStart = async () => {
    if (!session || isPreparingStart) return // block start when no session or already preparing
    const isExpired = !!expiresAt && new Date(expiresAt).getTime() < Date.now()
    if (isExpired && !hasActiveAttempt) {
      toast.error("Quiz is expired and can no longer be started.")
      return
    }

    if (!questions.length) {
      toast.error("Questions are still loading. Please try again.") // guard against early click
      return
    }

    setIsPreparingStart(true) // lock start button until start flow completes

    try {
      const result = await createAttemptAction({ quizId, userId: session.userId }) // create attempt row
      if (!result.success || !result.data?.attempt) {
        toast.error(result.error || "Attempt creation failed") // report create attempt failure
        return
      }

      const attempt = result.data.attempt // extract attempt payload
      setAttemptId(attempt.id) // store attempt id for timer/proctoring/answers
      setTabSwitches(attempt.tabSwitchCount) // initialize tab switch count from attempt

      const orderData = await loadAttemptOrder(attempt.id, questions) // load stable order + resume metadata
      if (!orderData.success) {
        toast.error(orderData.error || "Could not prepare shuffled question order") // report order failure
        return
      }

      const orderedQuestions = orderData.orderedQuestions // ordered question list for this attempt
      setQuestions(orderedQuestions) // replace raw questions with attempt-stable order
      remainingTimeByIdRef.current = orderData.remainingTimeById // seed timer cache from server resume state
      setAnsweredIds(orderData.answeredIds) // seed answered ids for resume

      const answeredSet = new Set(orderData.answeredIds) // fast answered lookup set
      const next = orderedQuestions.findIndex((q) => !answeredSet.has(q.id)) // find first unanswered question index
      setCurrentQuestion(next === -1 ? 0 : next) // set first unanswered or fallback index 0

      hasStartedRef.current = true // prevent late raw fetch from overriding ordered questions
      setModal(false) // close pre-start modal
      toast.success("Quiz started!") // notify successful start
    } catch (error) {
      console.error("Failed to start quiz:", error) // log unexpected start errors
      toast.error("Failed to start quiz. Please try again.") // show generic start failure
    } finally {
      setIsPreparingStart(false) // always unlock start button
    }
  }

  // -------------------- UI --------------------
  const isExpired = !!expiresAt && new Date(expiresAt).getTime() < Date.now()
  return (
    <div className="relative min-h-screen flex flex-col items-center p-4"> {/* page container */}
      {!!expiresAt && (
        <div className="mb-4 w-full max-w-xl text-center text-sm text-muted-foreground">
          Quiz expires at {new Date(expiresAt).toLocaleString()}
        </div>
      )}
      {blurScreen && ( // show warning overlay when user leaves tab (if enabled)
        <div className="absolute inset-0 bg-destructive/50 backdrop-blur-sm z-50 flex items-center justify-center"> {/* blocking overlay */}
          <p className="text-primary-foreground text-xl font-semibold">You left the quiz 😡</p> {/* warning text */}
        </div>
      )}

      {modal ? ( // pre-start modal view
        <div className="mt-20 text-center"> {/* modal wrapper spacing */}
          <div className="card mx-auto w-full max-w-xl p-6 space-y-4 text-left"> {/* modal card */}
            <h2 className="text-2xl font-semibold text-foreground">Before you start</h2> {/* modal title */}
            <ul className="space-y-2 text-muted-foreground"> {/* rule list */}
              <li>• This quiz is monitored. Tab switches are counted.</li> {/* rule */}
              <li>• Questions cannot be skipped unless time runs out.</li> {/* rule */}
              <li>• If time runs out, the question is marked incorrect.</li> {/* rule */}
              <li>• Retakes are controlled by your instructor.</li> {/* rule */}
            </ul>
            <div className="pt-2"> {/* button spacing */}
              <button
                onClick={handleStart} // start quiz flow
                disabled={isPreparingStart || !questions.length || (isExpired && !hasActiveAttempt)} // disable while preparing, loading, or expired
                className="bg-primary cursor-pointer hover:bg-primary/90 active:bg-primary/80 px-4 py-2 rounded-[var(--radius-button)] text-primary-foreground font-semibold" // button style
              >
                {isPreparingStart ? "Preparing..." : isExpired && !hasActiveAttempt ? "Quiz Expired" : "Start Quiz"} {/* button text by loading state */}
              </button>
            </div>
          </div>
        </div>
      ) : ( // active quiz view
        <div className="max-w-4xl w-full mt-10 space-y-6"> {/* quiz content wrapper */}
          <div className="card p-4"> {/* quiz metadata card */}
            <p className="text-sm text-muted-foreground">Now taking</p> {/* metadata label */}
            <h3 className="text-xl font-semibold text-foreground">{quizTitle || "Quiz"}</h3> {/* quiz title */}
            <p className="text-sm text-muted-foreground"> {/* instructor text */}
              Instructor: {instructorName || "Unknown"}
            </p>
          </div>

          <QuizCardMCQ
            question={questions[currentQuestion]?.text} // current question text
            choices={questions[currentQuestion]?.option} // current question options
            onSelect={setSelectedChoice} // option select handler
            time={timeLeft} // live timer value
            tabSwitch={tabSwitches} // tab switch count for display
            imageUrl={questions[currentQuestion]?.imageUrl ?? undefined} // question image if present
          />

          <button
            disabled={!selectedChoice || isSubmittingAnswer} // block next until an option is selected and not submitting
            onClick={() => void runHandleNext()} // submit current and move next
            className={`mt-4 p-2 rounded-[var(--radius-button)] font-semibold w-full ${
              currentQuestion === questions.length - 1
                ? "bg-green-600 text-primary-foreground hover:bg-green-700 active:bg-green-300" // finish style on last question
                : "bg-primary text-primary-foreground hover:bg-primary/90  active:bg-primary/80" // next style otherwise
            } ${!selectedChoice || isSubmittingAnswer ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`} // disabled vs enabled cursor/opacity
          >
            {isSubmittingAnswer
              ? "Submitting..." // loading text while answer request in flight
              : currentQuestion === questions.length - 1
                ? "Finish Quiz" // final button text
                : "Next Question"} {/* regular button text */}
          </button>
        </div>
      )}
    </div>
  )
}
