import { v4 as uuid } from "uuid"

export function buildQuestionImageKey(userId: string, questionId: string, ext: string) {
  return `images/${userId}/${questionId}/${uuid()}.${ext}`
}
