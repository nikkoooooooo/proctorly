"use server"
import { getUserJoinedQuiz } from "../helpers/getUserJoinedQuiz"


export async function getUserJoinedQuizAction(userId: string) {
    const result = await getUserJoinedQuiz(userId)
    console.log(result)
    return result
}