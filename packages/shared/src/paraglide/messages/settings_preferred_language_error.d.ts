/**
* | output |
* | --- |
* | "Could not update preferred language" |
*
* @param {Settings_Preferred_Language_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_preferred_language_error: ((inputs?: Settings_Preferred_Language_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Preferred_Language_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Preferred_Language_ErrorInputs = {};
