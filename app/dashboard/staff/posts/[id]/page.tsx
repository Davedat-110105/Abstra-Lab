import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { deletePost, updatePost } from "../../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const user = await requireUser();
  if (!user) redirect("/accounts/login");
  if (!user.isStaff && !user.isSuperuser) redirect("/dashboard");

  const { id } = await params;
  let postId: bigint;
  try {
    postId = BigInt(id);
  } catch {
    notFound();
  }

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) notFound();

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>Edit post</h1>
          <p>/{post.slug}</p>
        </div>
        <Link className="dash-page-head__link" href="/dashboard/staff">
          Back to staff
        </Link>
      </header>

      <form className="staff-form" action={updatePost}>
        <input type="hidden" name="id" value={post.id.toString()} />
        <label>
          Title
          <input name="title" required defaultValue={post.title} />
        </label>
        <label>
          Excerpt
          <input name="excerpt" defaultValue={post.excerpt} />
        </label>
        <label>
          Content
          <textarea name="content" required rows={12} defaultValue={post.content} />
        </label>
        <label>
          Featured image path
          <input name="featuredImage" defaultValue={post.featuredImage || ""} />
        </label>
        <label className="dash-check">
          <input name="published" type="checkbox" defaultChecked={post.published} /> Published
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

      <form className="staff-form staff-form--danger" action={deletePost}>
        <input type="hidden" name="id" value={post.id.toString()} />
        <button type="submit" className="staff-danger">
          Delete post
        </button>
      </form>
    </>
  );
}
