"use server"
import { joinQuiz } from "../helpers/joinQuiz"


export async function joinQuizAction(quizId: string, userId: string) {
    await joinQuiz(quizId, userId)
}   