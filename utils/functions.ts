import jsPDF from "jspdf";
import { ImagePixel, PDFGenerated } from "./types";

export async function dataURLtoFile(dataURL: string, filename: string) {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

export async function fileToArrayBuffer(file: File) {
  return new Promise<Uint8Array<ArrayBufferLike>>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export async function getSignificativePixel(canvas: HTMLCanvasElement) {
  const img: ImagePixel = {
    width: 0,
    height: 0,
    x: -1,
    y: -1,
  };
  const context = canvas.getContext("2d");
  if (!context) return img;
  const { data, width, height } = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );
  img.height = height;
  img.width = width;
  const pixels = [...data].reverse();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const [r, g, b] = [
        pixels[index],
        pixels[index + 1],
        pixels[index + 2],
        pixels[index + 3],
      ];
      if (r !== 255 || g !== 255 || b !== 255) {
        img.x = x;
        img.y = y;
        break;
      }
    }
    if (img.x !== -1 || img.y !== -1) break;
  }
  return img;
}

export function cropImage(
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = "absolute";
  canvas.style.zIndex = "-1";
  canvas.style.opacity = "0";
  canvas.style.width = "0px";
  canvas.style.height = "0px";
  document.body.append(canvas);
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(image, 0, 0, width, height, 0, 0, width, height);
  setTimeout(() => canvas.remove(), 300);
  return canvas.toDataURL("image/png");
}

export async function generatePDF<T extends "blob" | "download" | "file">(props: {
  name: string;
  img: string;
  width: number;
  height: number;
  type: T;
}): Promise<PDFGenerated<T>> {
  const { name, img, width, height, type } = props;
  const doc = new jsPDF("p", "mm", "a4");
  const [pgWidth, pgHeight] = [
    doc.internal.pageSize.getWidth(),
    doc.internal.pageSize.getHeight(),
  ];
  const imgWidth = width;
  const imgHeight = height;
  const ratio = imgHeight / imgWidth;
  const pdfHeight = pgHeight - 2;
  const pdfWidth = pgHeight / ratio;
  const px = (pgWidth - pdfWidth) / 2;
  const py = 1;
  doc.addImage(img, "PNG", px, py, pdfWidth, pdfHeight);
  switch (type) {
    case 'download': return doc.save(name) as PDFGenerated<T>;
    case 'blob':
    case 'file':
      const blob = doc.output("blob") 
      if (type === 'blob') return blob as PDFGenerated<T>; 
      return new File([blob], name, { type: blob.type }) as PDFGenerated<T>
  }
}
