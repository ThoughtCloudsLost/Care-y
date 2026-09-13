/**
 * Module-level dedupe set for intake wrap conversions.
 *
 * Tracks which ticketIds have an in-flight conversion so concurrent
 * detail opens (split view, rapid navigation) do not fire duplicate
 * conversion mutations. Non-reactive by design: the conversion is
 * invisible (no UI reads this set).
 */
export const intakeConversionInFlight = new Set<string>();
