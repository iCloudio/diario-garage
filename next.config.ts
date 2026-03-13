import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/vehicles/:id/deadlines",
        destination: "/vehicles/:id",
        permanent: true,
      },
      {
        source: "/vehicles/:id/expenses",
        destination: "/vehicles/:id",
        permanent: true,
      },
      {
        source: "/vehicles/:id/costs",
        destination: "/vehicles/:id",
        permanent: true,
      },
      {
        source: "/vehicles/:id/edit",
        destination: "/vehicles/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
