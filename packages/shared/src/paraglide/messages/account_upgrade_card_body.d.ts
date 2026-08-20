/**
* | output |
* | --- |
* | "A password protects your messages even if this link is found." |
*
* @param {Account_Upgrade_Card_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_card_body: ((inputs?: Account_Upgrade_Card_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Upgrade_Card_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Upgrade_Card_BodyInputs = {};
