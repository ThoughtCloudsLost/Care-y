/**
* | output |
* | --- |
* | "Generating new keys" |
*
* @param {Settings_Password_Step_DeriveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_derive: ((inputs?: Settings_Password_Step_DeriveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Step_DeriveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Step_DeriveInputs = {};
