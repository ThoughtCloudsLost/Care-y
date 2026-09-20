/**
* | output |
* | --- |
* | "Refreshing session" |
*
* @param {Settings_Password_Step_RefreshInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_refresh: ((inputs?: Settings_Password_Step_RefreshInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Step_RefreshInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Step_RefreshInputs = {};
