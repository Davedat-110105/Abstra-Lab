import Link from "next/link";
import { redirect } from "next/navigation";

import { setSession, verifyPassword } from "../../../lib/auth";
import { hasDatabase, prisma } from "../../../lib/prisma";

async function loginAction(formData: FormData) {
  "use server";
  if (!hasDatabase()) redirect("/accounts/login?error=db");

  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: login }, { email: login }],
    },
    include: { profile: true },
  });

  if (!user || !user.isActive || user.profile?.isBanned || !(await verifyPassword(password, user.password))) {
    redirect("/accounts/login?error=invalid");
  }

  await setSession(user);
  redirect("/dashboard");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <section className="sx-page-hero sx-page-hero--plain">
      <div className="wrap sx-page-hero__content range-ticks range-ticks--section">
        <p className="section-eyebrow">Members</p>
        <h1>Login</h1>
        <p className="sx-page-hero__lede">Access member materials, build logs, events, telemetry, and admin tools.</p>
        {error && <p className="form-error">Login failed. Check your account status and password.</p>}
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
