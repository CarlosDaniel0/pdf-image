/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkFirst, RegExpRoute, Serwist } from "serwist";

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
  runtimeCaching: defaultCache,
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
serwist.addEventListeners();

serwist.setCatchHandler(async ({ request }) => {
  console.log("error");
  console.log(request);
  const dest = request.destination;

  if (dest === "document") {
    const match = await serwist.matchPrecache("/offline.html");
    return match || Response.error();
  }

  if (dest === "image") {
    const match = await serwist.matchPrecache("/fallback.png");
    return match || Response.error();
  }

  if (dest === "font") {
    const match = await serwist.matchPrecache("/fonts/fallback.woff2");
    return match || Response.error();
  }

  return Response.error();
});

serwist.setDefaultHandler(async ({ request, url }) => {
  try {
    if (url.pathname === "/share" && request.method === "POST") {
      const formData = await request.formData();
      const pdf = formData.get("pdf");
      const keys = await caches.keys();
      console.log(pdf);
      const mediaCache = await caches.open(
        keys.filter((key) => key.startsWith("media"))[0],
      );
      await mediaCache.put("pdf", new Response(pdf));
      const params = new URLSearchParams({
        n: pdf instanceof File ? pdf.name : `arquivo.pdf`,
        shared: "true",
      });
      return Response.redirect(`/?${params}`, 303);
    }
  } catch (e) { 
    console.log(e instanceof Error ? e.message : '')
   }
  return fetch(request);
}, "POST");
