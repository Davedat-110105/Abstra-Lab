import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { deleteMaterial, updateMaterial } from "../../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit resource",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditResourcePage({ params }: Props) {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");
  if (!user.isStaff && !user.isSuperuser) redirect("/dashboard");

  const { id } = await params;
  let materialId: bigint;
  try {
    materialId = BigInt(id);
  } catch {
    notFound();
  }

  const item = await prisma.buildMaterial.findUnique({ where: { id: materialId } });
  if (!item) notFound();

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>Edit resource</h1>
          <p>{item.name}</p>
        </div>
        <Link className="dash-page-head__link" href="/dashboard/staff">
          Back to staff
        </Link>
      </header>

      <form className="staff-form" action={updateMaterial}>
        <input type="hidden" name="id" value={item.id.toString()} />
        <label>
          Name
          <input name="name" required defaultValue={item.name} />
        </label>
        <label>
          Type
          <input name="materialType" defaultValue={item.materialType} />
        </label>
        <label>
          Summary
          <input name="summary" required defaultValue={item.summary} />
        </label>
        <label>
          Used for
          <input name="usedFor" required defaultValue={item.usedFor} />
        </label>
        <label>
          Link
          <input name="purchaseUrl" defaultValue={item.purchaseUrl} />
        </label>
        <label>
          Access note
          <input name="access" defaultValue={item.access} />
        </label>
        <label>
          Sort order
          <input name="sortOrder" type="number" defaultValue={item.sortOrder} />
        </label>
        <label className="dash-check">
          <input name="published" type="checkbox" defaultChecked={item.published} /> Published
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

      <form className="staff-form staff-form--danger" action={deleteMaterial}>
        <input type="hidden" name="id" value={item.id.toString()} />
        <button type="submit" className="staff-danger">
          Delete resource
        </button>
      </form>
    </>
  );
}
