/**
* | output |
* | --- |
* | "Try different words" |
*
* @param {Portal_Passphrase_New_WordsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_new_words: ((inputs?: Portal_Passphrase_New_WordsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_New_WordsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_New_WordsInputs = {};
