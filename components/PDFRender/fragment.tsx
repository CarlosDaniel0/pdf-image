"use client";
import { useEffect, useRef } from "react";
import "pdfjs-dist/build/pdf.worker.min.mjs";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { PDFPageProxy } from "pdfjs-dist";
import { PDFPage } from "./types";

interface PDFViewerProps {
  pdf: PDFDocumentProxy;
  page: number;
  onFinally?: (page: PDFPage) => void
}

export default function PDFFragment({ page, pdf, onFinally }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mutex = useRef(0);

  const loadPage = async (pdf: PDFDocumentProxy, pg: number) => {
    const page = await pdf.getPage(pg)
    const viewport = page.getViewport({ scale: 1 });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    page.render({
      canvas: canvas,
      canvasContext: context,
      viewport: viewport,
    })
    .promise
    .finally(() => {
      mutex.current = 0;
      const pg = { ...page, canvas } as PDFPage
      onFinally?.(pg)
    });
  };

  useEffect(() => {
    if (mutex.current) return;
    mutex.current = 1;
    loadPage(pdf, page).finally(() => (mutex.current = 0));
  }, [pdf, page]);

  return <canvas ref={canvasRef} />;
}
