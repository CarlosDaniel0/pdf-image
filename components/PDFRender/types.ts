import { PDFPageProxy } from "pdfjs-dist";

export interface PDFPage extends PDFPageProxy {
  canvas: HTMLCanvasElement
}

export interface PDFViewerProps {
  url?: string;
  file?: File;
  onError: (err: Error) => void
}
