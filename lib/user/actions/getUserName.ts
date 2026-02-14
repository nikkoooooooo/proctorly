
"use server";

import { getUserById, getUserNameFromQuiz } from "../helpers/getUser";

export async function getUserBySessionIdAction(sessionId: string) {
  try {
    const data = await getUserById(sessionId);

    if (!data) {
      return { success: false, error: "User not found for this session" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to get username from session:", error);
    return { success: false, error: "Could not fetch username. Try again later." };
  }
}

export async function getUserNameFromQuizAction(quizId: string) {
  try {
    const username = await getUserNameFromQuiz(quizId);

    if (!username) {
      return { success: false, error: "User not found for this quiz" };
    }

    return { success: true, username };
  } catch (error) {
    console.error("Failed to get username from quiz:", error);
    return { success: false, error: "Could not fetch username. Try again later." };
  }
}
