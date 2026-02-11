"use client" // means this pages will run in the client 

import { useState, useEffect, useRef, useCallback } from "react" // importing the useState and useEffect 
import { useRouter } from "next/navigation" // importing the useRouter
import toast from "react-hot-toast" // importing the toast for notifying current state
import confetti from "canvas-confetti" // importing for confetti

import QuizCard from "@/components/QuizCard" // importing quizCard so that we could pass value into it

import { authClient } from "@/client/auth-client"
// importing this server action to get the question on the QUIZ we are about to take
import { getQuestionsByQuizIdAction } from "@/lib/quiz/actions/getQuestionsByQuizIdAction"
// server action for getSession so that we could check if there is a session
// import { getSession } from "@/lib/auth-actions"
// server action for creating attempt
import { createAttemptAction } from "@/lib/attempt/actions/createAttemptAction"
// server action for passing the asnwer attempt immediately after sending
import { answerAttemptAction } from "@/lib/attempt/actions/answerAttemptAction"
// server action  for saving the tab count switch
import { saveTabSwitchCountAction } from "@/lib/attempt/actions/saveTabSwitchCountAction"
// a server action for caulcating the answer attempt by students
import { calculateScoreAction } from "@/lib/attempt/actions/calculateScoreAction"
// server action for getting the progress for previous attempt that maybe been stopped
import { getAttemptProgressAction } from "@/lib/attempt/actions/getAttemptProgressAction"
// a server action for getting quiz proctored feature if they enable
import { getQuizProctoringByIdAction } from "@/lib/quiz/actions/getQuizProctoringByIdAction"
// server action to load instructor name
import { getUserNameFromQuizAction } from "@/lib/user/actions/getUserName"
// server action to get or create a stable per-attempt question order
import { getOrCreateAttemptQuestionOrderAction } from "@/lib/attempt/actions/getOrCreateAttemptQuestionOrderAction"
// server action to persist remaining time per question
import { updateAttemptQuestionTimeAction } from "@/lib/attempt/actions/updateAttemptQuestionTimeAction"
// custom hook for answer flow (submit/auto-fail/finish)
import { useAnswerFlow } from "@/hooks/useAnswerFlow"

// data type for option of questions
interface Option {
  id: string
  text: string
  isCorrect: boolean
}

// data type of Questions
interface Question {
  id: string
  quizId: string
  text: string
  option: Option[]
  timeLimit?: number
}

