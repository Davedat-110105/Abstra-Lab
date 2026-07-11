import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION || "ca-central-1";

// S3 is used only when a bucket is configured; otherwise the upload route falls
// back to the local filesystem (dev) for PUBLIC files only.
export function isS3Configured() {
  return Boolean(bucket);
}

let client: S3Client | null = null;
function s3() {
  // Credentials come from the standard AWS chain (env vars, shared config, or
  // an IAM role) — nothing is hardcoded here.
  if (!client) client = new S3Client({ region });
  return client;
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  if (!bucket) throw new Error("S3_BUCKET is not configured");
  await s3().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
  );
}

// Permanent URL for objects under the public/ prefix (the only prefix the bucket
// policy exposes). Prefers a CDN/custom domain if S3_PUBLIC_BASE_URL is set.
export function publicUrl(key: string) {
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return base ? `${base}/${key}` : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

// Short-lived signed URL for private objects. The caller is responsible for
// authorizing the request BEFORE minting this.
export async function presignedGetUrl(key: string, expiresIn = 600) {
  if (!bucket) throw new Error("S3_BUCKET is not configured");
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
}
