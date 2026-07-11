import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff, requireUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

async function createPost(formData: FormData) {
  "use server";
  const staff = await requireStaff();
  if (!staff) redirect("/accounts/login");
  const title = String(formData.get("title") || "").trim();
  const slug = slugify(title);
  if (!title || !slug) return;
  await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: String(formData.get("excerpt") || ""),
      content: String(formData.get("content") || ""),
      featuredImage: String(formData.get("featuredImage") || ""),
      published: formData.get("published") === "on",
      authorId: staff.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/posts");
}

async function createEvent(formData: FormData) {
  "use server";
  const staff = await requireStaff();
  if (!staff) redirect("/accounts/login");
  const title = String(formData.get("title") || "").trim();
  const slug = slugify(title);
  if (!title || !slug) return;
  await prisma.clubEvent.create({
    data: {
      title,
      slug,
      dateLabel: String(formData.get("dateLabel") || "Upcoming"),
      summary: String(formData.get("summary") || ""),
      description: String(formData.get("description") || ""),
      location: String(formData.get("location") || ""),
      image: String(formData.get("image") || ""),
      published: formData.get("published") === "on",
      authorId: staff.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/events");
}

async function createMaterial(formData: FormData) {
  "use server";
  const staff = await requireStaff();
  if (!staff) redirect("/accounts/login");
  await prisma.buildMaterial.create({
    data: {
      materialType: String(formData.get("materialType") || "hardware"),
      name: String(formData.get("name") || ""),
      summary: String(formData.get("summary") || ""),
      usedFor: String(formData.get("usedFor") || ""),
      access: String(formData.get("access") || ""),
      urlName: "",
      dashboardSection: "",
      accessLabel: "",
      purchaseUrl: String(formData.get("purchaseUrl") || ""),
      published: formData.get("published") === "on",
      sortOrder: Number(formData.get("sortOrder") || 0),
      authorId: staff.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  revalidatePath("/dashboard");
}

async function approveMember(formData: FormData) {
  "use server";
  const staff = await requireStaff();
  if (!staff) redirect("/accounts/login");
  await prisma.user.update({
    where: { id: Number(formData.get("userId")) },
    data: { isActive: true },
  });
  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");
  const isStaff = user.isStaff || user.isSuperuser;
  const role = user.isSuperuser ? "Admin" : isStaff ? "Staff" : "Member";

  const [posts, events, materials, frames, members] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.clubEvent.findMany({ orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }], take: 6 }),
    prisma.buildMaterial.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: 12 }),
    prisma.telemetryFrame.findMany({ orderBy: { receivedAt: "desc" }, take: 1 }),
    isStaff
      ? prisma.user.findMany({ include: { profile: true }, orderBy: { dateJoined: "desc" }, take: 40 })
      : Promise.resolve([]),
  ]);
  const latest = frames[0];
  const pending = members.filter((member) => !member.isActive);

  return (
    <section className="sx-page-body dashboard-page">
      <div className="wrap">
        <header className="dashboard-head">
          <div className="range-ticks range-ticks--section">
            <p className="section-eyebrow">Dashboard · {role}</p>
            <h1>Hi, {user.firstName || user.username}.</h1>
          </div>
          <Link className="sx-btn sx-btn--compact" href="/accounts/logout">Log out</Link>
        </header>

        {isStaff && (
          <section className="dash-admin">
            <p className="section-eyebrow">Admin</p>
            <div className="dash-admin__grid">
              <div>
                <h2 className="dash-h">
                  Member approvals
                  {pending.length > 0 && <span className="dash-badge">{pending.length}</span>}
                </h2>
                {pending.length ? (
                  <div className="dash-list">
                    {pending.map((member) => (
                      <form className="dash-row dash-row--action" action={approveMember} key={member.id}>
                        <input type="hidden" name="userId" value={member.id} />
                        <span className="dash-row__label">Pending</span>
                        <strong className="dash-row__main">
                          {member.firstName} {member.lastName || member.username}
                        </strong>
                        <button className="sx-btn sx-btn--compact" type="submit">Approve →</button>
                      </form>
                    ))}
                  </div>
                ) : (
                  <p className="dash-empty">No members waiting for approval.</p>
                )}
              </div>
              <div>
                <h2 className="dash-h">Quick create</h2>
                <div className="dash-create">
                  <details>
                    <summary>New post</summary>
                    <PostForm />
                  </details>
                  <details>
                    <summary>New event</summary>
                    <EventForm />
                  </details>
                  <details>
                    <summary>New material</summary>
                    <MaterialForm />
                  </details>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="dash-section">
          <p className="section-eyebrow">Latest telemetry</p>
          {latest ? (
            <div className="dash-readout">
              <Readout value={num(latest.altitudeM, 0)} unit="m" label="Altitude" />
              <Readout value={num(latest.velocityMps, 0)} unit="m/s" label="Velocity" />
              <Readout value={num(latest.batteryV, 1)} unit="V" label="Battery" />
              <Readout value={latest.groundStation || "—"} label="Ground station" />
            </div>
          ) : (
            <p className="dash-empty">No telemetry frames received yet.</p>
          )}
        </section>

        <section className="dash-section">
          <p className="section-eyebrow">Member resources</p>
          {materials.length ? (
            <div className="dash-list">
              {materials.map((item) => (
                <div className="dash-row dash-row--res" key={item.id.toString()}>
                  <span className="dash-row__label">{item.materialType || "item"}</span>
                  <span className="dash-row__main">
                    <strong>{item.name}</strong>
                    {item.summary ? <em>{item.summary}</em> : null}
                  </span>
                  <span className="dash-row__meta">{item.access || "Members"}</span>
                  {item.purchaseUrl ? (
                    <a className="dash-row__go" href={item.purchaseUrl} target="_blank" rel="noopener noreferrer">
                      open →
                    </a>
                  ) : (
                    <span className="dash-row__go dash-row__go--muted">—</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="dash-empty">No member resources published yet.</p>
          )}
        </section>

        <div className="dash-cols">
          <section className="dash-section">
            <p className="section-eyebrow">Build log</p>
            {posts.length ? (
              <div className="dash-list">
                {posts.map((post) => (
                  <div className="dash-row dash-row--mini" key={post.slug}>
                    <span className="dash-row__label">{post.published ? "Live" : "Draft"}</span>
                    <strong className="dash-row__main">{post.title}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dash-empty">No posts yet.</p>
            )}
          </section>
          <section className="dash-section">
            <p className="section-eyebrow">Events</p>
            {events.length ? (
              <div className="dash-list">
                {events.map((event) => (
                  <div className="dash-row dash-row--mini" key={event.slug}>
                    <span className="dash-row__label">{event.dateLabel}</span>
                    <strong className="dash-row__main">{event.title}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dash-empty">No events yet.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function Readout({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div className="dash-readout__cell">
      <div className="dash-readout__val">
        {value}
        {unit ? <span className="dash-readout__unit">{unit}</span> : null}
      </div>
      <div className="dash-readout__label">{label}</div>
    </div>
  );
}

function num(value: number | null, digits: number) {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function PostForm() {
  return <form className="dashboard-form" action={createPost}>
    <input name="title" placeholder="Post title" required />
    <input name="excerpt" placeholder="Excerpt" />
    <textarea name="content" placeholder="Content" required />
    <input name="featuredImage" placeholder="/uploads/post.jpg" />
    <label><input name="published" type="checkbox" /> Published</label>
    <button className="sx-btn sx-btn--fill" type="submit">Add post</button>
  </form>;
}

function EventForm() {
  return <form className="dashboard-form" action={createEvent}>
    <input name="title" placeholder="Event title" required />
    <input name="dateLabel" placeholder="Date label" required />
    <input name="summary" placeholder="Summary" />
    <textarea name="description" placeholder="Description" required />
    <input name="location" placeholder="Location" />
    <input name="image" placeholder="/uploads/event.jpg" />
    <label><input name="published" type="checkbox" defaultChecked /> Published</label>
    <button className="sx-btn sx-btn--fill" type="submit">Add event</button>
  </form>;
}

function MaterialForm() {
  return <form className="dashboard-form" action={createMaterial}>
    <input name="name" placeholder="Material name" required />
    <input name="materialType" placeholder="hardware" />
    <input name="summary" placeholder="Summary" required />
    <input name="usedFor" placeholder="Used for" required />
    <input name="purchaseUrl" placeholder="Purchase URL" />
    <input name="access" placeholder="Access note" />
    <input name="sortOrder" type="number" defaultValue={0} />
    <label><input name="published" type="checkbox" defaultChecked /> Published</label>
    <button className="sx-btn sx-btn--fill" type="submit">Add material</button>
  </form>;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}
