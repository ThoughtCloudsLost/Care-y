/**
* | output |
* | --- |
* | "Show accessibility issues" |
*
* @param {Library_A11y_Toggle_OnInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_a11y_toggle_on: ((inputs?: Library_A11y_Toggle_OnInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_A11y_Toggle_OnInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_A11y_Toggle_OnInputs = {};
