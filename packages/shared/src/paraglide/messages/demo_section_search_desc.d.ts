/**
* | output |
* | --- |
* | "Global search runs a single query against tickets and knowledge base articles from any page. Matching happens in the browser against content the browser has ..." |
*
* @param {Demo_Section_Search_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_search_desc: ((inputs?: Demo_Section_Search_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Search_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Search_DescInputs = {};
