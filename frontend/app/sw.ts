/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, ExpirationPlugin } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // Cache Dashboard page
    {
      matcher: /\/dashboard$/,
      handler: new NetworkFirst({
        cacheName: "pages-dashboard",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          }),
        ],
        networkTimeoutSeconds: 5,
      }),
    },
    // Cache Report Detail pages
    {
      matcher: /\/reports\/\d+$/,
      handler: new NetworkFirst({
        cacheName: "pages-reports",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          }),
        ],
        networkTimeoutSeconds: 5,
      }),
    },
    // Cache API - Report List
    {
      matcher: /\/report\/list/,
      handler: new NetworkFirst({
        cacheName: "api-reports-list",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          }),
        ],
        networkTimeoutSeconds: 5,
      }),
    },
    // Cache API - Report Details
    {
      matcher: /\/report\/\d+$/,
      handler: new NetworkFirst({
        cacheName: "api-report-details",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          }),
        ],
        networkTimeoutSeconds: 5,
      }),
    },
    // Cache Supabase assets (images)
    {
      matcher: /supabase\.co/,
      handler: new CacheFirst({
        cacheName: "supabase-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
