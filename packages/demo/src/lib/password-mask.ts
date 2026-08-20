/**
 * Save-password prompt suppression for demo credential fields.
 *
 * Chrome provisionally saves a credential while the value is being
 * typed or at submission start, so clearing the field before submit
 * does not reliably stop the save-password bubble (see the Chromium
 * discussion "Disable save password popup after user logged In").
 * The only dependable demo-side approach is to never present a
 * type="password" control at all: the field renders as type="text"
 * with -webkit-text-security masking the glyphs.
 *
 * The product's PasswordInput drives its show/hide toggle by writing
 * the type attribute, so this helper shadows the element's own
 * setAttribute: writes of type="password" become masked text, writes
 * of type="text" (the visitor pressed Show) drop the masking. Product
 * source is untouched; the demo document rewrites itself, same
 * judgment as the login prefill driver.
 */

/**
 * Convert a password control to a masked text control and keep it in
 * sync with the product's show/hide toggle. Idempotent per element.
 */
export function maskPasswordControl(input: HTMLInputElement): void {
  if (input.dataset.demoMasked === "1") return;
  input.dataset.demoMasked = "1";

  const nativeSetAttribute = input.setAttribute.bind(input);

  function apply(masked: boolean): void {
    nativeSetAttribute("type", "text");
    if (masked) {
      input.style.setProperty("-webkit-text-security", "disc");
    } else {
      input.style.removeProperty("-webkit-text-security");
    }
  }

  input.setAttribute = (name: string, value: string): void => {
    if (name === "type") {
      apply(value === "password");
      return;
    }
    nativeSetAttribute(name, value);
  };

  apply(input.getAttribute("type") !== "text");
}

/**
 * Mask every password control under `root` that is not yet masked.
 * Returns how many controls were newly masked.
 */
export function maskPasswordControls(root: ParentNode): number {
  let masked = 0;
  const inputs = root.querySelectorAll<HTMLInputElement>(
    'input[type="password"]',
  );
  for (const input of inputs) {
    if (input.dataset.demoMasked !== "1") {
      maskPasswordControl(input);
      masked += 1;
    }
  }
  return masked;
}
