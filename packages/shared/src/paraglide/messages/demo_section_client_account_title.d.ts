/**
* | output |
* | --- |
* | "Client account" |
*
* @param {Demo_Section_Client_Account_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_account_title: ((inputs?: Demo_Section_Client_Account_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Account_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Account_TitleInputs = {};
