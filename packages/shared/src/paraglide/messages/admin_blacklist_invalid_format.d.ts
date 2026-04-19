/**
* | output |
* | --- |
* | "Enter a valid phone number (at least 5 digits)." |
*
* @param {Admin_Blacklist_Invalid_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_invalid_format: ((inputs?: Admin_Blacklist_Invalid_FormatInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_Invalid_FormatInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_Invalid_FormatInputs = {};
