"use server"

import { db } from "@/lib/db"
import { user } from "@/lib/schema"
import { eq } from "drizzle-orm"

interface Props {
    newName?: string
    userId: string
}


export async function updateName({ newName, userId }: Props) {
    try { 
        await db 
        .update(user)
        .set({ name:newName })
        .where(eq(user.id, userId))
    } catch (error) {
        console.error("Failed to update user name:", error)
        throw error
    }

}
