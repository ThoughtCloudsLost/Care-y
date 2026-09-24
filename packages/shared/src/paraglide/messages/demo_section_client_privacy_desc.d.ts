/**
* | output |
* | --- |
* | "The privacy notice page explains what data the organization collects, how long it is retained, and what encryption protections apply." |
*
* @param {Demo_Section_Client_Privacy_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_privacy_desc: ((inputs?: Demo_Section_Client_Privacy_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Privacy_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Privacy_DescInputs = {};
