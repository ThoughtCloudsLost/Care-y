/**
* | output |
* | --- |
* | "Oldest first" |
*
* @param {Tickets_Sort_OldestInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_oldest: ((inputs?: Tickets_Sort_OldestInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_OldestInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_OldestInputs = {};
