/**
* | output |
* | --- |
* | "Good" |
*
* @param {Password_Strength_GoodInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_strength_good: ((inputs?: Password_Strength_GoodInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Password_Strength_GoodInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Password_Strength_GoodInputs = {};
