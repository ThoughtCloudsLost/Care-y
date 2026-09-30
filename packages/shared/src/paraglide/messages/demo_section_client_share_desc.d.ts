/**
* | output |
* | --- |
* | "A share link delivers one encrypted message to a reader who has no account in the system. The decryption key sits in the URL fragment, which browsers never i..." |
*
* @param {Demo_Section_Client_Share_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_share_desc: ((inputs?: Demo_Section_Client_Share_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Share_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Share_DescInputs = {};
