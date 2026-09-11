import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "../../lib/auth";
import { DashNav } from "./dash-nav";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");

  const isStaff = user.isStaff || user.isSuperuser;
  const role = user.isSuperuser ? "Admin" : isStaff ? "Staff" : "Member";
  const name = user.firstName || user.username;

  const items = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/events", label: "Events" },
    { href: "/dashboard/resources", label: "Resources" },
    { href: "/dashboard/posts", label: "Posts" },
    ...(isStaff ? [{ href: "/dashboard/staff", label: "Staff" }] : []),
  ];

  return (
    <div className="dash">
      <div className="wrap">
        <header className="dash-shell">
          <div className="dash-shell__who">
            <p className="dash-shell__role">{role}</p>
            <p className="dash-shell__name">{name}</p>
          </div>
          <Link className="dash-shell__out" href="/accounts/logout">
            Log out
          </Link>
        </header>

        <DashNav items={items} />

        <div className="dash-main">{children}</div>
      </div>
    </div>
  );
}
