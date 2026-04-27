/**
* | output |
* | --- |
* | "Auth token" |
*
* @param {Admin_Telephony_Auth_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_auth_token: ((inputs?: Admin_Telephony_Auth_TokenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Auth_TokenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Auth_TokenInputs = {};
