/**
* | output |
* | --- |
* | "Preferred language" |
*
* @param {Settings_Preferred_LanguageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_preferred_language: ((inputs?: Settings_Preferred_LanguageInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Preferred_LanguageInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Preferred_LanguageInputs = {};
