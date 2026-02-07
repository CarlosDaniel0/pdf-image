/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  ExpirationPlugin,
  NetworkFirst,
  RegExpRoute,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

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
    {
      matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "media",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.registerRoute(
  new RegExpRoute(/^\/share\/.*/, new NetworkFirst(), "POST"),
);

serwist.setDefaultHandler(async ({ request, url }) => {
  try {
    if (url.pathname === "/share" && request.method === "POST") {
      const formData = await request.formData();
      const pdf = formData.get("pdf");
      const mediaCache = await caches.open("media");
      await mediaCache.put("pdf", new Response(pdf));
      const params = new URLSearchParams({
        n: pdf instanceof File ? pdf.name : `arquivo.pdf`,
        shared: "true",
      });

      return Response.redirect(`/?${params}`, 303);
    }
  } catch (e) {}
  return fetch(request);
}, "POST");

serwist.addEventListeners();
