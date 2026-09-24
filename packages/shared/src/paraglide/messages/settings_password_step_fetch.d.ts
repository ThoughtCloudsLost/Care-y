/**
* | output |
* | --- |
* | "Loading encryption data" |
*
* @param {Settings_Password_Step_FetchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_fetch: ((inputs?: Settings_Password_Step_FetchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Step_FetchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Step_FetchInputs = {};
