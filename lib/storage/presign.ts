import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3 } from "./s3"

const bucket = process.env.AWS_S3_BUCKET
if (!bucket) {
  throw new Error("Missing AWS_S3_BUCKET")
}

export async function presignUpload(key: string, contentType: string) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3, cmd, { expiresIn: 60 })
}

export async function presignRead(key: string) {
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })
  return getSignedUrl(s3, cmd, { expiresIn: 300 })
}
