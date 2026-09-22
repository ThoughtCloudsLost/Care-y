/**
* | output |
* | --- |
* | "Save" |
*
* @param {Settings_Persist_Language_AcceptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_persist_language_accept: ((inputs?: Settings_Persist_Language_AcceptInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Persist_Language_AcceptInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Persist_Language_AcceptInputs = {};
