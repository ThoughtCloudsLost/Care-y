/**
* | output |
* | --- |
* | "Done" |
*
* @param {Admin_Escrow_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_done: ((inputs?: Admin_Escrow_DoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_DoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_DoneInputs = {};
