import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  robots: { index: false, follow: false },
};

export default async function DashboardEventsPage() {
  const user = await requireUser();
  if (!user) return null;
  const isStaff = user.isStaff || user.isSuperuser;

  const events = await prisma.clubEvent.findMany({
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    where: isStaff ? undefined : { published: true },
  });

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>Events</h1>
          <p>Work sessions, workshops, and launches.</p>
        </div>
        <Link className="dash-page-head__link" href="/events">
          Public page
        </Link>
      </header>

      {events.length ? (
        <ul className="dash-list">
          {events.map((event) => (
            <li key={event.slug} className="dash-list__row">
              <span className="dash-list__meta">{event.dateLabel || "Upcoming"}</span>
              <div className="dash-list__body">
                <strong>{event.title}</strong>
                {event.summary ? <p>{event.summary}</p> : null}
                {event.location ? <span className="dash-list__sub">{event.location}</span> : null}
              </div>
              {isStaff && !event.published ? (
                <span className="dash-list__tag">Draft</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="dash-empty">No events yet. Check Discord for the next session.</p>
      )}
    </>
  );
}
