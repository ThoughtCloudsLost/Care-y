/**
* | output |
* | --- |
* | "Not enabled" |
*
* @param {Settings_2fa_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_2fa_none: ((inputs?: Settings_2fa_NoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_2fa_NoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_2fa_NoneInputs = {};
