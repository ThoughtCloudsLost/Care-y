/**
* | output |
* | --- |
* | "You were signed out to protect your messages. Sign in to continue." |
*
* @param {Account_Signed_OutInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_signed_out: ((inputs?: Account_Signed_OutInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Signed_OutInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Signed_OutInputs = {};
