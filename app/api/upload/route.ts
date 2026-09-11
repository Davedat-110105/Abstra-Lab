import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

import { requireStaff } from "../../../lib/auth";
import { isS3Configured, publicUrl, putObject } from "../../../lib/s3";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  pdf: "application/pdf",
};

export async function POST(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file required" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "file too large" }, { status: 413 });
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+/, "") || "upload.bin";
  const ext = safeName.includes(".") ? safeName.split(".").pop()! : "";
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ ok: false, error: "unsupported file type" }, { status: 415 });
  }

  const visibility = form.get("visibility") === "public" ? "public" : "private";
  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${safeName}`;

  if (isS3Configured()) {
    const key = `${visibility}/${name}`;
    try {
      await putObject(key, bytes, contentType);
    } catch (error) {
      console.error("S3 upload failed", error);
      return NextResponse.json({ ok: false, error: "upload_failed" }, { status: 502 });
    }
    const url = visibility === "public" ? publicUrl(key) : `/api/files/${key}`;
    return NextResponse.json({ ok: true, url, key, visibility });
  }

  if (visibility === "private") {
    return NextResponse.json(
      { ok: false, error: "private uploads require S3 (set S3_BUCKET)" },
      { status: 501 },
    );
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return NextResponse.json({ ok: true, url: `/uploads/${name}`, visibility: "public" });
}
