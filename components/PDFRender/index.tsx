"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";
import PDFFragment from "./fragment";
import { PDFPageProxy } from "pdfjs-dist/types/web/interfaces";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { PDFPage, PDFViewerProps } from "./types";
import { Download, File, FileImage, Share2, X } from "lucide-react";
import {
  cropImage,
  dataURLtoFile,
  generatePDF,
  fileToArrayBuffer,
  getSignificativePixel,
} from "@/utils/functions";
import Modal from "../Modal";
import { css } from "styled-components";

const stylesModal = css`
  @media screen and (min-width: 500px) {
    width: 400px;
  }
`;

const salt = (Math.random() * 10000).toString(16);
export default function PDFRender({ url, file, onError }: PDFViewerProps) {
  const mutex = useRef(0);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const img = useRef<HTMLImageElement>(null);
  const [modal, setModal] = useState({
    show: false,
    type: "" as "share" | "download" | "",
  });
  const [image, setImage] = useState({
    data: "",
    width: 0,
    height: 0,
    offset: [0, 0] as [number, number],
  });
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
    setController({
      page: 1,
      pages: pdf.numPages,
      images: [],
    });
    setPdf(pdf);
  };

  const loadPages = async (pdf: PDFDocumentProxy, pg: number) => {
    const page = await pdf.getPage(pg);
    setPage(page);
  };

  const handleShow = async (pages: PDFPage[]) => {
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
    const [sPixel, ePixel] = await getSignificativePixel(page);
    setImage({
      data: page.toDataURL("image/png"),
      offset: [0, sPixel.y],
      width: page.width,
      height: page.height - sPixel.y - ePixel.y,
    });
    page.remove();
  };

  useEffect(() => {
    if (mutex.current) return;
    mutex.current = 1;
    loadPDF({ url, file })
    .catch(err => onError(err))
    .finally(() => (mutex.current = 0));
  }, [url]);

  const share = async (file: File) => {
    try {
      setModal({ show: false, type: "" });
      await navigator.share({
        files: [file],
        text: "Arquivo de imagem gerado do documento PDF",
        title: `Arquivo ${name}`,
      });
    } catch (err) {
      console.log(err instanceof Error ? err.message : "");
    }
  };

  const sharePDF = async () => {
    const file = await generatePDF({
      name: `${name}_cropped.pdf`,
      img: cropImage(img.current!, image.width, image.height, image.offset),
      width: image.width,
      height: image.height,
      type: "file",
    });
    share(file);
  };

  const sharePNG = async () => {
    if (!image.width) return;
    const file = await dataURLtoFile(image.data, name + ".png");
    share(file);
  };

  const downloadPDF = () => {
    if (!img.current) return;
    generatePDF({
      name: `${name}_cropped.pdf`,
      img: cropImage(img.current!, image.width, image.height, image.offset),
      width: image.width,
      height: image.height,
      type: "download",
    });
    setModal({ show: false, type: "" });
  };

  const downloadPNG = () => {
    const a = document.createElement("a");
    a.download = name + ".png";
    a.href = image.data;
    a.click();
    a.remove();
    setModal({ show: false, type: "" });
  };

  const shareOptions = (type: "share" | "download") => [
    {
      style: {
        background: "#c51d1d",
      } as React.CSSProperties,
      label: (
        <div className="flex justify-center items-center gap-2 px-4 py-2">
          <File /> <span>PDF</span>
        </div>
      ),
      onClick: type === "share" ? sharePDF : downloadPDF,
    },
    {
      style: {
        background: "#147dc7",
      } as React.CSSProperties,
      label: (
        <div className="flex justify-center items-center gap-2 px-4 py-2">
          <FileImage /> <span>Imagem</span>
        </div>
      ),
      onClick: type === "share" ? sharePNG : downloadPNG,
    },
  ];

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
      <Modal
        direction="from-bottom"
        show={modal.show}
        setShow={(show) => setModal((prev) => ({ ...prev, show }))}
        backdrop={{
          onClick: () => setModal((prev) => ({ ...prev, show: false })),
        }}
        container={{
          css: stylesModal,
          onClick: (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
          },
        }}
      >
        <div className="flex flex-col gap-2 relative">
          <button
            onClick={() => setModal({ show: false, type: "" })}
            className="w-6 h-6 absolute right-2"
          >
            <X />
          </button>
          <p className="text-xl">Formato: </p>
          {!!modal.type &&
            shareOptions(modal.type).map((option, i) => (
              <button
                key={`BS${salt}${i}`}
                style={option.style}
                className="rounded-xl text-xl px-4 py-2 shadow-lg active:scale-95"
                onClick={option.onClick}
              >
                {option.label}
              </button>
            ))}
        </div>
      </Modal>
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
      {image.data && (
        <>
          <img ref={img} className="m-auto" alt={name} src={image.data} />
          <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4">
            {!!navigator?.share && (
              <button
                onClick={() => setModal({ show: true, type: "share" })}
                className="text-xl rounded-xl px-4 py-3 bg-green-700 flex items-center gap-1"
              >
                <Share2 />
                <span>Compartilhar</span>
              </button>
            )}
            <button
              onClick={() => setModal({ show: true, type: "download" })}
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
