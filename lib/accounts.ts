import { hashPassword, verifyPassword } from "./auth";
import { prisma } from "./prisma";

// Shared account logic used by both the server-action pages (/accounts/*) and
// the JSON API routes (/api/auth/*), so the two can't drift apart.

export async function authenticate(login: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: login }, { email: login }] },
    include: { profile: true },
  });
  if (!user || !user.isActive || user.profile?.isBanned) return null;
  if (!(await verifyPassword(password, user.password))) return null;
  return user;
}

export type SignupInput = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type SignupResult =
  | { ok: true; userId: number }
  | { ok: false; error: "invalid" | "email_taken" | "username_taken" | "signup_failed" };

export async function registerUser(input: SignupInput): Promise<SignupResult> {
  const username = input.username.trim();
  const email = input.email.trim();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const { password } = input;

  if (!username || !email || !firstName || !lastName || password.length < 8) {
    return { ok: false, error: "invalid" };
  }

  // Case-sensitive check mirroring the DB `@unique` constraints, so the caller
  // can report exactly which field collided.
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { email: true },
  });
  if (existing) {
    return { ok: false, error: existing.email === email ? "email_taken" : "username_taken" };
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
    return { ok: true, userId: user.id };
  } catch (error) {
    // Most likely a unique-constraint race between the check above and create.
    console.error("registerUser failed", error);
    return { ok: false, error: "signup_failed" };
  }
}
