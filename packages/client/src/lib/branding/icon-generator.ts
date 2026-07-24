/**
 * Client-side PWA icon generation from uploaded logo.
 *
 * Resizes the source image to three variants via OffscreenCanvas:
 *   - 192x192 (purpose: "any")
 *   - 512x512 (purpose: "any")
 *   - 512x512 (purpose: "maskable", with 10% inset safe zone)
 *
 * ADR-024: icons are encrypted client-side before upload.
 * This module produces plaintext PNGs; caller handles encryption.
 */

import { BrandingError } from "$lib/errors.js";

export interface IconVariant {
  readonly size: number;
  readonly purpose: "any" | "maskable";
  readonly blob: Blob;
}

const VARIANTS: readonly { size: number; purpose: "any" | "maskable" }[] = [
  { size: 192, purpose: "any" },
  { size: 512, purpose: "any" },
  { size: 512, purpose: "maskable" },
];

export async function generateIconVariants(
  sourceImage: Blob,
): Promise<readonly IconVariant[]> {
  const img = await createImageBitmap(sourceImage);

  try {
    const results: IconVariant[] = [];

    for (const { size, purpose } of VARIANTS) {
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext("2d");
      if (ctx === null) {
        throw new BrandingError(
          "Failed to get 2d context from OffscreenCanvas",
        );
      }

      if (purpose === "maskable") {
        // Maskable icons: 80% safe zone per W3C spec.
        // Fill white background, draw image inset by 10% on each side.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        const inset = size * 0.1;
        const drawSize = size * 0.8;
        ctx.drawImage(img, inset, inset, drawSize, drawSize);
      } else {
        ctx.drawImage(img, 0, 0, size, size);
      }

      const blob = await canvas.convertToBlob({ type: "image/png" });
      results.push({ size, purpose, blob });
    }

    return results;
  } finally {
    img.close();
  }
}
