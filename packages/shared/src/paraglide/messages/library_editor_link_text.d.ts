/**
* | output |
* | --- |
* | "Link text" |
*
* @param {Library_Editor_Link_TextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_text: ((inputs?: Library_Editor_Link_TextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Link_TextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Link_TextInputs = {};
