/**
* | output |
* | --- |
* | "Would you like to save this as your preferred language? The app will use this language at sign in." |
*
* @param {Settings_Persist_Language_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_persist_language_body: ((inputs?: Settings_Persist_Language_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Persist_Language_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Persist_Language_BodyInputs = {};
