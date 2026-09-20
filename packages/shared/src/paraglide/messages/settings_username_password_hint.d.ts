/**
* | output |
* | --- |
* | "Required to confirm identity" |
*
* @param {Settings_Username_Password_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_username_password_hint: ((inputs?: Settings_Username_Password_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Username_Password_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Username_Password_HintInputs = {};
