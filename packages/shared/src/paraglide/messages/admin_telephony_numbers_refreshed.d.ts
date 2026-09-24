/**
* | output |
* | --- |
* | "Phone numbers refreshed" |
*
* @param {Admin_Telephony_Numbers_RefreshedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_numbers_refreshed: ((inputs?: Admin_Telephony_Numbers_RefreshedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Numbers_RefreshedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Numbers_RefreshedInputs = {};
