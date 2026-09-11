import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import {
  approveMember,
  deactivateMember,
  deleteEvent,
  deleteMaterial,
  deletePost,
} from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff",
  robots: { index: false, follow: false },
};

export default async function DashboardStaffPage() {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");
  if (!user.isStaff && !user.isSuperuser) redirect("/dashboard");

  const [posts, events, materials, members] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.clubEvent.findMany({
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.buildMaterial.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 100,
    }),
    prisma.user.findMany({
      include: { profile: true },
      orderBy: { dateJoined: "desc" },
      take: 100,
    }),
  ]);

  const pending = members.filter((m) => !m.isActive);

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>Staff</h1>
          <p>Create and manage posts, events, resources, and members.</p>
        </div>
      </header>

      {/* Quick create buttons */}
      <div className="staff-actions">
        <Link className="sx-btn sx-btn--fill sx-btn--compact" href="/dashboard/staff/posts/new">
          New post
        </Link>
        <Link className="sx-btn sx-btn--fill sx-btn--compact" href="/dashboard/staff/events/new">
          New event
        </Link>
        <Link className="sx-btn sx-btn--fill sx-btn--compact" href="/dashboard/staff/resources/new">
          New resource
        </Link>
      </div>

      {/* Posts table */}
      <section className="staff-section">
        <div className="staff-section__head">
          <h2>Posts</h2>
          <Link href="/dashboard/staff/posts/new">Create</Link>
        </div>
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length ? (
                posts.map((post) => (
                  <tr key={post.id.toString()}>
                    <td>
                      <strong>{post.title}</strong>
                      <span className="staff-table__sub">/{post.slug}</span>
                    </td>
                    <td>
                      <span className={`staff-badge${post.published ? " is-live" : ""}`}>
                        {post.published ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td>{formatDate(post.updatedAt)}</td>
                    <td className="staff-table__actions">
                      <Link href={`/dashboard/staff/posts/${post.id}`}>Edit</Link>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={post.id.toString()} />
                        <button type="submit" className="staff-danger">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="staff-table__empty">
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Events table */}
      <section className="staff-section">
        <div className="staff-section__head">
          <h2>Events</h2>
          <Link href="/dashboard/staff/events/new">Create</Link>
        </div>
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length ? (
                events.map((event) => (
                  <tr key={event.id.toString()}>
                    <td>
                      <strong>{event.title}</strong>
                      {event.location ? (
                        <span className="staff-table__sub">{event.location}</span>
                      ) : null}
                    </td>
                    <td>{event.dateLabel || "—"}</td>
                    <td>
                      <span className={`staff-badge${event.published ? " is-live" : ""}`}>
                        {event.published ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="staff-table__actions">
                      <Link href={`/dashboard/staff/events/${event.id}`}>Edit</Link>
                      <form action={deleteEvent}>
                        <input type="hidden" name="id" value={event.id.toString()} />
                        <button type="submit" className="staff-danger">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="staff-table__empty">
                    No events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Resources table */}
      <section className="staff-section">
        <div className="staff-section__head">
          <h2>Resources</h2>
          <Link href="/dashboard/staff/resources/new">Create</Link>
        </div>
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.length ? (
                materials.map((item) => (
                  <tr key={item.id.toString()}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.summary ? (
                        <span className="staff-table__sub">{item.summary}</span>
                      ) : null}
                    </td>
                    <td>{item.materialType || "—"}</td>
                    <td>
                      <span className={`staff-badge${item.published ? " is-live" : ""}`}>
                        {item.published ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="staff-table__actions">
                      <Link href={`/dashboard/staff/resources/${item.id}`}>Edit</Link>
                      <form action={deleteMaterial}>
                        <input type="hidden" name="id" value={item.id.toString()} />
                        <button type="submit" className="staff-danger">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="staff-table__empty">
                    No resources yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Members table */}
      <section className="staff-section">
        <div className="staff-section__head">
          <h2>
            Members
            {pending.length > 0 ? <span className="dash-pill">{pending.length} pending</span> : null}
          </h2>
        </div>
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length ? (
                members.map((member) => {
                  const role = member.isSuperuser
                    ? "Admin"
                    : member.isStaff
                      ? "Staff"
                      : "Member";
                  const active = member.isActive && !member.profile?.isBanned;
                  return (
                    <tr key={member.id}>
                      <td>
                        <strong>
                          {member.firstName} {member.lastName || member.username}
                        </strong>
                        <span className="staff-table__sub">@{member.username}</span>
                      </td>
                      <td>{member.email}</td>
                      <td>{role}</td>
                      <td>
                        <span className={`staff-badge${active ? " is-live" : ""}`}>
                          {member.profile?.isBanned
                            ? "Banned"
                            : member.isActive
                              ? "Active"
                              : "Pending"}
                        </span>
                      </td>
                      <td className="staff-table__actions">
                        {!member.isActive ? (
                          <form action={approveMember}>
                            <input type="hidden" name="userId" value={member.id} />
                            <button type="submit" className="staff-ok">
                              Approve
                            </button>
                          </form>
                        ) : member.id !== user.id && !member.isSuperuser ? (
                          <form action={deactivateMember}>
                            <input type="hidden" name="userId" value={member.id} />
                            <button type="submit" className="staff-danger">
                              Deactivate
                            </button>
                          </form>
                        ) : (
                          <span className="staff-table__sub">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="staff-table__empty">
                    No members.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}
