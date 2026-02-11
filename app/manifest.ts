import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Imagem do PDF",
    short_name: "Imagem do PDF",
    icons: [
      {
        src: "/icons/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    theme_color: "#2b2b2b",
    background_color: "#ffffff",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        files: [
          {
            name: "pdf",
            accept: ["application/pdf"],
          },
        ],
      },
    },
  };
}
