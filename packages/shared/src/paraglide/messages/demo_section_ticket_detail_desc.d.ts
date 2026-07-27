/**
* | output |
* | --- |
* | "Inside a ticket, volunteers read messages, reply, take notes, and review case metadata. Every field shown here was decrypted locally. The server relayed the ..." |
*
* @param {Demo_Section_Ticket_Detail_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_ticket_detail_desc: ((inputs?: Demo_Section_Ticket_Detail_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Ticket_Detail_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Ticket_Detail_DescInputs = {};
