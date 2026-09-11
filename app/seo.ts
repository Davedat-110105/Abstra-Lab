import type { Metadata } from "next";

export const siteName = "Astra Labs";

const DEFAULT_OG_IMAGE = "/images/hero-launch.jpg";

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
}): Metadata {
  const ogTitle = `${title} · ${siteName}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName,
      title: ogTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [image],
    },
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}
