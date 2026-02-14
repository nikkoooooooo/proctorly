
"use server";

import { getQuizByJoinCode } from "../helpers/getQuizThroughCode";

export default async function getQuizThroughCodeAction(code: string) {
  try {
    const codeQuizResult = await getQuizByJoinCode(code);

    if (!codeQuizResult) {
      return { success: false, error: "Quiz not found for this code" };
    }

    return { success: true, quiz: codeQuizResult };
  } catch (error) {
    console.error("Failed to fetch quiz through code:", error);
    return {
      success: false,
      error: "Could not fetch quiz. Please try again in a few seconds.",
    };
  }
}
