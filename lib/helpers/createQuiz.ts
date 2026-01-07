
"use server"
// lib/helpers/quiz.ts
import { db } from "@/lib/db";               // Drizzle client
import { quiz, question, option } from "@/lib/schema"; // your tables
import { v4 as uuid } from "uuid";          // generate unique IDs

/**
 * Creates a quiz with questions and options
 * Server-only code
 */
// Generate a random 6-character alphanumeric code
function generateJoinCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}


export async function createQuiz(
  creatorId: string,
  title: string,
  questionsData: {
    text: string;
    type: "mcq" | "true-false" | "identification";
    options?: { text: string; isCorrect: boolean }[];
  }[],
  description: string,

) {
  // 1️⃣ Generate a unique ID for the quiz
  // this will create quiz id manually using the uuid
  const quizId = uuid();
  const joinCode = generateJoinCode()

  // 2️⃣ Insert the quiz into the quiz table
  // we now trying to insert quiz in the db
  await db.insert(quiz).values({
    id: quizId,
    title,
    description,
    creatorId,
    joinCode

  });

  // 3️⃣ Loop through each question
  // 
  for (const q of questionsData) {
    const questionId = uuid(); // 4️⃣ Unique ID for the question

    // 5️⃣ Insert the question linked to the quiz
    await db.insert(question).values({
      id: questionId,
      quizId,
      text: q.text,
      type: q.type,
    });

    // 6️⃣ Insert options if they exist
    if (q.options && q.options.length > 0) {
      for (const opt of q.options) {
        const optionId = uuid(); // 7️⃣ Unique ID for the option

        await db.insert(option).values({
          id: optionId,
          questionId,
          text: opt.text,
          isCorrect: opt.isCorrect,
        });
      }
    }
  }

  // 8️⃣ Return the quiz ID
  return { quizId, joinCode };
}
