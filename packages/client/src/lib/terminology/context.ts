import { createContext } from "svelte";
import type { TerminologyLabels } from "@care-y/shared";

const [_getCtx, _setCtx] = createContext<() => TerminologyLabels>();

let _cached: (() => TerminologyLabels) | undefined;

export function getTerminology(): () => TerminologyLabels {
  _cached ??= _getCtx();
  return _cached;
}

export function setTerminology(value: () => TerminologyLabels): void {
  _cached = value;
  _setCtx(value);
}
