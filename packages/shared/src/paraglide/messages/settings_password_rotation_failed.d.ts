/**
* | output |
* | --- |
* | "Password changed, but key rotation failed. Tap retry to complete." |
*
* @param {Settings_Password_Rotation_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_rotation_failed: ((inputs?: Settings_Password_Rotation_FailedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Rotation_FailedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Rotation_FailedInputs = {};
