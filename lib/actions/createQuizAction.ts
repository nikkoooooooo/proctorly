"use server";

import { createQuiz, QuestionInput } from "@/lib/helpers/createQuiz";

export async function createQuizAction(
  title: string,
  questions: QuestionInput[],
  creatorId: string,
  description: string,
  blurQuestion = false,
  disableCopyPaste = false,
  tabMonitoring = false
) {
  try {
    const quiz = await createQuiz(
      creatorId,
      title,
      questions,
      description,
      blurQuestion,
      disableCopyPaste,
      tabMonitoring
    );

    return { success: true, quiz };
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return {
      success: false,
      error: "Could not create quiz, please try again in a few seconds",
    };
  }
}
