import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "../../../../lib/auth";
import { isS3Configured, presignedGetUrl } from "../../../../lib/s3";

// Gated access to private member files. An active, non-banned member gets a
// short-lived signed URL and is redirected to it; everyone else is turned away.
// This is the ONLY way to read private/* objects — the bucket policy keeps them
// non-public.
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
  // Only private objects are served here; reject traversal and any other prefix.
  if (!key.startsWith("private/") || key.includes("..")) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const url = await presignedGetUrl(key, 600);
  return NextResponse.redirect(url, 302);
}
