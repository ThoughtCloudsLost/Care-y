/**
* | output |
* | --- |
* | "Disable browser extensions, or use a private/incognito window (most extensions are disabled by default in incognito)" |
*
* @param {Admin_Escrow_Browser_Safety_ExtensionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_extensions: ((inputs?: Admin_Escrow_Browser_Safety_ExtensionsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Browser_Safety_ExtensionsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Browser_Safety_ExtensionsInputs = {};
