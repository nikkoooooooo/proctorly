'use server'
import { createAttempt } from "../helpers/createAttempt"




export async function createAttemptAction({ quizId, userId }: {quizId: string;
  userId: string;}) {
    return createAttempt({quizId, userId})
}