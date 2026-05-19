/**
* | output |
* | --- |
* | "Too short (minimum {min} characters)" |
*
* @param {Password_Strength_Too_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_strength_too_short: ((inputs: Password_Strength_Too_ShortInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Password_Strength_Too_ShortInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Password_Strength_Too_ShortInputs = {
    min: NonNullable<unknown>;
};
