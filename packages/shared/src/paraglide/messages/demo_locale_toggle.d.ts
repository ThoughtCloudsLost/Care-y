/**
* | output |
* | --- |
* | "Switch language" |
*
* @param {Demo_Locale_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_locale_toggle: ((inputs?: Demo_Locale_ToggleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Locale_ToggleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Locale_ToggleInputs = {};
