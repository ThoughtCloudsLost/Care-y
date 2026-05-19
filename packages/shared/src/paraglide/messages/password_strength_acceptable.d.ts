/**
* | output |
* | --- |
* | "Acceptable" |
*
* @param {Password_Strength_AcceptableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_strength_acceptable: ((inputs?: Password_Strength_AcceptableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Password_Strength_AcceptableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Password_Strength_AcceptableInputs = {};
