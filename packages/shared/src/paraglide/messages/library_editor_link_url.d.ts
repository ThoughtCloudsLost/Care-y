/**
* | output |
* | --- |
* | "URL" |
*
* @param {Library_Editor_Link_UrlInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_url: ((inputs?: Library_Editor_Link_UrlInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Link_UrlInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Link_UrlInputs = {};
