import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALGO = "aes-256-gcm"
const IV_LEN = 12

function getKey() {
  const key = process.env.STUDENT_NO_KEY
  if (!key) throw new Error("Missing STUDENT_NO_KEY")
  const buf = Buffer.from(key, "base64")
  if (buf.length !== 32) throw new Error("STUDENT_NO_KEY must be 32 bytes (base64)")
  return buf
}

export function encryptStudentNo(plain: string) {
  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ciphertext.toString("base64")}`
}

export function decryptStudentNo(payload: string) {
  const key = getKey()
  const [ivB64, tagB64, ctB64] = payload.split(".")
  if (!ivB64 || !tagB64 || !ctB64) return null
  const iv = Buffer.from(ivB64, "base64")
  const tag = Buffer.from(tagB64, "base64")
  const ciphertext = Buffer.from(ctB64, "base64")
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plain.toString("utf8")
}
