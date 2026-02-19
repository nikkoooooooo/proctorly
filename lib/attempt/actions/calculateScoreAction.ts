"use server"

import { db } from "@/lib/db"
import { attempt } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { calculateScoreHelper } from "@/lib/attempt/helpers/calculateScoreHelper"

export async function calculateScoreAction(attemptId: string) {
  try {
    const result = await calculateScoreHelper(attemptId)
    if (!result.success) return result

    const { earnedPoints, totalPoints, totalCorrect, totalQuestions } = result

    // 6️⃣ Mark attempt as completed
    await db
      .update(attempt)
      .set({
        score: earnedPoints,
        isCompleted: true,
        submittedAt: new Date(),
      })
      .where(eq(attempt.id, attemptId))
      .execute()

    return {
      success: true,
      totalCorrect,
      totalQuestions,
      score: earnedPoints,
      totalPoints,
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

