"use server"


import { getUserNameFromSession } from "../helpers/getUserName"
import { getUserNameFromQuiz } from "../helpers/getUserName";

export async function getUserName(sessionId: string) {
    const username = await getUserNameFromSession(sessionId)


    return username;
}



export async function getUserNameFromQuizAction(quizId: string) {
    const username = await getUserNameFromQuiz(quizId)
    return username
}