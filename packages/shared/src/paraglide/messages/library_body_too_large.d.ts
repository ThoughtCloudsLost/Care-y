/**
* | output |
* | --- |
* | "Article body is too large. Remove some content or images." |
*
* @param {Library_Body_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_body_too_large: ((inputs?: Library_Body_Too_LargeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Body_Too_LargeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Body_Too_LargeInputs = {};
