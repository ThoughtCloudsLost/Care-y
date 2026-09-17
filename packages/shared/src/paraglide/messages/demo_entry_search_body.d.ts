/**
* | output |
* | --- |
* | "The magnifying glass in the top bar searches across all handbook sections. Click a result to jump to that part of the handbook." |
*
* @param {Demo_Entry_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_search_body: ((inputs?: Demo_Entry_Search_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Search_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Search_BodyInputs = {};
