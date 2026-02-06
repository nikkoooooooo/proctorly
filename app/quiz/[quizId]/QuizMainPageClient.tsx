"use client" // means this pages will run in the client 

import { useState, useEffect, useRef } from "react" // importing the useState and useEffect 
import { useRouter } from "next/navigation" // importing the useRouter
import toast from "react-hot-toast" // importing the toast for notifying current state
import confetti from "canvas-confetti" // importing for confetti

import QuizCard from "@/components/QuizCard" // importing quizCard so that we could pass value into it

import { authClient } from "@/client/auth-client"
// importing this server action to get the question on the QUIZ we are about to take
import { getQuestionsByQuizIdAction } from "@/lib/actions/getQuestionsByQuizIdAction"
// server action for getSession so that we could check if there is a session
// import { getSession } from "@/lib/auth-actions"
// server action for creating attempt
import { createAttemptAction } from "@/lib/actions/createAttemptAction"
// server action for passing the asnwer attempt immediately after sending
import { answerAttemptAction } from "@/lib/actions/answerAttemptAction"
// server action  for saving the tab count switch
import { saveTabSwitchCountAction } from "@/lib/actions/saveTabSwitchCountAction"
// a server action for caulcating the answer attempt by students
import { calculateScoreAction } from "@/lib/actions/calculateScoreAction"
// server action for getting the progress for previous attempt that maybe been stopped
import { getAttemptProgressAction } from "@/lib/actions/getAttemptProgressAction"
// a server action for getting quiz proctored feature if they enable
import { getQuizProctoringByIdAction } from "@/lib/actions/getQuizProctoringByIdAction"
// server action to get or create a stable per-attempt question order
import { getOrCreateAttemptQuestionOrderAction } from "@/lib/actions/getOrCreateAttemptQuestionOrderAction"
// server action to persist remaining time per question
import { updateAttemptQuestionTimeAction } from "@/lib/actions/updateAttemptQuestionTimeAction"

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
  // state for saving the current questions
  const [currentQuestion, setCurrentQuestion] = useState(0)
  // state for saving the current selected choice
  const [selectedChoice, setSelectedChoice] = useState<Option | null>(null)
  // state for setting the current attemptId
  const [attemptId, setAttemptId] = useState("")
  // remaining time map for each question (used for resume)
  const [remainingTimeById, setRemainingTimeById] = useState<Record<string, number>>({})

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
      setQuestions(data.questions || [])
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
    const saved = remainingTimeById[q?.id]
    setTimeLeft(saved != null ? Number(saved) : (q?.timeLimit ? Number(q.timeLimit) : 0)) // SETTING THE TIME LIMIT PER CHANGE OF QUESTION

    // clear selected option for new question
    setSelectedChoice(null) // RESET THE SELECTED CHOICE EVERY NEW QUESTIONS
  }, [currentQuestion, questions, remainingTimeById]) // DEPENDENCY, ONLY RUN THIS EFFECT WHEN ITS EITHER THE TWO UPDATE
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 3️⃣ TIMER COUNTDOWN (PURE — NO SIDE EFFECTS)
  useEffect(() => {
    if (modal || timeLeft <= 0) return // IF ONE OF THIS IS TRUW THEN DO NOTHING

    const timer = setInterval(() => { // CREATE A TIMER TO MAKE THE TIMER PER QUESTIONS VALUE DYNAMIC
      setTimeLeft(prev => { // UPDATE THE TIME LIMIT EVERY SECOND
        // keep ref in sync so save interval can read latest value
        timeLeftRef.current = prev
        if (prev <= 1) { // ONCE THE CURRENT VALUE IS == OR < TO 1 THEN WE WILL STOP THE TIMER OR RESET THE VALUE TO COUNTDOWN
          clearInterval(timer) // CLEAR THE TIMER

          // ✅ ONLY SET STATE — NO ROUTER / SERVER ACTIONS
          setTimeUp(true) // A FLAG USESTATE TO KNOW THAT THE TIMER ALREADY DONE

          return 0 // THEN RETURN 0
        }
        return prev - 1 // SUBSTRACT 1 EVERY SECOND TO THE TIME LIMIT VALUE TO MAKE IT A COUNTDOWN
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
      await handleNext(true)   // safe: runs AFTER render
      setTimeUp(false)     // reset for next question
    }

    run()
  }, [timeUp])
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
      setRemainingTimeById((prev) => ({ ...prev, [q.id]: latest }))
    }, 5000)

    return () => clearInterval(interval)
  }, [attemptId, currentQuestion, questions, modal])
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX






  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 6️⃣ START QUIZ
  const handleStart = async () => {
    if (!session) return

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
    if (orderRes.success && orderRes.order?.length) {
      const map = new Map(questions.map((q) => [q.id, q]))
      const ordered = orderRes.order.map((id) => map.get(id)).filter(Boolean) as Question[]
      if (ordered.length) {
        orderedQuestions = ordered
        setQuestions(orderedQuestions)
      }
      // Store remaining time map so timer resumes correctly
      if (orderRes.remainingTimeById) {
        setRemainingTimeById(orderRes.remainingTimeById)
      }
    }

    // If we already know answered IDs, move to the first unanswered question
    if (orderRes.success && orderRes.answeredIds?.length) {
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

    setModal(false)
    toast.success("Quiz started!")
  }
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX





  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 7️⃣ SUBMIT ANSWER 
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
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // 8️⃣ NEXT / FINISH LOGIC
  const handleNext = async (autoFail = false) => {
    const q = questions[currentQuestion]

    // If time ran out and there is no answer, save an auto-fail
    if (autoFail && !selectedChoice && attemptId) {
      await answerAttemptAction({
        attemptId,
        questionId: q.id,
        isAutoFail: true,
      })
    } else {
      await submitAnswer()
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(p => p + 1)
    } else {
      await calculateScoreAction(attemptId)
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } })
      router.push(`/quiz/${quizId}/results/${attemptId}`)
    }
  }
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

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
          <p>This quiz is monitored — tab switches are counted.</p>
          <button onClick={handleStart} className="mt-4 bg-primary hover:bg-primary/90 active:bg-primary/80 p-2 rounded-[var(--radius-button)] text-primary-foreground">
            Start Quiz
          </button>
        </div>
      ) : (
        <div className="max-w-4xl w-full mt-10 space-y-6">
         

          <QuizCard
            question={questions[currentQuestion]?.text}
            choices={questions[currentQuestion]?.option}
            onSelect={setSelectedChoice}
            time={timeLeft}
            tabSwitch={tabSwitches}
          />

          <button
            // Wrap to avoid passing the click event into handleNext(autoFail)
            onClick={() => handleNext()}
            className={`mt-4 p-2 rounded-[var(--radius-button)] font-semibold w-full cursor-pointer ${
              currentQuestion === questions.length - 1
                ? "bg-green-600 text-primary-foreground hover:bg-green-700 active:bg-green-300"
                : "bg-primary text-primary-foreground hover:bg-primary/90  active:bg-primary/80"
            }`}
          >
            {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
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
