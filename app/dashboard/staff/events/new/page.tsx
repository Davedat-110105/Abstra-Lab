import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "../../../../../lib/auth";
import { createEvent } from "../../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New event",
  robots: { index: false, follow: false },
};

export default async function NewEventPage() {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");
  if (!user.isStaff && !user.isSuperuser) redirect("/dashboard");

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>New event</h1>
          <p>Add a work session, workshop, or launch date.</p>
        </div>
        <Link className="dash-page-head__link" href="/dashboard/staff">
          Back to staff
        </Link>
      </header>

      <form className="staff-form" action={createEvent}>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Date label
          <input name="dateLabel" placeholder="Fri Mar 14" required />
        </label>
        <label>
          Summary
          <input name="summary" placeholder="One-line summary" />
        </label>
        <label>
          Description
          <textarea name="description" required rows={8} />
        </label>
        <label>
          Location
          <input name="location" placeholder="Room / campus" />
        </label>
        <label>
          Image path
          <input name="image" placeholder="/uploads/event.jpg" />
        </label>
        <label className="dash-check">
          <input name="published" type="checkbox" defaultChecked /> Published
        </label>
        <div className="staff-form__actions">
          <button className="sx-btn sx-btn--fill" type="submit">
            Create event
          </button>
          <Link className="sx-btn sx-btn--compact" href="/dashboard/staff">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
