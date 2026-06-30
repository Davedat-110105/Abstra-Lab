import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff, requireUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

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

  const [posts, events, materials, frames, members] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.clubEvent.findMany({ orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }], take: 10 }),
    prisma.buildMaterial.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: 20 }),
    prisma.telemetryFrame.findMany({ orderBy: { receivedAt: "desc" }, take: 8 }),
    user.isStaff || user.isSuperuser
      ? prisma.user.findMany({ include: { profile: true }, orderBy: { dateJoined: "desc" }, take: 30 })
      : Promise.resolve([]),
  ]);
  const isStaff = user.isStaff || user.isSuperuser;

  return (
    <section className="sx-page-body dashboard-page">
      <div className="wrap">
        <div className="dashboard-head">
          <div>
            <p className="section-eyebrow">Dashboard</p>
            <h1>Hi, {user.firstName || user.username}</h1>
          </div>
          <Link className="sx-btn" href="/accounts/logout">Logout</Link>
        </div>

        <div className="dashboard-grid">
          <Panel title="Latest posts">
            {posts.map((post) => <Row key={post.slug} label={post.published ? "Live" : "Draft"} title={post.title} />)}
            {isStaff && <PostForm />}
          </Panel>

          <Panel title="Events">
            {events.map((event) => <Row key={event.slug} label={event.dateLabel} title={event.title} />)}
            {isStaff && <EventForm />}
          </Panel>

          <Panel title="Materials">
            {materials.map((item) => <Row key={item.id.toString()} label={item.materialType} title={item.name} />)}
            {isStaff && <MaterialForm />}
          </Panel>

          <Panel title="Telemetry">
            {frames.map((frame) => (
              <Row
                key={frame.id.toString()}
                label={frame.groundStation || "station"}
                title={`${frame.altitudeM ?? "—"} m · ${frame.batteryV ?? "—"} V`}
              />
            ))}
          </Panel>

          {isStaff && (
            <Panel title="Members">
              {members.map((member) => (
                <form className="dashboard-row" action={approveMember} key={member.id}>
                  <input type="hidden" name="userId" value={member.id} />
                  <span>{member.isActive ? "Active" : "Pending"}</span>
                  <strong>{member.firstName} {member.lastName || member.username}</strong>
                  {!member.isActive && <button className="sx-btn" type="submit">Approve</button>}
                </form>
              ))}
            </Panel>
          )}
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="dashboard-panel"><h2>{title}</h2>{children}</section>;
}

function Row({ label, title }: { label: string; title: string }) {
  return <div className="dashboard-row"><span>{label}</span><strong>{title}</strong></div>;
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
