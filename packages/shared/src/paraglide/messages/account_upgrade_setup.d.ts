/**
* | output |
* | --- |
* | "Set up account" |
*
* @param {Account_Upgrade_SetupInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_setup: ((inputs?: Account_Upgrade_SetupInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Upgrade_SetupInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Upgrade_SetupInputs = {};
