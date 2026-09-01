/**
* | output |
* | --- |
* | "Something went wrong. Try again." |
*
* @param {Portal_Passphrase_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_generic: ((inputs?: Portal_Passphrase_Error_GenericInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Error_GenericInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Error_GenericInputs = {};
