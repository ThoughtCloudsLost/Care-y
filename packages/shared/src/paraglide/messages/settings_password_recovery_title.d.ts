/**
* | output |
* | --- |
* | "Complete key rotation" |
*
* @param {Settings_Password_Recovery_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_recovery_title: ((inputs?: Settings_Password_Recovery_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Recovery_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Recovery_TitleInputs = {};
