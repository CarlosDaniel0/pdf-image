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

export function getPixel(
  pixels: number[],
  width: number,
  height: number,
) {
  const pixel: ImagePixel = {
    width,
    height,
    x: -1,
    y: -1,
  }
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
        pixel.x = x;
        pixel.y = y;
        break;
      }
    }
    if (pixel.x !== -1 || pixel.y !== -1) break;
  }
  return pixel
}

export async function getSignificativePixel(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return [];
  const { data, width, height } = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );
  const imgs: ImagePixel[] = [
    getPixel([...data], width, height),
    getPixel([...data].reverse(), width, height)
  ]
  return imgs;
}

export function cropImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  offset: [number, number]
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
  const [x, y] = offset
  ctx?.drawImage(image, x, y, width, height, 0, 0, width, height);
  setTimeout(() => canvas.remove(), 300);
  return canvas.toDataURL("image/png");
}

export async function generatePDF<
  T extends "blob" | "download" | "file",
>(props: {
  name: string;
  img: string;
  width: number;
  height: number;
  type: T;
}): Promise<PDFGenerated<T>> {
  const { name, img, width, height, type } = props;
  const scale = 3.7
  const ratio = height / width;
  const [docWidth, docHeight] = [210*scale, 297*scale]
  const [imgWidth, imgHeight] = [docHeight / ratio, docHeight - 2]
  const doc = new jsPDF("p", "mm", [docWidth, docHeight]);
  const px = (docWidth - imgWidth) / 2;
  const py = 1;
  doc.addImage(img, "PNG", px, py, imgWidth, imgHeight);
  switch (type) {
    case "download":
      return doc.save(name) as PDFGenerated<T>;
    case "blob":
    case "file":
      const blob = doc.output("blob");
      if (type === "blob") return blob as PDFGenerated<T>;
      return new File([blob], name, { type: blob.type }) as PDFGenerated<T>;
  }
}
