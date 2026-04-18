/**
* | output |
* | --- |
* | "This passphrase follows a predictable pattern. Use a more varied phrase." |
*
* @param {Admin_Escrow_Passphrase_CommonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_common: ((inputs?: Admin_Escrow_Passphrase_CommonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Passphrase_CommonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Passphrase_CommonInputs = {};
