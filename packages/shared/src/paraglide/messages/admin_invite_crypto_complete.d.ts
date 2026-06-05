/**
* | output |
* | --- |
* | "Keys distributed successfully" |
*
* @param {Admin_Invite_Crypto_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_complete: ((inputs?: Admin_Invite_Crypto_CompleteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Crypto_CompleteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Crypto_CompleteInputs = {};
