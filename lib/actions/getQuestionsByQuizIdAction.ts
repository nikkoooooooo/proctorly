"use server"
import { getQuestionsByQuizId } from "../helpers/getQuestionsByQuizId"

export async function getQuestionsByQuizIdAction(quizId: string) {
    const result = await getQuestionsByQuizId(quizId)
    return result
}