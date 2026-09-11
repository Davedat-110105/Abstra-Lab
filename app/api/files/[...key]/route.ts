import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "../../../../lib/auth";
import { isS3Configured, presignedGetUrl } from "../../../../lib/s3";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isS3Configured()) {
    return NextResponse.json({ ok: false, error: "storage_not_configured" }, { status: 503 });
  }

  const { key: segments } = await params;
  const key = segments.join("/");
  if (!key.startsWith("private/") || key.includes("..")) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const url = await presignedGetUrl(key, 600);
  return NextResponse.redirect(url, 302);
}
