"use client";
import { Suspense, useEffect, useState } from "react";
import ButtonFile from "../components/ButtonFile";
import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const PDFRender = dynamic(() => import("../components/PDFRender"), {
  ssr: false,
  loading: () => <Loading />,
});

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const getShareFile = async () => {
    console.log("chegou no event listener");
    const keys = await caches.keys();
    const mediaCache = await caches.open(
      keys.filter((key) => key.startsWith("media"))[0],
    );
    console.log(keys)
    console.log(mediaCache)
    const pdf = await mediaCache.match("pdf");
    console.log(pdf);
    if (pdf) {
      const blob = await pdf.blob();
      await mediaCache.delete("pdf");
      const url = new URL(window.location.href);
      const filename = url.searchParams.get("n") ?? "arquivo.pdf";
      const file = new File([blob], filename, { type: blob.type });
      setFile(file);
    }
  };

  useEffect(() => {
    getShareFile();
  }, []);

  const handleChange = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
  };

  return (
    <main
      className={
        file ? undefined : "w-screen h-dvh flex justify-center items-center"
      }
    >
      {file ? (
        <Suspense fallback={<p>Loading PDF...</p>}>
          <PDFRender file={file} />
        </Suspense>
      ) : (
        <div className="bg-gray-700 flex flex-col text-center max-w-125 mx-3 py-8 px-5 rounded-xl gap-4 shadow-xs">
          <h1 className="text-4xl">PDF para PNG</h1>
          <p>Converta PDF em uma imagem PNG</p>
          <ButtonFile onChange={handleChange} />
        </div>
      )}
    </main>
  );
}
