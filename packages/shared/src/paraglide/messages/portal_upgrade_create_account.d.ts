/**
* | output |
* | --- |
* | "Create an account" |
*
* @param {Portal_Upgrade_Create_AccountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_create_account: ((inputs?: Portal_Upgrade_Create_AccountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Upgrade_Create_AccountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Upgrade_Create_AccountInputs = {};
