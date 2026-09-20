/**
* | output |
* | --- |
* | "Read replies here with a password." |
*
* @param {Account_Intake_Optin_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_intake_optin_body: ((inputs?: Account_Intake_Optin_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Intake_Optin_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Intake_Optin_BodyInputs = {};
