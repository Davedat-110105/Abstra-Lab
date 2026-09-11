import { hashPassword, verifyPassword } from "./auth";
import { prisma } from "./prisma";

// Master accounts: any account registered with one of these emails is
// created active + staff + superuser, and an existing account is promoted on
// login. Override with a comma-separated ADMIN_EMAILS env var.
const DEFAULT_ADMIN_EMAILS = ["saipdhodi@gmail.com"];

export function adminEmails() {
  const raw = process.env.ADMIN_EMAILS;
  const list = raw ? raw.split(",") : DEFAULT_ADMIN_EMAILS;
  return list.map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email: string) {
  return adminEmails().includes(email.trim().toLowerCase());
}

export async function authenticate(login: string, password: string) {
  const found = await prisma.user.findFirst({
    where: { OR: [{ username: login }, { email: login }] },
    include: { profile: true },
  });
  if (!found || found.profile?.isBanned) return null;
  if (!(await verifyPassword(password, found.password))) return null;

  let user = found;
  if (isAdminEmail(user.email) && (!user.isActive || !user.isStaff || !user.isSuperuser)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true, isStaff: true, isSuperuser: true },
      include: { profile: true },
    });
  }
  if (!user.isActive) return null;
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
  | { ok: true; userId: number; active: boolean }
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

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { email: true },
  });
  if (existing) {
    return { ok: false, error: existing.email === email ? "email_taken" : "username_taken" };
  }

  const master = isAdminEmail(email);
  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        password: await hashPassword(password),
        isActive: master,
        isStaff: master,
        isSuperuser: master,
        dateJoined: new Date(),
      },
    });
    await prisma.memberProfile.create({ data: { userId: user.id, isBanned: false } });
    return { ok: true, userId: user.id, active: master };
  } catch (error) {
    console.error("registerUser failed", error);
    return { ok: false, error: "signup_failed" };
  }
}
