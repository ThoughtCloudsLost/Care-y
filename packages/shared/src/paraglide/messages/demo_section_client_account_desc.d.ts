/**
* | output |
* | --- |
* | "A client account gives a returning person durable access to their conversation thread without needing a new link each time. The account uses a username and p..." |
*
* @param {Demo_Section_Client_Account_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_account_desc: ((inputs?: Demo_Section_Client_Account_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Account_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Account_DescInputs = {};
