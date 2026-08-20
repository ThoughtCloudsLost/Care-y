/**
* | output |
* | --- |
* | "Add a secure account (optional)" |
*
* @param {Account_Intake_Optin_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_intake_optin_title: ((inputs?: Account_Intake_Optin_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Intake_Optin_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Intake_Optin_TitleInputs = {};
