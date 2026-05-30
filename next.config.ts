import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: "/:path*.pdf",
        headers: [{ key: "Content-Type", value: "application/pdf" }],
      },
    ];
  },
};

export default nextConfig;
