"use server";

import { getUserNameFromSession, getUserNameFromQuiz } from "../helpers/getUserName";

export async function getUserName(sessionId: string) {
  try {
    const username = await getUserNameFromSession(sessionId);

    if (!username) {
      return { success: false, error: "User not found for this session" };
    }

    return { success: true, username };
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
