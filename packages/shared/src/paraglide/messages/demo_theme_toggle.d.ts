/**
* | output |
* | --- |
* | "Toggle dark mode" |
*
* @param {Demo_Theme_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_theme_toggle: ((inputs?: Demo_Theme_ToggleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Theme_ToggleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Theme_ToggleInputs = {};
