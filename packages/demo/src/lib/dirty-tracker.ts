/**
 * Phone-side form dirtiness tracker.
 *
 * Attaches capture-phase listeners to a root element and reports
 * dirtiness changes via a callback. "Dirty" means the user has typed
 * into an input, changed a select, or edited a contenteditable region
 * without subsequently submitting or clicking a recognized save/send
 * control.
 *
 * Submits and recognized save/send clicks clear dirtiness. External
 * callers can also clear it (e.g. on route change). The factory
 * returns a handle with markClean and destroy methods.
 *
 * Pure DOM module, no Svelte runes, unit-testable with jsdom.
 */

// -----------------------------------------------------------------------
// Submit-like selectors
//
// These match the stable classes, testids, and roles of the product's
// primary save/send controls. Each entry names the component or surface
// that owns it so the allowlist stays auditable.
// -----------------------------------------------------------------------

/**
 * CSS selectors that identify a click target as a save/send/submit
 * action. The dirty tracker clears dirtiness when a click lands on
 * (or inside) an element matching any of these.
 *
 * Entries use stable structural selectors rather than translated text
 * so they survive locale changes.
 */
export const SUBMIT_SELECTORS: readonly string[] = [
  // ShellMessagebar send button: Konsta Link[role=button] inside the
  // messagebar's right snippet. The send icon is the only right-slot
  // child. (.shell-messagebar is the product's wrapper class.)
  ".shell-messagebar [role='button']:last-child",

  // SoftButton save/send/submit actions across admin sections, note
  // sheet, email compose sheet, share link sheet, invite user, new
  // ticket, close-resolution, and portal composer. SoftButton renders
  // as button.soft-btn.
  "button.soft-btn",

  // IntakeFormEditor large save button (Konsta Button, not SoftButton).
  // The editor wraps its save in a Konsta <Button large>, which renders
  // with the k-button-large class.
  ".k-button-large",

  // Portal passphrase submit and client intake form submit buttons
  // (standard form submits already covered by the submit event listener,
  // but some use onclick rather than form submission).
  "button[type='submit']",

  // Portal composer send (uses ShellMessagebar, already covered above).
  // Client-side ContactCorrectionSheet submit (SoftButton, covered).
] as const;

// -----------------------------------------------------------------------
// Tracked input elements
// -----------------------------------------------------------------------

/** Tag names whose input/change events mark the form as dirty. */
const TRACKED_TAGS: ReadonlySet<string> = new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT",
]);

/** Whether an element is a tracked input source. */
function isTrackedInput(el: Element): boolean {
  if (TRACKED_TAGS.has(el.tagName)) return true;
  return el.getAttribute("contenteditable") === "true";
}

// -----------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------

export interface DirtyTrackerHandle {
  /** Clear dirtiness externally (e.g. on route change). */
  markClean(reason: string): void;
  /** Remove all listeners. */
  destroy(): void;
}

export interface DirtyTrackerOptions {
  onChange(dirty: boolean): void;
  /** Override the default submit-like predicate for testing. */
  isSubmitLike?(el: Element): boolean;
}

/**
 * Whether `el` (or its closest button/link ancestor inside `root`)
 * matches one of the SUBMIT_SELECTORS.
 */
function defaultIsSubmitLike(el: Element): boolean {
  // Walk up to the nearest interactive ancestor to catch clicks on
  // icons or spans inside a button.
  const interactive = el.closest("button, [role='button'], a") ?? el;
  for (const selector of SUBMIT_SELECTORS) {
    if (interactive.matches(selector)) return true;
  }
  return false;
}

export function createDirtyTracker(
  root: HTMLElement,
  opts: DirtyTrackerOptions,
): DirtyTrackerHandle {
  let dirty = false;
  const isSubmitLike = opts.isSubmitLike ?? defaultIsSubmitLike;

  function setDirty(next: boolean): void {
    if (next === dirty) return;
    dirty = next;
    opts.onChange(dirty);
  }

  function onInputOrChange(e: Event): void {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!isTrackedInput(target)) return;
    setDirty(true);
  }

  function onSubmit(): void {
    setDirty(false);
  }

  function onClick(e: Event): void {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (isSubmitLike(target)) {
      setDirty(false);
    }
  }

  root.addEventListener("input", onInputOrChange, true);
  root.addEventListener("change", onInputOrChange, true);
  root.addEventListener("submit", onSubmit, true);
  root.addEventListener("click", onClick, true);

  function markClean(_reason: string): void {
    setDirty(false);
  }

  function destroy(): void {
    root.removeEventListener("input", onInputOrChange, true);
    root.removeEventListener("change", onInputOrChange, true);
    root.removeEventListener("submit", onSubmit, true);
    root.removeEventListener("click", onClick, true);
  }

  return { markClean, destroy };
}
