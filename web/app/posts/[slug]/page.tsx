import Link from "next/link";
import { getPublicPosts } from "../../../lib/public-content";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const post = (await getPublicPosts()).find((item) => item.slug === slug);

  if (!post) {
    return (
      <section className="sx-page-hero sx-page-hero--plain">
        <div className="wrap sx-page-hero__content range-ticks range-ticks--section">
          <p className="section-eyebrow">Post</p>
          <h1>Post not loaded.</h1>
          <p className="sx-page-hero__lede">Check the post slug or publish this post in the Next database.</p>
          <Link className="sx-btn" href="/posts">All posts</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="sx-page-hero sx-page-hero--plain">
        <div className="wrap sx-page-hero__content range-ticks range-ticks--section">
          <p className="section-eyebrow">{new Date(post.created_at).toLocaleDateString()} · {post.author}</p>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="sx-page-hero__lede">{post.excerpt}</p>}
        </div>
      </section>
      <section className="sx-page-body">
        <div className="wrap">
          {post.featured_image_url && (
            <figure className="blog-featured">
              <img src={post.featured_image_url} alt={post.title} />
            </figure>
          )}
          <article className="blog-content">
            {post.content.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
          <div className="post-detail__actions">
            <Link className="sx-btn" href="/posts">All posts</Link>
          </div>
        </div>
      </section>
    </>
  );
}
