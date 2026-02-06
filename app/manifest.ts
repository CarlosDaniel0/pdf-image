import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conversor PDF",
    short_name: "Conversor PDF para imagens",
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
    theme_color: "#FFFFFF",
    background_color: "#FFFFFF",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    share_target: {
      action: "/receiver/",
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
