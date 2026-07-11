import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "./site-shell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"),
  // `default` is used by any page that doesn't set its own title (and by the
  // homepage); `template` appends the brand to every page-level title.
  title: {
    default: "Astra Labs — Student Rocketry at Seneca Polytechnic",
    template: "%s · Astra Labs",
  },
  description:
    "Student rocketry at Seneca Polytechnic. Building Pioneer for Launch Canada 2026.",
  openGraph: {
    type: "website",
    title: "Astra Labs — Student Rocketry at Seneca Polytechnic",
    description:
      "Student rocketry at Seneca Polytechnic. Building Pioneer for Launch Canada 2026.",
    siteName: "Astra Labs",
    images: ["/images/hero-launch.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Astra Labs — Student Rocketry at Seneca Polytechnic",
    description:
      "Student rocketry at Seneca Polytechnic. Building Pioneer for Launch Canada 2026.",
    images: ["/images/hero-launch.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="home">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
