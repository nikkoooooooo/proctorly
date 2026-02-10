"use server";

import { getQuestionsByQuizId } from "../helpers/getQuestionsByQuizId";

export async function getQuestionsByQuizIdAction(quizId: string) {
  try {
    const result = await getQuestionsByQuizId(quizId);
    return { success: true, questions: result };
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return {
      success: false,
      error: "Could not load questions. Please try again in a few seconds.",
    };
  }
}
