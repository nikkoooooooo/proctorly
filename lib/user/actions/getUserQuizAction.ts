
"use server";

import { getUserQuiz } from "../helpers/getUserQuiz";

export async function getUserQuizAction(creatorId: string) {
  try {
    const result = await getUserQuiz(creatorId);

    if (!result || result.length === 0) {
      return { success: true, quizzes: [], message: "No quizzes found for this user" };
    }
    return { success: true, quizzes: result };
  } catch (error) {
    console.error("Failed to fetch user quizzes:", error);
    return {
      success: false,
      error: "Could not fetch quizzes. Please try again in a few seconds.",
    };
  }
}
