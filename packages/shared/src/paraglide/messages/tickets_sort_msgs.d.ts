/**
* | output |
* | --- |
* | "Message count" |
*
* @param {Tickets_Sort_MsgsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_msgs: ((inputs?: Tickets_Sort_MsgsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_MsgsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_MsgsInputs = {};
