/**
* | output |
* | --- |
* | "Too short (minimum 20 characters)" |
*
* @param {Admin_Escrow_Strength_Too_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_strength_too_short: ((inputs?: Admin_Escrow_Strength_Too_ShortInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Strength_Too_ShortInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Strength_Too_ShortInputs = {};
