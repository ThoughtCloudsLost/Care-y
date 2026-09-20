/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Settings_Username_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_username_password: ((inputs?: Settings_Username_PasswordInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Username_PasswordInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Username_PasswordInputs = {};
