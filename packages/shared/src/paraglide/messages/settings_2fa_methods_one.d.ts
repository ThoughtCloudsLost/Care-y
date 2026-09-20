/**
* | output |
* | --- |
* | "1 method enrolled" |
*
* @param {Settings_2fa_Methods_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_2fa_methods_one: ((inputs?: Settings_2fa_Methods_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_2fa_Methods_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_2fa_Methods_OneInputs = {};
