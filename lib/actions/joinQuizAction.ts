
"use server";

import { joinQuiz } from "../helpers/joinQuiz";
import { revalidatePath } from "next/cache";

export async function joinQuizAction(quizId: string, userId: string) {
  try {
    const result = await joinQuiz(quizId, userId);

    if (result.alreadyJoined) {
      return {
        success: false,
        error: "You have already joined this quiz.",
      };
    } else {
      revalidatePath("/dashboard");

      return {
        success: true,
        message: "Joined quiz successfully",
        data: result.enrollment,
      };
    }

  } catch (error) {
    console.error("Failed to join quiz:", error);
    return {
      success: false,
      error: "Could not join quiz. Please try again later.",
    };
  }
}
