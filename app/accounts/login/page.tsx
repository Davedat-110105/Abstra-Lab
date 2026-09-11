import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authenticate } from "../../../lib/accounts";
import { setSession } from "../../../lib/auth";
import { hasDatabase } from "../../../lib/prisma";
import { clientIp, rateLimit } from "../../../lib/rate-limit";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

async function loginAction(formData: FormData) {
  "use server";
  if (!hasDatabase()) redirect("/accounts/login?error=db");

  const ip = clientIp((await headers()).get("x-forwarded-for"));
  if (!rateLimit(`login:${ip}`, 10, 5 * 60_000).ok) redirect("/accounts/login?error=throttled");

  const user = await authenticate(
    String(formData.get("login") || "").trim(),
    String(formData.get("password") || ""),
  );
  if (!user) redirect("/accounts/login?error=invalid");

  await setSession(user);
  redirect("/dashboard");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; registered?: string }> }) {
  const { error, registered } = await searchParams;
  return (
    <section className="sx-page-hero sx-page-hero--plain">
      <div className="wrap sx-page-hero__content range-ticks range-ticks--section">
        <p className="section-eyebrow">Members</p>
        <h1>Login</h1>
        <p className="sx-page-hero__lede">Access member materials, build logs, events, telemetry, and admin tools.</p>
        {registered === "1" && <p className="auth-note">Account created. Log in to continue.</p>}
        {error && (
          <p className="form-error">
            {error === "throttled"
              ? "Too many attempts. Please wait a few minutes and try again."
              : "Login failed. Check your account status and password."}
          </p>
        )}
        <form className="auth-form" action={loginAction}>
          <label>
            Username or email
            <input name="login" autoComplete="username" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="sx-btn sx-btn--fill" type="submit">Login</button>
        </form>
        <p className="auth-note">Need access? <Link href="/accounts/signup">Sign up</Link>.</p>
      </div>
    </section>
  );
}
