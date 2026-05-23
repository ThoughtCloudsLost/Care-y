/**
 * Wizard state persistence via Storage (sessionStorage in production).
 * Pure functions: inject Storage for testability.
 */

export interface SavedWizardState {
  readonly step: number;
  readonly completed: readonly number[];
}

export interface ResolvedRecovery {
  readonly step: number;
  readonly completed: ReadonlySet<number>;
}

export function loadSavedState(
  storage: Storage,
  storageKey: string,
  maxSteps: number,
): SavedWizardState | null {
  try {
    const raw = storage.getItem(storageKey);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("step" in parsed) ||
      !("completed" in parsed)
    ) {
      return null;
    }
    const obj = parsed as Record<string, unknown>;
    if (
      typeof obj.step === "number" &&
      Array.isArray(obj.completed) &&
      obj.completed.every((v): v is number => typeof v === "number")
    ) {
      if (obj.step >= maxSteps) {
        storage.removeItem(storageKey);
        return null;
      }
      return { step: obj.step, completed: obj.completed };
    }
  } catch (err) {
    console.warn("Failed to parse saved wizard state", err);
  }
  return null;
}

export function saveState(
  storage: Storage,
  storageKey: string,
  step: number,
  completed: ReadonlySet<number>,
): void {
  try {
    storage.setItem(
      storageKey,
      JSON.stringify({ step, completed: [...completed] }),
    );
  } catch (err) {
    console.warn("Failed to save wizard state", err);
  }
}

export function clearState(storage: Storage, storageKey: string): void {
  try {
    storage.removeItem(storageKey);
  } catch (err) {
    console.warn("Failed to clear wizard state", err);
  }
}

export function resolveRecoveryStep(
  storage: Storage,
  storageKey: string,
  maxSteps: number,
  hasSeenBriefing: boolean,
): ResolvedRecovery {
  const saved = loadSavedState(storage, storageKey, maxSteps);
  if (saved !== null && saved.step > 0) {
    return { step: saved.step, completed: new Set(saved.completed) };
  }
  if (hasSeenBriefing) {
    return { step: 2, completed: new Set([0, 1]) };
  }
  return { step: 1, completed: new Set([0]) };
}
