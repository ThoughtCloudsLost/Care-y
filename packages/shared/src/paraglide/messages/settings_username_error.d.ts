/**
* | output |
* | --- |
* | "Could not update username" |
*
* @param {Settings_Username_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_username_error: ((inputs?: Settings_Username_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Username_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Username_ErrorInputs = {};
