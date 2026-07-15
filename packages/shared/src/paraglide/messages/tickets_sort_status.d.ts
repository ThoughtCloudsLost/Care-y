/**
* | output |
* | --- |
* | "Status" |
*
* @param {Tickets_Sort_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_status: ((inputs?: Tickets_Sort_StatusInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_StatusInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_StatusInputs = {};
