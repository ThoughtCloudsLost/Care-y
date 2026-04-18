/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Admin_Escrow_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_continue: ((inputs?: Admin_Escrow_ContinueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_ContinueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_ContinueInputs = {};
