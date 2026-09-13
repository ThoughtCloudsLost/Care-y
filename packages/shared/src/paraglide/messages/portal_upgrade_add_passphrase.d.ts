/**
* | output |
* | --- |
* | "Add a password to this link" |
*
* @param {Portal_Upgrade_Add_PassphraseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_add_passphrase: ((inputs?: Portal_Upgrade_Add_PassphraseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Upgrade_Add_PassphraseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Upgrade_Add_PassphraseInputs = {};
