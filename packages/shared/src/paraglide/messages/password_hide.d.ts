/**
* | output |
* | --- |
* | "Hide password" |
*
* @param {Password_HideInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_hide: ((inputs?: Password_HideInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Password_HideInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Password_HideInputs = {};
