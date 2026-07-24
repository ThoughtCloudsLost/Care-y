/**
* | output |
* | --- |
* | "Searched {searched} of {total} {tickets} already unlocked on this device." |
*
* @param {Search_Coverage_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_tickets: ((inputs: Search_Coverage_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Coverage_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Coverage_TicketsInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
