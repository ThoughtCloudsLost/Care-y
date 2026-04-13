/**
* | output |
* | --- |
* | "Newest first" |
*
* @param {Tickets_Sort_NewestInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_newest: ((inputs?: Tickets_Sort_NewestInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_NewestInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_NewestInputs = {};
