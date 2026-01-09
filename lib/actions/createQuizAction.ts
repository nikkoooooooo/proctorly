// app/actions/createQuizAction.ts
"use server"; // this code runs only on server

import { createQuiz, QuestionInput } from "@/lib/helpers/createQuiz";

/**
 * Server action callable from client component
 */
export async function createQuizAction(
  title: string,
  questions: QuestionInput[], // use the proper type
  creatorId: string,
  description: string,
  blurQuestion = false,
  disableCopyPaste = false,
  tabMonitoring = false
) {
  // Call helper to insert quiz + questions + options + proctoring
  const quiz = await createQuiz(
    creatorId,
    title,
    questions,
    description,
    blurQuestion,
    disableCopyPaste,
    tabMonitoring
  )

  // Return the full quiz object for client use
  return quiz
}
