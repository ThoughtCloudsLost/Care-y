/**
* | output |
* | --- |
* | "Not now" |
*
* @param {Settings_Persist_Language_DeclineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_persist_language_decline: ((inputs?: Settings_Persist_Language_DeclineInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Persist_Language_DeclineInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Persist_Language_DeclineInputs = {};
