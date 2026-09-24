/**
* | output |
* | --- |
* | "That passphrase did not work. Check the words and try again." |
*
* @param {Portal_Passphrase_WrongInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_wrong: ((inputs?: Portal_Passphrase_WrongInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_WrongInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_WrongInputs = {};
