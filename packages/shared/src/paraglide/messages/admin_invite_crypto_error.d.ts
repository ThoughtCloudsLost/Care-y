/**
* | output |
* | --- |
* | "Account was created, but key distribution failed. The organization key will be distributed automatically when an admin next logs in." |
*
* @param {Admin_Invite_Crypto_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_error: ((inputs?: Admin_Invite_Crypto_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Crypto_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Crypto_ErrorInputs = {};
