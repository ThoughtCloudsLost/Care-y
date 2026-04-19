/**
* | output |
* | --- |
* | "Refresh numbers" |
*
* @param {Admin_Telephony_Refresh_NumbersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_refresh_numbers: ((inputs?: Admin_Telephony_Refresh_NumbersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Refresh_NumbersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Refresh_NumbersInputs = {};
