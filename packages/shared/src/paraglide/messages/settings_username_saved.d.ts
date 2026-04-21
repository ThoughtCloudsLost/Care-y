/**
* | output |
* | --- |
* | "Username updated" |
*
* @param {Settings_Username_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_username_saved: ((inputs?: Settings_Username_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Username_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Username_SavedInputs = {};
