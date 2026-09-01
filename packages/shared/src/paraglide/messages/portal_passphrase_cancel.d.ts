/**
* | output |
* | --- |
* | "Cancel" |
*
* @param {Portal_Passphrase_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_cancel: ((inputs?: Portal_Passphrase_CancelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_CancelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_CancelInputs = {};
