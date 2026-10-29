export type PreparedImage = {
  dataUrl: string;
  base64: string;
  mimeType: "image/jpeg";
};

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|bmp|avif)$/i;

export function looksLikeImage(file: File) {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXT.test(file.name);
}

type Decoded = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  cleanup: () => void;
};

async function decodeWithBitmap(file: File): Promise<Decoded> {
  const bitmap = await createImageBitmap(file);
  return {
    width: bitmap.width,
    height: bitmap.height,
    draw: (ctx, width, height) => ctx.drawImage(bitmap, 0, 0, width, height),
    cleanup: () => bitmap.close(),
  };
}

async function decodeWithElement(file: File): Promise<Decoded> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("could not decode"));
      element.src = url;
    });
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (ctx, width, height) => ctx.drawImage(image, 0, 0, width, height),
      cleanup: () => undefined,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function decodeFile(file: File): Promise<Decoded> {
  try {
    return await decodeWithBitmap(file);
  } catch {
    return decodeWithElement(file);
  }
}

export async function fileToJpeg(file: File, max = 1024): Promise<PreparedImage> {
  const decoded = await decodeFile(file);
  try {
    if (!decoded.width || !decoded.height) throw new Error("empty image");
    const scale = Math.min(1, max / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    decoded.draw(ctx, width, height);
    let quality = 0.82;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > 1_400_000 && quality > 0.45) {
      quality = Math.round((quality - 0.1) * 100) / 100;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    const base64 = dataUrl.split(",")[1] ?? "";
    if (!base64) throw new Error("empty jpeg");
    return { dataUrl, base64, mimeType: "image/jpeg" };
  } finally {
    decoded.cleanup();
  }
}
