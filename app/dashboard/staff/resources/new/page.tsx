import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "../../../../../lib/auth";
import { createMaterial } from "../../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New resource",
  robots: { index: false, follow: false },
};

export default async function NewResourcePage() {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");
  if (!user.isStaff && !user.isSuperuser) redirect("/dashboard");

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>New resource</h1>
          <p>Add hardware, software, docs, or links for members.</p>
        </div>
        <Link className="dash-page-head__link" href="/dashboard/staff">
          Back to staff
        </Link>
      </header>

      <form className="staff-form" action={createMaterial}>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Type
          <input name="materialType" placeholder="hardware / software / docs" defaultValue="hardware" />
        </label>
        <label>
          Summary
          <input name="summary" required />
        </label>
        <label>
          Used for
          <input name="usedFor" required />
        </label>
        <label>
          Link
          <input name="purchaseUrl" placeholder="https://..." />
        </label>
        <label>
          Access note
          <input name="access" placeholder="Members only" />
        </label>
        <label>
          Sort order
          <input name="sortOrder" type="number" defaultValue={0} />
        </label>
        <label className="dash-check">
          <input name="published" type="checkbox" defaultChecked /> Published
        </label>
        <div className="staff-form__actions">
          <button className="sx-btn sx-btn--fill" type="submit">
            Create resource
          </button>
          <Link className="sx-btn sx-btn--compact" href="/dashboard/staff">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
