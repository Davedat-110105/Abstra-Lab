import { NextRequest, NextResponse } from "next/server";

import { authenticate } from "../../../../lib/accounts";
import { setSession } from "../../../../lib/auth";
import { clientIp, rateLimit } from "../../../../lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers.get("x-forwarded-for"));
  const limit = rateLimit(`login:${ip}`, 10, 5 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await request.json();
  const user = await authenticate(String(body.login || "").trim(), String(body.password || ""));
  if (!user) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }
  await setSession(user);
  return NextResponse.json({ ok: true });
}
