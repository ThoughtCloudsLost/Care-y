/**
* | output |
* | --- |
* | "Preview" |
*
* @param {Library_PreviewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_preview: ((inputs?: Library_PreviewInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_PreviewInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_PreviewInputs = {};
