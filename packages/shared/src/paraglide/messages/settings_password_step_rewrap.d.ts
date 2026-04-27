/**
* | output |
* | --- |
* | "Re-encrypting ticket keys" |
*
* @param {Settings_Password_Step_RewrapInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_rewrap: ((inputs?: Settings_Password_Step_RewrapInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Step_RewrapInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Step_RewrapInputs = {};
