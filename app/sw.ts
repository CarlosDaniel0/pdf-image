/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

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

self.addEventListener("fetch", (evt) => {
  if (evt.request.url.endsWith("/share") && evt.request.method === "POST") {
    return evt.respondWith(
      (async () => {
        try {
          const formData = await evt.request.formData();
          const pdf = formData.get("pdf");
          const keys = await caches.keys();
          const mediaCache = await caches.open(
            keys.filter((key) => key.startsWith("media"))[0],
          );
          await mediaCache.put("pdf", new Response(pdf));
          const params = new URLSearchParams({
            shared: "true",
            n: pdf instanceof File ? pdf.name : `arquivo.pdf`,
          });
          return Response.redirect(`./conversor/png${params}`, 303);
        } catch {
          return Response.redirect("/", 303);
        }
      })(),
    );
  }
});

serwist.addEventListeners();