export default function QuizMainPageClient({ quizId }: { quizId: string }) {
  const router = useRouter()


  const { data } = authClient.useSession()
  const user = data?.user
  const session = data?.session

  // -------------------- CORE QUIZ STATE --------------------
  // state for saving the questions
  const [questions, setQuestions] = useState<Question[]>([])
  // quiz metadata for display
  const [quizTitle, setQuizTitle] = useState("")
  const [instructorName, setInstructorName] = useState("")
  // state for saving the current questions
  const [currentQuestion, setCurrentQuestion] = useState(0)
  // state for saving the current selected choice
  const [selectedChoice, setSelectedChoice] = useState<Option | null>(null)
  // state for setting the current attemptId
  const [attemptId, setAttemptId] = useState("")
  // remaining time map for each question (used for resume)
  const remainingTimeByIdRef = useRef<Record<string, number>>({})
  // prevent late async fetch from overwriting question state after quiz starts
  const hasStartedRef = useRef(false)
  // answered question ids for skipping already completed questions
  const [answeredIds, setAnsweredIds] = useState<string[]>([])
  // avoid duplicate starts while preparing attempt/order
  const [isPreparingStart, setIsPreparingStart] = useState(false)

  // -------------------- PROCTORING STATE --------------------
  // set state for tab switches count
  const [tabSwitches, setTabSwitches] = useState(0)
  // set state for blurScreen if its true then show the blurry effect and text
  const [blurScreen, setBlurScreen] = useState(false)
  // checking if the proctored feature is true to enable it
  const [proctoring, setProctoring] = useState<{ blurQuestion: boolean } | null>(null)

  // -------------------- TIMER STATE --------------------

  // state for timer to be dynamic in every question
  const [timeLeft, setTimeLeft] = useState(0)
  // keep the latest timeLeft without re-triggering save intervals
  const timeLeftRef = useRef(0)

  // 🚨 IMPORTANT FIX STATE
  // This flag tells React: "timer finished, go next AFTER render"
  const [timeUp, setTimeUp] = useState(false)


  // show before taking the quiz
  const [modal, setModal] = useState(true)
  // prevent rapid multi-click submits on next/finish
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
  const isSubmittingAnswerRef = useRef(false)





  
  // use the custom answer flow hook instead of inline handlers
  const { handleNext } = useAnswerFlow({
    attemptId,
    quizId,
    questions,
    currentQuestionIndex: currentQuestion,
    selectedChoice,
    setCurrentQuestion,
    answeredIds,
    setAnsweredIds,
    onFinish: (id) => {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } })
      router.push(`/quiz/${quizId}/results/${id}`)
    },
  })

  const runHandleNext = useCallback(
    async (autoFailFlag = false) => {
      if (isSubmittingAnswerRef.current) return
      isSubmittingAnswerRef.current = true
      setIsSubmittingAnswer(true)
      try {
        await handleNext(autoFailFlag)
      } catch (error) {
        console.error("Failed to submit answer:", error)
        toast.error("Failed to submit answer. Please try again.")
      } finally {
        isSubmittingAnswerRef.current = false
        setIsSubmittingAnswer(false)
      }
    },
    [handleNext],
  )





  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 1️⃣ FETCH QUESTIONS + PROCTORING SETTINGS
  useEffect(() => {
    // fetch questions using server actions
    const fetchData = async () => {
      // saving those in the "data" variable
      const data = await getQuestionsByQuizIdAction(quizId)
      // if there is no data then show toast notify error
      if (!data.success) {
        toast.error(data.error || "Failed to fetch questions")
        return
      }
      // we set the current questions in state
      if (!hasStartedRef.current) {
        setQuestions(data.questions || [])
      }
      //  getting the proctoring value if its true or not
      const proctoringRes = await getQuizProctoringByIdAction(quizId)
      // then setting it in states to update if there will be a proctoring feature
      setProctoring(
        proctoringRes.success && proctoringRes.quiz
          ? {
              blurQuestion: proctoringRes.quiz.blurQuestion,
            }
          : { blurQuestion: false }
      )
      // use the proctoring query (already loaded) to set the quiz title
      if (proctoringRes.success && proctoringRes.quiz?.title) {
        setQuizTitle(proctoringRes.quiz.title)
      }
      // fetch instructor name for header display
      const instructorRes = await getUserNameFromQuizAction(quizId)
      if (instructorRes.success && instructorRes.username) {
        setInstructorName(instructorRes.username)
      }
    }
    fetchData()
  }, [quizId])
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX





  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 2️⃣ RESET TIMER WHEN QUESTION CHANGES
  useEffect(() => {
    if (!questions.length) return // WONT ACTUALLY HAPPEN, BUT THIS IS JUST SAFETY CHECK IF THERE IS NO QUESTIONS THEN DO NOTHING

    const q = questions[currentQuestion] // FOR INITIAL CURRENTQUESTION VALUE IS ZERO SO IT WILL BE THE FIRST QUESTION

    // set time limit per question
    // Use saved remaining time if available; otherwise fall back to the question limit
    const saved = remainingTimeByIdRef.current[q?.id]


    
    const nextTime = saved != null ? Number(saved) : (q?.timeLimit ? Number(q.timeLimit) : 0)
    setTimeLeft(nextTime) // SETTING THE TIME LIMIT PER CHANGE OF QUESTION
    timeLeftRef.current = nextTime // keep ref in sync on reset

    // clear selected option for new question
    setSelectedChoice(null) // RESET THE SELECTED CHOICE EVERY NEW QUESTIONS
  }, [currentQuestion, questions]) // DEPENDENCY, ONLY RUN THIS EFFECT WHEN ITS EITHER THE TWO UPDATE
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 3️⃣ TIMER COUNTDOWN (PURE — NO SIDE EFFECTS)
  useEffect(() => {
    if (modal || timeLeft <= 0) return // IF ONE OF THIS IS TRUW THEN DO NOTHING

    const timer = setInterval(() => { // CREATE A TIMER TO MAKE THE TIMER PER QUESTIONS VALUE DYNAMIC
      setTimeLeft(prev => { // UPDATE THE TIME LIMIT EVERY SECOND
        if (prev <= 1) { // ONCE THE CURRENT VALUE IS == OR < TO 1 THEN WE WILL STOP THE TIMER OR RESET THE VALUE TO COUNTDOWN
          clearInterval(timer) // CLEAR THE TIMER

          // ✅ ONLY SET STATE — NO ROUTER / SERVER ACTIONS
          setTimeUp(true) // A FLAG USESTATE TO KNOW THAT THE TIMER ALREADY DONE

          return 0 // THEN RETURN 0
        }
        const next = prev - 1 // SUBSTRACT 1 EVERY SECOND TO THE TIME LIMIT VALUE TO MAKE IT A COUNTDOWN
        // keep ref in sync so save interval can read latest value
        timeLeftRef.current = next
        return next
      })
    }, 1000)

    return () => clearInterval(timer) // CLEAN THE OLD TIMER, SO THAT IT WONT STILL CONTINUING
  }, [timeLeft, modal])
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX







  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 3️⃣.5️⃣ HANDLE AUTO NEXT WHEN TIMER EXPIRES (SAFE SIDE EFFECT)
  useEffect(() => { // A USESTATE THAT WILL HANDLE IF THE TIMER TIMES UP THEN WE WILL AUTO NEXT QUESTION
    if (!timeUp) return

    const run = async () => {
      // Auto-fail if the user did not answer before time ran out
      await runHandleNext(true)   // safe: runs AFTER render
      setTimeUp(false)     // reset for next question
    }

    run()
  }, [timeUp, runHandleNext])
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 4️⃣ TAB SWITCH / BLUR DETECTION (PURE EFFECT)
  useEffect(() => {
    if (modal || !proctoring?.blurQuestion) return

    let counted = false

    const handleLeave = () => {
      if (counted) return
      counted = true

      setTabSwitches(prev => prev + 1)

      setBlurScreen(true)
      setTimeout(() => setBlurScreen(false), 3000)
    }

    const handleReturn = () => {
      counted = false
    }

    const handleVisibility = () => {
      document.hidden ? handleLeave() : handleReturn()
    }

    window.addEventListener("blur", handleLeave)
    window.addEventListener("focus", handleReturn)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("blur", handleLeave)
      window.removeEventListener("focus", handleReturn)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [modal, proctoring?.blurQuestion])
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX





  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 5️⃣ SYNC TAB SWITCH COUNT TO SERVER (SAFE)
  useEffect(() => {
    if (!attemptId) return
    void saveTabSwitchCountAction(attemptId, tabSwitches)
  }, [tabSwitches, attemptId])
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 5️⃣.5️⃣ SAVE REMAINING TIME EVERY 5 SECONDS (SAFE)
  useEffect(() => {
    if (modal) return
    if (!attemptId) return
    if (!questions.length) return

    const q = questions[currentQuestion]
    if (!q?.id) return

    const interval = setInterval(() => {
      const latest = timeLeftRef.current
      // Persist remaining time so resume can pick up where it left off
      void updateAttemptQuestionTimeAction({
        attemptId,
        questionId: q.id,
        remainingTime: latest,
      })
      // Keep local cache updated as the timer changes
      // Keep local cache updated as the timer changes
      remainingTimeByIdRef.current = {
        ...remainingTimeByIdRef.current,
        [q.id]: latest,
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [attemptId, currentQuestion, questions, modal])
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX






  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 6️⃣ START QUIZ
  const handleStart = async () => {
    if (!session || isPreparingStart) return
    if (!questions.length) {
      toast.error("Questions are still loading. Please try again.")
      return
    }
    setIsPreparingStart(true)
    try {
      const result = await createAttemptAction({ quizId, userId: session.userId })
      if (!result.success || !result.data?.attempt) {
        toast.error(result.error || "Attempt creation failed")
        return
      }

      const attempt = result.data.attempt
      setAttemptId(attempt.id)
      setTabSwitches(attempt.tabSwitchCount)

      // Use a stable shuffled order for this attempt (so resume stays consistent)
      let orderedQuestions = questions
      const orderRes = await getOrCreateAttemptQuestionOrderAction(attempt.id)
      if (!orderRes.success || !orderRes.order?.length) {
        toast.error(orderRes.error || "Could not prepare shuffled question order")
        return
      }

      const map = new Map(questions.map((q) => [q.id, q]))
      const ordered = orderRes.order.map((id) => map.get(id)).filter(Boolean) as Question[]
      if (!ordered.length || ordered.length !== orderRes.order.length) {
        toast.error("Question order is invalid. Please try starting again.")
        return
      }
      orderedQuestions = ordered
      setQuestions(orderedQuestions)

      // Store remaining time map so timer resumes correctly
      if (orderRes.remainingTimeById) {
        remainingTimeByIdRef.current = orderRes.remainingTimeById
      }
      // Store answered IDs so we can skip them during navigation
      if (orderRes.answeredIds) {
        setAnsweredIds(orderRes.answeredIds)
      }

      // If we already know answered IDs, move to the first unanswered question
      if (orderRes.answeredIds?.length) {
        const answeredSet = new Set(orderRes.answeredIds)
        // Find the next unanswered question in the stable order
        const next = orderedQuestions.findIndex((q) => !answeredSet.has(q.id))
        setCurrentQuestion(next === -1 ? 0 : next)
      } else {
        // Fallback to old progress lookup if we do not have answered IDs
        const progress = await getAttemptProgressAction(attempt.id)
        if (progress.success && progress.answers?.length) {
          const answered = progress.answers.map(a => a.questionId)
          // Find the next unanswered question in the stable order
          const next = orderedQuestions.findIndex(q => !answered.includes(q.id))
          setCurrentQuestion(next === -1 ? 0 : next)
        }
      }

      hasStartedRef.current = true
      setModal(false)
      toast.success("Quiz started!")
    } catch (error) {
      console.error("Failed to start quiz:", error)
      toast.error("Failed to start quiz. Please try again.")
    } finally {
      setIsPreparingStart(false)
    }
  }
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



  // -------------------- UI --------------------
  return (
    <div className="relative min-h-screen flex flex-col items-center p-4">
      {blurScreen && (
        <div className="absolute inset-0 bg-destructive/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <p className="text-primary-foreground text-xl font-semibold">You left the quiz 😡</p>
        </div>
      )}

      {modal ? (
        <div className="mt-20 text-center">
          {/* Pre-quiz modal content (clear rules + authority note) */}
          <div className="card mx-auto w-full max-w-xl p-6 space-y-4 text-left">
            <h2 className="text-2xl font-semibold text-foreground">Before you start</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• This quiz is monitored. Tab switches are counted.</li>
              <li>• Questions cannot be skipped unless time runs out.</li>
              <li>• If time runs out, the question is marked incorrect.</li>
              <li>• Retakes are controlled by your instructor.</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={handleStart}
                disabled={isPreparingStart || !questions.length}
                className="bg-primary hover:bg-primary/90 active:bg-primary/80 px-4 py-2 rounded-[var(--radius-button)] text-primary-foreground font-semibold"
              >
                {isPreparingStart ? "Preparing..." : "Start Quiz"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl w-full mt-10 space-y-6">
          {/* Quiz context header */}
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Now taking</p>
            <h3 className="text-xl font-semibold text-foreground">{quizTitle || "Quiz"}</h3>
            <p className="text-sm text-muted-foreground">
              Instructor: {instructorName || "Unknown"}
            </p>
          </div>
         

          <QuizCard
            question={questions[currentQuestion]?.text}
            choices={questions[currentQuestion]?.option}
            onSelect={setSelectedChoice}
            time={timeLeft}
            tabSwitch={tabSwitches}
          />

          <button
            // Disable next until an answer is selected
            disabled={!selectedChoice || isSubmittingAnswer}
            onClick={() => runHandleNext()}
            className={`mt-4 p-2 rounded-[var(--radius-button)] font-semibold w-full ${
              currentQuestion === questions.length - 1
                ? "bg-green-600 text-primary-foreground hover:bg-green-700 active:bg-green-300"
                : "bg-primary text-primary-foreground hover:bg-primary/90  active:bg-primary/80"
            } ${!selectedChoice || isSubmittingAnswer ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isSubmittingAnswer
              ? "Submitting..."
              : currentQuestion === questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
          </button>
        </div>
      )}
    </div>
  )
}






// TODO: REMOVE THE ANSWER WHEN IT ALREADY ANSWERED 
// TODO: SEND NEWLY UPDATED TIMER EVERY 5 SECS
// TODO: A QUESTION CAN STILL BE ASNWERED AS LONG THERE IS STILL AN TIME FOR ITS
// TODO: RETAKE FOR STUDENTS
// TODO: LET THE STUDENTS VEIW THEIR ANSWER HISTORY BUT IF THE TEACHER ENABLE IT
