/**
 * Crop rect resolution: resolves a subsection's crop rect from either
 * a named DOM element or the authored fallback, then clamps it to
 * the phone rect.
 *
 * At capture time, the phone rect (position and size of the .device
 * element on the outer page) is measured from the DOM. The crop rect
 * lives in phone-viewport space (0,0 is the phone's content origin).
 *
 * @module
 */

/**
 * @typedef {Object} Rect
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 */

/**
 * @typedef {Object} PhoneRect
 * @property {number} x - Left position of the phone viewport on the page.
 * @property {number} y - Top position of the phone viewport on the page.
 * @property {number} w - Phone viewport width (CSS pixels).
 * @property {number} h - Phone viewport height (CSS pixels).
 */

/**
 * Clamp a crop rect so it fits entirely within the phone viewport.
 *
 * @param {Rect} crop - The unclamped crop rect (phone-viewport space).
 * @param {number} phoneW - Phone viewport width.
 * @param {number} phoneH - Phone viewport height.
 * @returns {Rect} Clamped rect.
 */
export function clampCropToPhone(crop, phoneW, phoneH) {
  let { x, y, w, h } = crop;

  // Clamp origin
  if (x < 0) {
    w += x;
    x = 0;
  }
  if (y < 0) {
    h += y;
    y = 0;
  }

  // Clamp extent
  if (x + w > phoneW) {
    w = phoneW - x;
  }
  if (y + h > phoneH) {
    h = phoneH - y;
  }

  // Floor negative dimensions (entirely outside phone)
  w = Math.max(0, w);
  h = Math.max(0, h);

  return { x, y, w, h };
}

/**
 * Resolve a crop rect for a subsection. Uses the element rect if
 * available, otherwise the authored fallback rect from the crop
 * registry entry.
 *
 * Both rects are in phone-viewport space (the phone's content area,
 * not the outer page). The result is clamped to the phone dimensions.
 *
 * @param {Rect | null} elementRect
 *   Bounding box of the named element resolved from the crop registry
 *   selector, in phone-viewport space. Null if no selector was set or
 *   the element was not found.
 * @param {Rect} fallbackRect
 *   Authored fallback rect from the crop registry entry.
 * @param {number} phoneW - Phone viewport width (390 at phone preset).
 * @param {number} phoneH - Phone viewport height (844 at phone preset).
 * @returns {Rect} The resolved, clamped crop rect.
 */
export function resolveCropRect(elementRect, fallbackRect, phoneW, phoneH) {
  const raw = elementRect !== null ? elementRect : fallbackRect;
  return clampCropToPhone(raw, phoneW, phoneH);
}
