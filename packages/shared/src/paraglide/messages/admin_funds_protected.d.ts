/**
* | output |
* | --- |
* | "The server stores this fund only in encrypted form. It cannot read the name, the currency or any amount." |
*
* @param {Admin_Funds_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_protected: ((inputs?: Admin_Funds_ProtectedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_ProtectedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_ProtectedInputs = {};
