
"use server";

import { deleteQuiz } from "../helpers/deleteQuiz";

export async function deleteQuizAction(quizId: string) {
  try {
    await deleteQuiz(quizId);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return {
      success: false,
      error: "Could not delete quiz. Please try again in a few seconds.",
    };
  }
}
