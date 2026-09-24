/**
* | output |
* | --- |
* | "Add a password to this link" |
*
* @param {Portal_Upgrade_Add_PassphraseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_add_passphrase: ((inputs?: Portal_Upgrade_Add_PassphraseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Upgrade_Add_PassphraseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Upgrade_Add_PassphraseInputs = {};
