/**
* | output |
* | --- |
* | "Current password is incorrect" |
*
* @param {Settings_Password_WrongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_wrong: ((inputs?: Settings_Password_WrongInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_WrongInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_WrongInputs = {};
