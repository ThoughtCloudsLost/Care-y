import { createContext } from "svelte";
import type { TerminologyLabels } from "@care-y/shared";

const [getTerminology, setTerminology] =
  createContext<() => TerminologyLabels>();

export { getTerminology, setTerminology };
