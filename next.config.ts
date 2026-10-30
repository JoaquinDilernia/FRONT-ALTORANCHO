import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "acdn-us.mitiendanube.com" },
      { protocol: "https", hostname: "d1a9qnv764bsoo.cloudfront.net" },
    ],
  },
};

export default nextConfig;
