/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Suspense, useEffect, useState } from "react";
import ButtonFile from "../components/ButtonFile";
import dynamic from "next/dynamic";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import SnackBar from "@/components/SnackBar";
import { useRouter } from "next/navigation";

const PDFRender = dynamic(() => import("../components/PDFRender"), {
  ssr: false,
  loading: () => <Loading />,
});

const channel = new BroadcastChannel("share");
export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [controller, setController] = useState({ error: "", show: false });
  const getShareFile = () => {
    channel.addEventListener("message", async (evt) => {
      const { data } = evt;
      const pdf: File = data;
      if (pdf) {
        if (!pdf.size) return;
        setFile(pdf);
      }
    });

    setTimeout(() => channel.postMessage("pdf"), 100);
  };

  useEffect(() => {
    router.replace('/');
    getShareFile();
  }, []);

  const handleChange = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    router.push('/?pdf=true')
  };

  const handleError = (err: Error) => {
    setFile(null);
    setController({ show: true, error: err?.message })
  };

  const handlePopstate = () => {
    setFile(null)
    setController({ error: "", show: false })
  }

  useEffect(() => {
    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [])

  return (
    <main
      className={
        file ? undefined : "w-screen h-dvh flex justify-center items-center"
      }
    >
      {file ? (
        <Suspense fallback={<p>Loading PDF...</p>}>
          <PDFRender file={file} onError={handleError} />
        </Suspense>
      ) : (
        <>
          <div
            style={{ background: "#454545" }}
            className="flex flex-col text-center max-w-125 mx-3 py-8 px-5 rounded-xl gap-4 shadow-xl/20"
          >
            <h1 className="text-4xl">Imagem do PDF</h1>
            <p>Converta PDF em uma imagem PNG</p>
            <ButtonFile accept="application/pdf" onChange={handleChange} />
          </div>
          <Footer />
          <SnackBar type="error" show={controller.show} setShow={(show) => setController(prev => ({ ...prev, show }) as never)} message={controller.error} />
        </>
      )}
    </main>
  );
}
