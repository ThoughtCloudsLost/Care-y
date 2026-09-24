/**
* | output |
* | --- |
* | "Something went wrong. Try again." |
*
* @param {Portal_Passphrase_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_generic: ((inputs?: Portal_Passphrase_Error_GenericInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Error_GenericInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Error_GenericInputs = {};
