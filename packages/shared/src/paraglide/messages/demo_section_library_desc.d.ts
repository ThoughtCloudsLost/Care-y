/**
* | output |
* | --- |
* | "A shared knowledge base for the organization. Article titles and bodies are encrypted with the organization key before storage." |
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
