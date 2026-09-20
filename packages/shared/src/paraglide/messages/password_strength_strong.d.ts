/**
* | output |
* | --- |
* | "Strong" |
*
* @param {Password_Strength_StrongInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const password_strength_strong: ((inputs?: Password_Strength_StrongInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Password_Strength_StrongInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Password_Strength_StrongInputs = {};
