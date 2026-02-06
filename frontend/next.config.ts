import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',              // service worker goes here
  register: true,              
  skipWaiting: true,
  disable: false, // process.env.NODE_ENV === 'development', // disabled in dev
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},               // avoids Turbopack warnings
}

export default pwaConfig(nextConfig)
