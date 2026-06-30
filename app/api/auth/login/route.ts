import { NextRequest, NextResponse } from "next/server";

import { setSession, verifyPassword } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const login = String(body.login || "").trim();
  const password = String(body.password || "");
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: login }, { email: login }] },
    include: { profile: true },
  });
  if (!user || !user.isActive || user.profile?.isBanned || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }
  await setSession(user);
  return NextResponse.json({ ok: true });
}
