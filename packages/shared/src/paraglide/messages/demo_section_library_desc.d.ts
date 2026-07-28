/**
* | output |
* | --- |
* | "The library is a shared knowledge base for the organization. Browse articles, read detailed entries with attachments and votes, and write new content in the ..." |
*
* @param {Demo_Section_Library_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_library_desc: ((inputs?: Demo_Section_Library_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Library_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Library_DescInputs = {};
