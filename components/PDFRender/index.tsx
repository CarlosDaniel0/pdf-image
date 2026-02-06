"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";
import PDFFragment from "./fragment";
import { PDFPageProxy } from "pdfjs-dist/types/web/interfaces";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { PDFPage, PDFViewerProps } from "./types";
import { Download, Share2 } from "lucide-react";
import { dataURLtoFile, fileToArrayBuffer } from "@/utils/functions";

const salt = (Math.random() * 10000).toString(16);
export default function PDFRender({ url, file }: PDFViewerProps) {
  const mutex = useRef(0);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [image, setImage] = useState("");
  const [controller, setController] = useState({
    page: 0,
    pages: -1,
    images: [] as string[],
  });
  const name = useMemo(
    () => getName(url ?? file?.name ?? "doc-sem-titulo"),
    [url, file],
  );

  function getName(path: string) {
    return (
      path
        .split("/")
        .pop()
        ?.replace(/\.(\w+)$/, "") ?? "archive"
    );
  }

  const loadPDF = async (props: { url?: string; file?: File }) => {
    const { url, file } = props;
    const blob = file ? await fileToArrayBuffer(file!) : undefined;
    const loadingTask = pdfjs.getDocument({ url: url, data: blob });
    const pdf = await loadingTask.promise;
    setController({ page: 1, pages: pdf.numPages, images: [] });
    setPdf(pdf);
  };

  const loadPages = async (pdf: PDFDocumentProxy, pg: number) => {
    const page = await pdf.getPage(pg);
    setPage(page);
  };

  const handleShow = (pages: PDFPage[]) => {
    let y = 0;
    const page = document.createElement("canvas");
    page.style.opacity = "0px";
    page.style.width = "0px";
    page.style.height = "0px";
    page.style.zIndex = "-1";
    const pdfWidth = pages[0].canvas.width;
    const pdfHeight = pages.reduce((tot, p) => tot + p.canvas.height, 0);
    page.width = pdfWidth;
    page.height = pdfHeight;
    document.body.appendChild(page);
    if (!page) return;
    const ctx = page.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    for (let page of pages) {
      ctx.drawImage(page.canvas, 0, y);
      y += page.canvas.height;
    }
    ctx.scale(dpr, dpr);
    setImage(page.toDataURL("image/png"));
    page.remove();
  };

  useEffect(() => {
    if (mutex.current) return;
    mutex.current = 1;
    loadPDF({ url, file }).finally(() => (mutex.current = 0));
  }, [url]);

  const save = () => {
    const a = document.createElement("a");
    a.download = name + ".png";
    a.href = image;
    a.click();
    a.remove();
  };

  const share = async () => {
    try {
      if (!image) return;
      const file = await dataURLtoFile(image, name + ".png");
      await navigator.share({
        files: [file],
        text: "",
        title: `Arquivo ${name}`,
      });
    } catch (err) {
      console.log(err instanceof Error ? err.message : "");
    }
  };

  const handleLoadPage = (page: PDFPage) => {
    setPages((prev) =>
      [...prev, page].sort((a, b) => a._pageIndex - b._pageIndex),
    );
  };

  useEffect(() => {
    if (pages.length !== pdf?.numPages) return;
    handleShow(pages);
  }, [pages, pdf?.numPages]);

  useEffect(() => {
    if (mutex.current) return;
    mutex.current = 1;
    if (!pdf) return;
    loadPages(pdf, controller.page).finally(() => (mutex.current = 0));
  }, [page, controller.page]);

  return (
    <div>
      <div className="absolute overflow-hidden w-0 h-0">
        <div className="z-[-1] opacity-0">
          {pdf &&
            Array.from({ length: pdf.numPages }, (_, i) => (
              <PDFFragment
                key={`PR${i}${salt}`}
                pdf={pdf!}
                onFinally={handleLoadPage}
                page={i + 1}
              />
            ))}
        </div>
      </div>
      {image && (
        <>
          <img className="m-auto" alt={name} src={image} />

          <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4">
            {!!navigator?.share && (
              <button
                onClick={share}
                className="text-xl rounded-xl px-4 py-3 bg-green-700 flex items-center gap-1"
              >
                <Share2 />
                <span>Compartilhar</span>
              </button>
            )}
            <button
              onClick={save}
              className="text-xl rounded-xl px-4 py-3 bg-blue-800 flex items-center gap-1"
            >
              <Download />
              <span>Salvar</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
