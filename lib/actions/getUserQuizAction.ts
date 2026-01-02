"use server"

import { getUserQuiz } from "../helpers/getUserQuiz"

export async function getUserQuizAction(creatorId: string) {
    const result = await getUserQuiz(creatorId)

    return result;
}