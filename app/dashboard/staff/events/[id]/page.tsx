import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { deleteEvent, updateEvent } from "../../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit event",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");
  if (!user.isStaff && !user.isSuperuser) redirect("/dashboard");

  const { id } = await params;
  let eventId: bigint;
  try {
    eventId = BigInt(id);
  } catch {
    notFound();
  }

  const event = await prisma.clubEvent.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>Edit event</h1>
          <p>/{event.slug}</p>
        </div>
        <Link className="dash-page-head__link" href="/dashboard/staff">
          Back to staff
        </Link>
      </header>

      <form className="staff-form" action={updateEvent}>
        <input type="hidden" name="id" value={event.id.toString()} />
        <label>
          Title
          <input name="title" required defaultValue={event.title} />
        </label>
        <label>
          Date label
          <input name="dateLabel" required defaultValue={event.dateLabel} />
        </label>
        <label>
          Summary
          <input name="summary" defaultValue={event.summary} />
        </label>
        <label>
          Description
          <textarea name="description" required rows={8} defaultValue={event.description} />
        </label>
        <label>
          Location
          <input name="location" defaultValue={event.location} />
        </label>
        <label>
          Image path
          <input name="image" defaultValue={event.image || ""} />
        </label>
        <label className="dash-check">
          <input name="published" type="checkbox" defaultChecked={event.published} /> Published
        </label>
        <div className="staff-form__actions">
          <button className="sx-btn sx-btn--fill" type="submit">
            Save changes
          </button>
          <Link className="sx-btn sx-btn--compact" href="/dashboard/staff">
            Cancel
          </Link>
        </div>
      </form>

      <form className="staff-form staff-form--danger" action={deleteEvent}>
        <input type="hidden" name="id" value={event.id.toString()} />
        <button type="submit" className="staff-danger">
          Delete event
        </button>
      </form>
    </>
  );
}
