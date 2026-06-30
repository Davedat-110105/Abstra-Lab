import Link from "next/link";
import { redirect } from "next/navigation";

import { hashPassword } from "../../../lib/auth";
import { hasDatabase, prisma } from "../../../lib/prisma";

async function signupAction(formData: FormData) {
  "use server";
  if (!hasDatabase()) redirect("/accounts/signup?error=db");

  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const password = String(formData.get("password") || "");
  if (!username || !email || !firstName || !lastName || password.length < 8) {
    redirect("/accounts/signup?error=invalid");
  }

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
  redirect("/accounts/pending");
}

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <section className="sx-page-hero sx-page-hero--plain">
      <div className="wrap sx-page-hero__content range-ticks range-ticks--section">
        <p className="section-eyebrow">Members</p>
        <h1>Request access</h1>
        <p className="sx-page-hero__lede">Create an account. An admin approves member access before login works.</p>
        {error && <p className="form-error">Sign up failed. Use unique username/email and an 8+ character password.</p>}
        <form className="auth-form" action={signupAction}>
          <label>First name<input name="firstName" required /></label>
          <label>Last name<input name="lastName" required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Username<input name="username" autoComplete="username" required /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <button className="sx-btn sx-btn--fill" type="submit">Sign up</button>
        </form>
        <p className="auth-note">Already approved? <Link href="/accounts/login">Login</Link>.</p>
      </div>
    </section>
  );
}
