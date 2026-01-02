"use server"
import { getQuizByJoinCode } from "../helpers/getQuizThroughCode"


export default async function getQuizThroughCodeAction(code: string) {


    const codeQuizResult = await getQuizByJoinCode(code)
    return codeQuizResult

}