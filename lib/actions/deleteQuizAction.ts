"use server" 
import { deleteQuiz } from "../helpers/deleteQuiz"


export async function deleteQuizAction(quizId: string) {
        await deleteQuiz(quizId)
}