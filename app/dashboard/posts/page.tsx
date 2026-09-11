import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Posts",
  robots: { index: false, follow: false },
};

export default async function DashboardPostsPage() {
  const user = await requireUser();
  if (!user) return null;
  const isStaff = user.isStaff || user.isSuperuser;

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    where: isStaff ? undefined : { published: true },
  });

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>Posts</h1>
          <p>Build log and ship notes from the crew.</p>
        </div>
        <Link className="dash-page-head__link" href="/posts">
          Public page
        </Link>
      </header>

      {posts.length ? (
        <ul className="dash-list">
          {posts.map((post) => (
            <li key={post.slug} className="dash-list__row">
              <div className="dash-list__body">
                <strong>
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </strong>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
                <span className="dash-list__sub">{formatDate(post.createdAt)}</span>
              </div>
              {isStaff ? (
                <span className={`dash-list__tag${post.published ? " is-live" : ""}`}>
                  {post.published ? "Live" : "Draft"}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="dash-empty">No posts yet.</p>
      )}
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
