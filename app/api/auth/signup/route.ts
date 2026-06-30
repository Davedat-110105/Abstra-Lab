import { NextRequest, NextResponse } from "next/server";

import { hashPassword } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const username = String(body.username || "").trim();
  const email = String(body.email || "").trim();
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const password = String(body.password || "");
  if (!username || !email || !firstName || !lastName || password.length < 8) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        password: await hashPassword(password),
        isActive: false,
        isStaff: false,
        isSuperuser: false,
        dateJoined: new Date(),
      },
    });
    await prisma.memberProfile.create({ data: { userId: user.id, isBanned: false } });
    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: "signup_failed" }, { status: 409 });
  }
}
