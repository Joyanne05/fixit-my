import type { NextConfig } from 'next'
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
}

export default withSerwist(nextConfig)
