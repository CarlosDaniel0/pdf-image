"use client";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

const PDFRender = dynamic(() => import("../../../components/PDFRender"), {
  ssr: false,
  loading: () => (<Loading />),
});

export default function Conversor() {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    window.addEventListener("load", async () => {
      const keys = await caches.keys();
      const mediaCache = await caches.open(
        keys.filter((key) => key.startsWith("media"))[0],
      );
      const pdf = await mediaCache.match("pdf");
      if (pdf) {
        const blob = await pdf.blob();
        await mediaCache.delete("pdf");
        const url = new URL(window.location.href);
        const filename = url.searchParams.get("n") ?? "arquivo.pdf";
        const file = new File([blob], filename, { type: blob.type });
        setFile(file);
      } else {
        window.location.href = "/";
      }
    });
  }, []);

  return (
    <main>
      {!!file && (
        <Suspense fallback={<p>Loading PDF...</p>}>
          <PDFRender file={file} />
        </Suspense>
      )}
    </main>
  );
}
