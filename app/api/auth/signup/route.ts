import { NextRequest, NextResponse } from "next/server";

import { registerUser } from "../../../../lib/accounts";
import { clientIp, rateLimit } from "../../../../lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers.get("x-forwarded-for"));
  const limit = rateLimit(`signup:${ip}`, 5, 15 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await request.json();
  const result = await registerUser({
    username: String(body.username || ""),
    email: String(body.email || ""),
    firstName: String(body.firstName || ""),
    lastName: String(body.lastName || ""),
    password: String(body.password || ""),
  });
  if (!result.ok) {
    const status = result.error === "invalid" ? 400 : 409;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  return NextResponse.json({ ok: true, userId: result.userId, active: result.active }, { status: 201 });
}
