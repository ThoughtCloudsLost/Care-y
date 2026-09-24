/**
* | output |
* | --- |
* | "Searched all {total} {tickets} unlocked on this device." |
*
* @param {Search_Coverage_Tickets_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_coverage_tickets_all: ((inputs: Search_Coverage_Tickets_AllInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Coverage_Tickets_AllInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Coverage_Tickets_AllInputs = {
    total: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
