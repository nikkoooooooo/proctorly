"use client" // means this pages will run in the client 

import { useState, useEffect } from "react" // importing the useState and useEffect 
import { useRouter } from "next/navigation" // importing the useRouter
import toast from "react-hot-toast" // importing the toast for notifying current state
import confetti from "canvas-confetti" // importing for confetti

import QuizCard from "@/components/QuizCard" // importing quizCard so that we could pass value into it
import TimerCard from "@/components/TimerCard" // importing timerCard so that we could amke its value dynamic
import TabSwitchesCard from "@/components/TabSwitchesCard" // import this so that we could amke it value dynamic also for tab Count


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
    setTimeLeft(q?.timeLimit ? Number(q.timeLimit) : 0) // SETTING THE TIME LIMIT PER CHANGE OF QUESTION

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
      await handleNext()   // safe: runs AFTER render
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

    const progress = await getAttemptProgressAction(attempt.id)
    if (progress.success && progress.answers?.length) {
      const answered = progress.answers.map(a => a.questionId)
      const next = questions.findIndex(q => !answered.includes(q.id))
      setCurrentQuestion(next === -1 ? 0 : next)
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
  const handleNext = async () => {
    await submitAnswer()

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
        <div className="absolute inset-0 bg-[#FF000080] backdrop-blur-sm z-50 flex items-center justify-center">
          <p className="text-white text-xl font-semibold">You left the quiz 😡</p>
        </div>
      )}

      {modal ? (
        <div className="mt-20 text-center">
          <p>This quiz is monitored — tab switches are counted.</p>
          <button onClick={handleStart} className="mt-4 bg-primary hover:bg-blue-400 active:bg-blue-300 p-2 rounded">
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
            onClick={handleNext}
            className={`mt-4 p-2 rounded-md font-semibold w-full cursor-pointer ${
              currentQuestion === questions.length - 1
                ? "bg-green-600 text-white hover:bg-green-700 active:bg-green-300"
                : "bg-primary text-white hover:bg-primary/90  active:bg-blue-300"
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