/**
* | output |
* | --- |
* | "Search operates entirely in the browser. Your device decrypts ticket content locally and matches your query against the plaintext. No search terms leave the ..." |
*
* @param {Demo_Section_Search_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_search_desc: ((inputs?: Demo_Section_Search_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Search_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Search_DescInputs = {};
