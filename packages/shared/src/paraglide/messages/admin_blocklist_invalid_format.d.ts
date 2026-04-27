/**
* | output |
* | --- |
* | "Enter a valid phone number (at least 5 digits)." |
*
* @param {Admin_Blocklist_Invalid_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_invalid_format: ((inputs?: Admin_Blocklist_Invalid_FormatInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blocklist_Invalid_FormatInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blocklist_Invalid_FormatInputs = {};
