/**
* | output |
* | --- |
* | "Every ticket title, description, and message is encrypted with keys only the browser holds. The server stores ciphertext and routes it without reading it. So..." |
*
* @param {Demo_Section_Tickets_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_tickets_desc: ((inputs?: Demo_Section_Tickets_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Tickets_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Tickets_DescInputs = {};
