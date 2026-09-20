/**
* | output |
* | --- |
* | "Organization key not loaded. Log in again to export." |
*
* @param {Admin_Escrow_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_no_org_key: ((inputs?: Admin_Escrow_No_Org_KeyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_No_Org_KeyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_No_Org_KeyInputs = {};
