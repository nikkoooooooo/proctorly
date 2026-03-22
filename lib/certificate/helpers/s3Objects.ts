import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "@/lib/storage/s3"

const bucket = process.env.AWS_S3_BUCKET
if (!bucket) {
  throw new Error("Missing AWS_S3_BUCKET")
}

export async function uploadPdfToS3(key: string, bytes: Uint8Array) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: "application/pdf",
    })
  )
}
