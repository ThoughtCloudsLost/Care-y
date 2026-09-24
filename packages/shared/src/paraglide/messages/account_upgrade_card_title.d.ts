/**
* | output |
* | --- |
* | "Add a password to this conversation" |
*
* @param {Account_Upgrade_Card_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_card_title: ((inputs?: Account_Upgrade_Card_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Upgrade_Card_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Upgrade_Card_TitleInputs = {};
