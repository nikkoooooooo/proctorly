// "use server"

// import { db } from "@/lib/db"
// import { attempt, attemptAnswer } from "@/lib/schema"
// import { eq } from "drizzle-orm"

// export async function calculateScoreAction(attemptId: string) {
//   try {
//     // Get all answers
//     const answers = await db
//       .select()
//       .from(attemptAnswer)
//       .where(eq(attemptAnswer.attemptId, attemptId))
//       .execute()

//     if (!answers || answers.length === 0) {
//       return { success: false, error: "No answers found for this attempt." }
//     }



//     // TASK HERE

//     // CURRENT PROBLEM, IF YOU ASNWER ONLY ONE QUESTION AND YOU DID NOT ANSWER THE OTHER, 
//     // IT BEING BE AUTO COMPLETED THE QUIZ, AND IT SHOULD NOT BE, 
//     // THE FIX IS TO CHECK FIRST IF THE TOTAL QUESTION IS ALL AHVE ASNWER 

//     const totalCorrect = answers.filter(a => a.isCorrect).length
//     const totalQuestions = answers.length
//     const score = totalCorrect

    
    
    
//     // Update attempt
//     await db
//       .update(attempt)
//       .set({
//         score,
//         isCompleted: true,
//         submittedAt: new Date(),
//       })
//       .where(eq(attempt.id, attemptId))
//       .execute()

//     return { success: true, totalCorrect, totalQuestions, score }
//   } catch (error) {
//     console.error("Failed to calculate score:", error)
//     return { success: false, error: (error as Error).message }
//   }
// }



"use server"

import { db } from "@/lib/db"
import { attempt, attemptAnswer, question } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function calculateScoreAction(attemptId: string) {
  try {
    // 1️⃣ Get attempt (to know quizId)
    const [currentAttempt] = await db
      .select()
      .from(attempt)
      .where(eq(attempt.id, attemptId))
      .execute()

    if (!currentAttempt) {
      return { success: false, error: "Attempt not found." }
    }

    // 2️⃣ Get total questions in quiz
    const totalQuestions = await db
      .select()
      .from(question)
      .where(eq(question.quizId, currentAttempt.quizId))
      .execute()

    // 3️⃣ Get submitted answers
    const answers = await db
      .select()
      .from(attemptAnswer)
      .where(eq(attemptAnswer.attemptId, attemptId))
      .execute()

    // 4️⃣ 🚫 Block completion if not all questions are answered
    if (answers.length < totalQuestions.length) {
      return {
        success: false,
        error: "Quiz is not fully answered yet.",
      }
    }

    // 5️⃣ Calculate score
    const totalCorrect = answers.filter(a => a.isCorrect).length
    const score = totalCorrect

    // 6️⃣ Mark attempt as completed
    await db
      .update(attempt)
      .set({
        score,
        isCompleted: true,
        submittedAt: new Date(),
      })
      .where(eq(attempt.id, attemptId))
      .execute()

    return {
      success: true,
      totalCorrect,
      totalQuestions: totalQuestions.length,
      score,
    }
  } catch (error) {
    console.error("Failed to calculate score:", error)
    return { success: false, error: (error as Error).message }
  }
}


// CURRENT PROBLEM IT CAN RETAKE THE QUESTIONS MULTIPLE TIMES, 



// WHEN WE GIVE A NULL ASNWER IN Q6 AND WE ANSWER Q7, WHEN WE RESTORE WUESTIONS AGAIN
// THE Q7 WILL REAPPEAR AGAIN WHICH IT SHOULD NOT, I NEED TO MAKE A
// SERVER ACTION FOR REMOVING IT AFTER ANSWERED, PLUS THE SERVER ACTION MAKE THE 
// COUNT DOUBLED THINKING IT ALREADY AASNWERED ALL QUESTIONS NOT KNOWING 
// THEY ASNWERED SOME QUESTIONS MULTIPLE TIMES, WHICH IT SHOULD NOT


