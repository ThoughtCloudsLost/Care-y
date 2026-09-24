/**
* | output |
* | --- |
* | "Recent activity" |
*
* @param {Tickets_Sort_ActivityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_activity: ((inputs?: Tickets_Sort_ActivityInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_ActivityInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_ActivityInputs = {};
