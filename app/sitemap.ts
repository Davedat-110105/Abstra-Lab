import type { MetadataRoute } from "next";

const routes = [
  ["", 1],
  ["/pioneer", 0.9],
  ["/events", 0.8],
  ["/posts", 0.8],
  ["/about", 0.7],
  ["/join", 0.7],
  ["/sponsor", 0.8],
  ["/members", 0.5],
  ["/discord", 0.4],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const lastModified = new Date();

  return routes.map(([path, priority]) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    priority,
  }));
}
