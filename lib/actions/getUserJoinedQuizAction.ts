"use server";

import { getUserJoinedQuiz } from "../helpers/getUserJoinedQuiz";

export async function getUserJoinedQuizAction(userId: string) {
  try {
    const result = await getUserJoinedQuiz(userId);

    if (!result || result.length === 0) {
      return { success: true, quizzes: [], message: "No joined quizzes found" };
    }

    return { success: true, quizzes: result };
  } catch (error) {
    console.error("Failed to fetch user joined quizzes:", error);
    return {
      success: false,
      error: "Could not fetch joined quizzes. Please try again in a few seconds.",
    };
  }
}
