/**
* | output |
* | --- |
* | "Account ID" |
*
* @param {Admin_Telephony_Account_IdInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_account_id: ((inputs?: Admin_Telephony_Account_IdInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Account_IdInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Account_IdInputs = {};
