import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "../../../../../lib/auth";
import { createPost } from "../../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");
  if (!user.isStaff && !user.isSuperuser) redirect("/dashboard");

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>New post</h1>
          <p>Write a build log entry for members and the public site.</p>
        </div>
        <Link className="dash-page-head__link" href="/dashboard/staff">
          Back to staff
        </Link>
      </header>

      <form className="staff-form" action={createPost}>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Excerpt
          <input name="excerpt" placeholder="Short summary" />
        </label>
        <label>
          Content
          <textarea name="content" required rows={12} />
        </label>
        <label>
          Featured image path
          <input name="featuredImage" placeholder="/uploads/post.jpg" />
        </label>
        <label className="dash-check">
          <input name="published" type="checkbox" /> Published
        </label>
        <div className="staff-form__actions">
          <button className="sx-btn sx-btn--fill" type="submit">
            Create post
          </button>
          <Link className="sx-btn sx-btn--compact" href="/dashboard/staff">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
