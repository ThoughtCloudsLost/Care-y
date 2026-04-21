/**
* | output |
* | --- |
* | "Finalizing key rotation" |
*
* @param {Settings_Password_Step_RotateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_rotate: ((inputs?: Settings_Password_Step_RotateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Step_RotateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Step_RotateInputs = {};
