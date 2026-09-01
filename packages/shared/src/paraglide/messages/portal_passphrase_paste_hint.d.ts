/**
* | output |
* | --- |
* | "Paste is allowed. Pick something you can remember." |
*
* @param {Portal_Passphrase_Paste_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_paste_hint: ((inputs?: Portal_Passphrase_Paste_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Paste_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Paste_HintInputs = {};
