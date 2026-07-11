import { PageHero } from "../page-sections";
import { getPublicPosts } from "../../lib/public-content";
import { pageMetadata } from "../seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Posts",
  description:
    "Build log from the Astra Labs crew — ship notes, bench work, test results, and handoffs for the Pioneer rocket program.",
  path: "/posts",
});

function postDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function PostsPage() {
  const posts = await getPublicPosts();

  return (
    <>
      <PageHero
        eyebrow="Build log"
        title="Posts"
        lede="Frequent updates from the crew — ship notes, bench work, tests, and handoffs for Pioneer."
        meta={["Updated often", "Ship logs", "Launch Canada 2026"]}
      />

      <section className="sx-page-body">
        <div className="wrap">
          <div className="post-feed">
            {posts.length ? (
              posts.map((post) => (
                <article className="post-card" key={post.slug}>
                  {post.featured_image_url && (
                    <a className="post-card__media" href={`/posts/${post.slug}`}>
                      <img src={post.featured_image_url} alt={post.title} />
                    </a>
                  )}
                  <div className="post-card__body">
                    <p className="post-card__meta">{postDate(post.created_at)} · {post.author}</p>
                    <h2><a href={`/posts/${post.slug}`}>{post.title}</a></h2>
                    <p className="post-card__excerpt">{post.excerpt || post.content.split(/\s+/).slice(0, 36).join(" ")}</p>
                    <a className="post-card__link" href={`/posts/${post.slug}`}>Read post</a>
                  </div>
                </article>
              ))
            ) : (
              <div className="post-feed__empty">
                <p className="section-eyebrow">No posts loaded</p>
                <h2>Build log updates will show up here.</h2>
                <p className="sx-page-hero__lede">
                  Add a database URL and publish posts from the Next admin path as that migration lands.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
