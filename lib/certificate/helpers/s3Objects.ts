import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
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

export async function uploadImageToS3(key: string, bytes: Uint8Array, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    })
  )
}

async function streamToBuffer(stream: any): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function downloadObjectFromS3(key: string) {
  const result = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )

  if (!result.Body) {
    throw new Error("S3 object has no body")
  }

  return streamToBuffer(result.Body)
}
