/**
* | output |
* | --- |
* | "Escrow file exported" |
*
* @param {Admin_Escrow_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_success: ((inputs?: Admin_Escrow_SuccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_SuccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_SuccessInputs = {};
