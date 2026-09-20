/**
* | output |
* | --- |
* | "New messages arrived while adding the password. Refreshing, please try again." |
*
* @param {Portal_Passphrase_Error_StaleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_stale: ((inputs?: Portal_Passphrase_Error_StaleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Error_StaleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Error_StaleInputs = {};
