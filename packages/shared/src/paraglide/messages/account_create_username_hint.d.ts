/**
* | output |
* | --- |
* | "Pick a username you can remember. It does not have to be your real name." |
*
* @param {Account_Create_Username_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_create_username_hint: ((inputs?: Account_Create_Username_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Create_Username_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Create_Username_HintInputs = {};
