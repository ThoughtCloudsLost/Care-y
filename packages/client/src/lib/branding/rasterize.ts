/**
 * Image rasterization utilities for branding logo processing.
 *
 * Converts uploaded images (PNG, JPEG, SVG) into normalized PNGs via
 * OffscreenCanvas. Used by both onboarding and admin branding flows.
 */

import { BrandingError } from "$lib/errors.js";

export async function rasterizeSvg(
  svgBuffer: ArrayBuffer,
): Promise<ArrayBuffer> {
  const svgBlob = new Blob([svgBuffer], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await createImageBitmap(svgBlob);
    return await renderToCanvas(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function rasterizeImage(
  buffer: ArrayBuffer,
  type: string,
): Promise<ArrayBuffer> {
  const blob = new Blob([buffer], { type });
  const img = await createImageBitmap(blob);
  return renderToCanvas(img);
}

export async function renderToCanvas(img: ImageBitmap): Promise<ArrayBuffer> {
  const maxDim = Math.max(img.width, img.height, 512);
  const scale = Math.min(1, 512 / maxDim);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new BrandingError("Failed to get 2d context from OffscreenCanvas");
  }
  ctx.drawImage(img, 0, 0, w, h);
  img.close();
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return await blob.arrayBuffer();
}
