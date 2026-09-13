/**
* | output |
* | --- |
* | "This link no longer works. From now on, sign in at /account with your password. Your messages moved with you." |
*
* @param {Account_Upgrade_Success_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_success_body: ((inputs?: Account_Upgrade_Success_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Upgrade_Success_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Upgrade_Success_BodyInputs = {};
