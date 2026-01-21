// app/actions/updateUser.ts
"use server"

import { db } from "@/lib/db"
import { user } from "@/lib/schema"
import { eq } from "drizzle-orm"

interface UpdateUserPayload {
  userId: string
  name?: string
  studentNo?: string
  section?: string
}

export async function updateUser({ userId, name, studentNo, section }: UpdateUserPayload) {
  try {
    // Only include fields that are provided
    const updateData: Partial<{ name: string; studentNo: string; section: string }> = {}
    if (name !== undefined) updateData.name = name
    if (studentNo !== undefined) updateData.studentNo = studentNo
    if (section !== undefined) updateData.section = section

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "No data provided to update" }
    }

    const result = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning()

    return { success: true, user: result[0] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
