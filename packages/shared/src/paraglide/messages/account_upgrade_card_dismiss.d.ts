/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Account_Upgrade_Card_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_card_dismiss: ((inputs?: Account_Upgrade_Card_DismissInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Upgrade_Card_DismissInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Upgrade_Card_DismissInputs = {};
