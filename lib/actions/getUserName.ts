"use server"


import { getUserNameFromSession } from "../helpers/getUserName"

export async function getUserName(sessionId: string) {
    const username = await getUserNameFromSession(sessionId)


    return username;
}