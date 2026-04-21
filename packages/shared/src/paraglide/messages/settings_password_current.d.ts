/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Settings_Password_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_current: ((inputs?: Settings_Password_CurrentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_CurrentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_CurrentInputs = {};
