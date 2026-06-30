import { hasDatabase, prisma } from "./prisma";

export type PublicPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  created_at: string;
  featured_image_url: string;
};

export type PublicEvent = {
  title: string;
  slug: string;
  date_label: string;
  summary: string;
  description: string;
  location: string;
  media_url: string;
  is_video: boolean;
};

export async function getPublicPosts(): Promise<PublicPost[]> {
  if (!hasDatabase()) return [];

  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    return posts.map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: authorName(post.author),
      created_at: post.createdAt.toISOString(),
      featured_image_url: mediaUrl(post.featuredImage),
    }));
  } catch {
    return [];
  }
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  if (!hasDatabase()) return [];

  try {
    const events = await prisma.clubEvent.findMany({
      where: { published: true },
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    });

    return events.map((event) => ({
      title: event.title,
      slug: event.slug,
      date_label: event.dateLabel,
      summary: event.summary,
      description: event.description,
      location: event.location,
      media_url: mediaUrl(event.image),
      is_video: isVideo(event.image),
    }));
  } catch {
    return [];
  }
}

function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path;
  return `/media/${path}`;
}

function isVideo(path?: string | null) {
  return Boolean(path?.match(/\.(mp4|mov|webm|m4v)$/i));
}

function authorName(author?: { firstName: string; lastName: string; username: string } | null) {
  if (!author) return "Astra Labs";
  return [author.firstName, author.lastName].filter(Boolean).join(" ") || author.username;
}
