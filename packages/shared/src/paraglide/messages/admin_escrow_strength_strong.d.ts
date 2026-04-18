/**
* | output |
* | --- |
* | "Strong" |
*
* @param {Admin_Escrow_Strength_StrongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_strength_strong: ((inputs?: Admin_Escrow_Strength_StrongInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Strength_StrongInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Strength_StrongInputs = {};
