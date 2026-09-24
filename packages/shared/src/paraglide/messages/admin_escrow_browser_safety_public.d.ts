/**
* | output |
* | --- |
* | "Don't do this on a shared or public computer" |
*
* @param {Admin_Escrow_Browser_Safety_PublicInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_public: ((inputs?: Admin_Escrow_Browser_Safety_PublicInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Browser_Safety_PublicInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Browser_Safety_PublicInputs = {};
