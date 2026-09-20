/**
* | output |
* | --- |
* | "Adding password, please wait" |
*
* @param {Portal_Passphrase_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_submitting: ((inputs?: Portal_Passphrase_SubmittingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_SubmittingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_SubmittingInputs = {};
