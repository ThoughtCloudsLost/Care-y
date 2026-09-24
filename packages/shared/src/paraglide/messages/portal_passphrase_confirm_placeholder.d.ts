/**
* | output |
* | --- |
* | "Enter the same password" |
*
* @param {Portal_Passphrase_Confirm_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_confirm_placeholder: ((inputs?: Portal_Passphrase_Confirm_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Confirm_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Confirm_PlaceholderInputs = {};
