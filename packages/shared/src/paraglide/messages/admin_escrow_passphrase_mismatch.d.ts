/**
* | output |
* | --- |
* | "Passphrases don't match" |
*
* @param {Admin_Escrow_Passphrase_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_mismatch: ((inputs?: Admin_Escrow_Passphrase_MismatchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Passphrase_MismatchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Passphrase_MismatchInputs = {};
