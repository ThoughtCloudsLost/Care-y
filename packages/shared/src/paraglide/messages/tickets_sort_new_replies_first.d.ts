/**
* | output |
* | --- |
* | "New replies first" |
*
* @param {Tickets_Sort_New_Replies_FirstInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_new_replies_first: ((inputs?: Tickets_Sort_New_Replies_FirstInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_New_Replies_FirstInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_New_Replies_FirstInputs = {};
