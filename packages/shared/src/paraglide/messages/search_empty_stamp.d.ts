/**
* | output |
* | --- |
* | "No matches" |
*
* @param {Search_Empty_StampInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_empty_stamp: ((inputs?: Search_Empty_StampInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Empty_StampInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Empty_StampInputs = {};
