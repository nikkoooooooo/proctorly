// app/actions/createQuizAction.ts
"use server"; // this code runs only on server

import { createQuiz } from "@/lib/helpers/createQuiz";

/**
 * Server action callable from client component
 */
export async function createQuizAction(
  title: string,
  questions: {
    text: string;
    type: "mcq" | "true-false" | "identification";
    options?: { text: string; isCorrect: boolean }[];
  }[], 
  creatorId: string
) {
  // Call helper to insert quiz + questions + options
  const quizId = await createQuiz(creatorId, title, questions);
  return quizId; // return ID for confirmation or redirect
}
