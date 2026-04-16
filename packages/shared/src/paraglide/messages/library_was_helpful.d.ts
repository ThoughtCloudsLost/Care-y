/**
* | output |
* | --- |
* | "Was this helpful?" |
*
* @param {Library_Was_HelpfulInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_was_helpful: ((inputs?: Library_Was_HelpfulInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Was_HelpfulInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Was_HelpfulInputs = {};
