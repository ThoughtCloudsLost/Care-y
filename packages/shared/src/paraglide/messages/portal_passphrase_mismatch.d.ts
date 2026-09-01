/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Portal_Passphrase_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_mismatch: ((inputs?: Portal_Passphrase_MismatchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_MismatchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_MismatchInputs = {};
