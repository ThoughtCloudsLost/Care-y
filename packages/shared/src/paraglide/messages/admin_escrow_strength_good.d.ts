/**
* | output |
* | --- |
* | "Good" |
*
* @param {Admin_Escrow_Strength_GoodInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_strength_good: ((inputs?: Admin_Escrow_Strength_GoodInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Strength_GoodInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Strength_GoodInputs = {};
