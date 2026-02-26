
"use server";

import { createQuiz, QuestionInput } from "@/lib/quiz/helpers/createQuiz";

export async function createQuizAction(
  title: string,
  questions: QuestionInput[],
  creatorId: string,
  description: string,
  blurQuestion = false,
  expiresAt?: string | null
) {
  try {
    const quiz = await createQuiz(
      creatorId,
      title,
      questions,
      description,
      blurQuestion,
      expiresAt
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
