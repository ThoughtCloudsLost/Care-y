/**
* | output |
* | --- |
* | "Show password" |
*
* @param {Password_ShowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_show: ((inputs?: Password_ShowInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Password_ShowInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Password_ShowInputs = {};
