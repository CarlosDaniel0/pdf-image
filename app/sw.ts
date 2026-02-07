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

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result + "");
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

let pdf: File | null = null
serwist.setDefaultHandler(async ({ request, url }) => {
  try {
    if (url.pathname === "/share" && request.method === "POST") {
      const formData = await request.formData();
      pdf = formData.get("pdf") as File;
      const params = new URLSearchParams({ pdf: pdf.name })
      return Response.redirect(`/${params}`, 303);
    }
    if (url.pathname === '/pdf' && request.method === 'POST') {
      console.log(request)
      console.log(pdf)
      setTimeout(() => pdf = null, 2 * 60 * 1000)
      return new Response(pdf);
    }
  } catch (e) {
    console.log(e instanceof Error ? e.message : "");
    return Response.redirect(`/`, 303);
  }
  return fetch(request);
}, "POST");

serwist.addEventListeners();
