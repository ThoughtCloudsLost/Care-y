/**
* | output |
* | --- |
* | "1 method enrolled" |
*
* @param {Settings_2fa_Methods_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_2fa_methods_one: ((inputs?: Settings_2fa_Methods_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_2fa_Methods_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_2fa_Methods_OneInputs = {};
