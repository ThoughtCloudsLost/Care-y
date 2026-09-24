/**
* | output |
* | --- |
* | "Generating encryption keys..." |
*
* @param {Admin_Invite_Crypto_DerivingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_deriving: ((inputs?: Admin_Invite_Crypto_DerivingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Crypto_DerivingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Crypto_DerivingInputs = {};
