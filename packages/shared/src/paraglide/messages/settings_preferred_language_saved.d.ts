/**
* | output |
* | --- |
* | "Preferred language updated" |
*
* @param {Settings_Preferred_Language_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_preferred_language_saved: ((inputs?: Settings_Preferred_Language_SavedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Preferred_Language_SavedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Preferred_Language_SavedInputs = {};
