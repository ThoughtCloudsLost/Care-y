/**
* | output |
* | --- |
* | "Not set" |
*
* @param {Settings_Preferred_Language_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_preferred_language_none: ((inputs?: Settings_Preferred_Language_NoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Preferred_Language_NoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Preferred_Language_NoneInputs = {};
