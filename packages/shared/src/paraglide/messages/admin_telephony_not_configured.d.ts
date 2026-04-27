/**
* | output |
* | --- |
* | "Phone service not set up" |
*
* @param {Admin_Telephony_Not_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_not_configured: ((inputs?: Admin_Telephony_Not_ConfiguredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Not_ConfiguredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Not_ConfiguredInputs = {};
