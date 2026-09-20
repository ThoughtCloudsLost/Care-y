/**
* | output |
* | --- |
* | "Was this helpful?" |
*
* @param {Library_Was_HelpfulInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_was_helpful: ((inputs?: Library_Was_HelpfulInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Was_HelpfulInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Was_HelpfulInputs = {};
