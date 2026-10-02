/**
* | output |
* | --- |
* | "Create an API key in your Givebutter dashboard, under Settings. The server stores the key encrypted and uses it only to read fund totals and to register a we..." |
*
* @param {Admin_Donations_Api_Key_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_api_key_hint: ((inputs?: Admin_Donations_Api_Key_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Donations_Api_Key_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Donations_Api_Key_HintInputs = {};
