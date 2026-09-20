/**
* | output |
* | --- |
* | "Your account is ready" |
*
* @param {Account_Upgrade_Success_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_success_title: ((inputs?: Account_Upgrade_Success_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Upgrade_Success_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Upgrade_Success_TitleInputs = {};
