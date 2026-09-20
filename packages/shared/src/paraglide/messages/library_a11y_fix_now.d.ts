/**
* | output |
* | --- |
* | "Fix now" |
*
* @param {Library_A11y_Fix_NowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_a11y_fix_now: ((inputs?: Library_A11y_Fix_NowInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_A11y_Fix_NowInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_A11y_Fix_NowInputs = {};
