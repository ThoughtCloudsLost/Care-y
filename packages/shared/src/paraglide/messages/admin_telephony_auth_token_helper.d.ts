/**
* | output |
* | --- |
* | "Also in your {provider} account settings" |
*
* @param {Admin_Telephony_Auth_Token_HelperInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_auth_token_helper: ((inputs: Admin_Telephony_Auth_Token_HelperInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Auth_Token_HelperInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Auth_Token_HelperInputs = {
    provider: NonNullable<unknown>;
};
