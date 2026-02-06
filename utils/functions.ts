export async function dataURLtoFile(dataURL: string, filename: string) {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

export async function fileToArrayBuffer(file: File) {
  return new Promise<Uint8Array<ArrayBufferLike>>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => 
      reject(reader.error)
    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}
