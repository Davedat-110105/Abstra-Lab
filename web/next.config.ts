import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/work",
        destination: "/pioneer",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
