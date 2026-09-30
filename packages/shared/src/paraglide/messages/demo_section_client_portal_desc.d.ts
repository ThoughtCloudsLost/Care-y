/**
* | output |
* | --- |
* | "The secure portal gives a client a private page to read and reply to messages from the organization. A user in the organization creates the link and hands it..." |
*
* @param {Demo_Section_Client_Portal_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_portal_desc: ((inputs?: Demo_Section_Client_Portal_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Portal_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Portal_DescInputs = {};
