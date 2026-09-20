/**
* | output |
* | --- |
* | "Your messages changed while adding the password. Try again." |
*
* @param {Error_Portal_Passphrase_Count_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_passphrase_count_mismatch: ((inputs?: Error_Portal_Passphrase_Count_MismatchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Passphrase_Count_MismatchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Passphrase_Count_MismatchInputs = {};
