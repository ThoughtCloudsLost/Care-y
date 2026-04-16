/**
* | output |
* | --- |
* | "Article body is too large. Remove some content or images." |
*
* @param {Library_Body_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_body_too_large: ((inputs?: Library_Body_Too_LargeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Body_Too_LargeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Body_Too_LargeInputs = {};
