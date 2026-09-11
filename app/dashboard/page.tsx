import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardHomePage() {
  const user = await requireUser();
  if (!user) return null;

  const isStaff = user.isStaff || user.isSuperuser;

  const [eventCount, resourceCount, postCount, pendingCount, nextEvent, latestPost] =
    await Promise.all([
      prisma.clubEvent.count({ where: isStaff ? undefined : { published: true } }),
      prisma.buildMaterial.count({ where: isStaff ? undefined : { published: true } }),
      prisma.blogPost.count({ where: isStaff ? undefined : { published: true } }),
      isStaff ? prisma.user.count({ where: { isActive: false } }) : Promise.resolve(0),
      prisma.clubEvent.findFirst({
        where: isStaff ? undefined : { published: true },
        orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.blogPost.findFirst({
        where: isStaff ? undefined : { published: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <>
      <header className="dash-page-head">
        <h1>Home</h1>
        <p>Pick a section. Each page is its own space.</p>
      </header>

      <div className="dash-cards">
        <Link className="dash-card" href="/dashboard/events">
          <span className="dash-card__label">Events</span>
          <strong className="dash-card__count">{eventCount}</strong>
          <span className="dash-card__hint">
            {nextEvent ? nextEvent.title : "No events yet"}
          </span>
        </Link>

        <Link className="dash-card" href="/dashboard/resources">
          <span className="dash-card__label">Resources</span>
          <strong className="dash-card__count">{resourceCount}</strong>
          <span className="dash-card__hint">Tools, docs, and links for members</span>
        </Link>

        <Link className="dash-card" href="/dashboard/posts">
          <span className="dash-card__label">Posts</span>
          <strong className="dash-card__count">{postCount}</strong>
          <span className="dash-card__hint">
            {latestPost ? latestPost.title : "No posts yet"}
          </span>
        </Link>

        {isStaff ? (
          <Link className="dash-card dash-card--staff" href="/dashboard/staff">
            <span className="dash-card__label">Staff</span>
            <strong className="dash-card__count">{pendingCount}</strong>
            <span className="dash-card__hint">
              {pendingCount === 1 ? "pending approval" : "pending approvals"}
            </span>
          </Link>
        ) : null}
      </div>
    </>
  );
}
