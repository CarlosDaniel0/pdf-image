import jsPDF from "jspdf";

export interface ImagePixel {
  width: number;
  height: number;
  x: number;
  y: number;
}

export type PDFGenerated<T extends "blob" | "download" | "file"> =
  T extends 'download' ? jsPDF : T extends "file" ? File : T extends "blob" ? Blob : void;
