/**
* | output |
* | --- |
* | "Show accessibility issues" |
*
* @param {Library_A11y_Toggle_OnInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_toggle_on: ((inputs?: Library_A11y_Toggle_OnInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_A11y_Toggle_OnInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_A11y_Toggle_OnInputs = {};
