import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION || "ca-central-1";
const endpoint = process.env.S3_ENDPOINT;

export function isS3Configured() {
  return Boolean(bucket);
}

let client: S3Client | null = null;
function s3() {
  if (!client) {
    client = new S3Client(endpoint ? { region, endpoint, forcePathStyle: true } : { region });
  }
  return client;
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  if (!bucket) throw new Error("S3_BUCKET is not configured");
  await s3().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
  );
}

export function publicUrl(key: string) {
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  if (endpoint) return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function presignedGetUrl(key: string, expiresIn = 600) {
  if (!bucket) throw new Error("S3_BUCKET is not configured");
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
}
