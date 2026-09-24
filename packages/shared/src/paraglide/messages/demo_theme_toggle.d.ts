/**
* | output |
* | --- |
* | "Toggle dark/light mode" |
*
* @param {Demo_Theme_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_theme_toggle: ((inputs?: Demo_Theme_ToggleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Theme_ToggleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Theme_ToggleInputs = {};
