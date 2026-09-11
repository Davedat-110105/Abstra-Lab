import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { registerUser } from "../../../lib/accounts";
import { hasDatabase } from "../../../lib/prisma";
import { clientIp, rateLimit } from "../../../lib/rate-limit";

export const metadata: Metadata = {
  title: "Request access",
  robots: { index: false, follow: false },
};

async function signupAction(formData: FormData) {
  "use server";
  if (!hasDatabase()) redirect("/accounts/signup?error=db");

  const ip = clientIp((await headers()).get("x-forwarded-for"));
  if (!rateLimit(`signup:${ip}`, 5, 15 * 60_000).ok) redirect("/accounts/signup?error=throttled");

  const result = await registerUser({
    username: String(formData.get("username") || ""),
    email: String(formData.get("email") || ""),
    firstName: String(formData.get("firstName") || ""),
    lastName: String(formData.get("lastName") || ""),
    password: String(formData.get("password") || ""),
  });
  if (!result.ok) {
    redirect(result.error === "invalid" ? "/accounts/signup?error=invalid" : "/accounts/signup?error=taken");
  }

  if (result.active) redirect("/accounts/login?registered=1");
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
        {error && (
          <p className="form-error">
            {error === "throttled"
              ? "Too many attempts. Please wait a few minutes and try again."
              : "Sign up failed. Use unique username/email and an 8+ character password."}
          </p>
        )}
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
