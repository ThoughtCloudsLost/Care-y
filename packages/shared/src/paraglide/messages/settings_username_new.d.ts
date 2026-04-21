/**
* | output |
* | --- |
* | "New username" |
*
* @param {Settings_Username_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_username_new: ((inputs?: Settings_Username_NewInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Username_NewInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Username_NewInputs = {};
