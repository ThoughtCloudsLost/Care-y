/**
* | output |
* | --- |
* | "The ticket detail view is where volunteers read messages, reply, take notes, and manage a case. Every field shown here was decrypted locally by the volunteer..." |
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
