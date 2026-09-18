import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/db/setup": ["./prisma/migrations/**/*"],
    "/api/health": ["./prisma/migrations/**/*"],
    "/api/auth/register": ["./prisma/migrations/**/*"],
    "/api/auth/[...nextauth]": ["./prisma/migrations/**/*"],
  },
  async headers() {
    return [
      {
        source: "/stockfish/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
