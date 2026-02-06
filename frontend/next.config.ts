import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',              // service worker goes here
  register: true,              
  skipWaiting: true,
  disable: false, // process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/dashboard$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-dashboard',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/reports\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-reports',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/report\/list.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'api-reports-list',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/report\/\d+$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-report-details',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/supabase\.co.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        },
      },
    },
  ],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},               // avoids Turbopack warnings
}

export default pwaConfig(nextConfig)
