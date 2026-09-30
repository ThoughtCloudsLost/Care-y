/**
* | output |
* | --- |
* | "A client account lets the client return to the same conversation with a username and password instead of a link. The password runs through the same key deriv..." |
*
* @param {Demo_Section_Client_Account_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_account_desc: ((inputs?: Demo_Section_Client_Account_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Account_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Account_DescInputs = {};
