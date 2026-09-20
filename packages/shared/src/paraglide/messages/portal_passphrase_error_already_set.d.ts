/**
* | output |
* | --- |
* | "A password has already been added to this link." |
*
* @param {Portal_Passphrase_Error_Already_SetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_already_set: ((inputs?: Portal_Passphrase_Error_Already_SetInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Error_Already_SetInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Error_Already_SetInputs = {};
