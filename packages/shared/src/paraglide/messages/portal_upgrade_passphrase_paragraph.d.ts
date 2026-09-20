/**
* | output |
* | --- |
* | "Add a password to your link, so the link alone is not enough to open your messages." |
*
* @param {Portal_Upgrade_Passphrase_ParagraphInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_passphrase_paragraph: ((inputs?: Portal_Upgrade_Passphrase_ParagraphInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Upgrade_Passphrase_ParagraphInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Upgrade_Passphrase_ParagraphInputs = {};
