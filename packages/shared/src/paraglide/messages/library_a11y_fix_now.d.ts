/**
* | output |
* | --- |
* | "Fix now" |
*
* @param {Library_A11y_Fix_NowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_fix_now: ((inputs?: Library_A11y_Fix_NowInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_A11y_Fix_NowInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_A11y_Fix_NowInputs = {};
