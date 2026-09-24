/**
* | output |
* | --- |
* | "A single use readable message sent to someone outside the system. The content is encrypted under a fresh random key that lives only in the URL fragment, and ..." |
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
