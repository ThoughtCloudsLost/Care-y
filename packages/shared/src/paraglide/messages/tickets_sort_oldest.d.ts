/**
* | output |
* | --- |
* | "Oldest first" |
*
* @param {Tickets_Sort_OldestInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_oldest: ((inputs?: Tickets_Sort_OldestInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_OldestInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_OldestInputs = {};
