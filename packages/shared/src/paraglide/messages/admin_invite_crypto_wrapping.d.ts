/**
* | output |
* | --- |
* | "Distributing organization key..." |
*
* @param {Admin_Invite_Crypto_WrappingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_wrapping: ((inputs?: Admin_Invite_Crypto_WrappingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Crypto_WrappingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Crypto_WrappingInputs = {};
