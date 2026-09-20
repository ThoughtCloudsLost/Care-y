/**
* | output |
* | --- |
* | "Every field shown here is decrypted locally by the browser. The server stores and relays ciphertext without access to the content. The view has two modes: a ..." |
*
* @param {Demo_Section_Ticket_Detail_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_ticket_detail_desc: ((inputs?: Demo_Section_Ticket_Detail_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Ticket_Detail_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Ticket_Detail_DescInputs = {};
