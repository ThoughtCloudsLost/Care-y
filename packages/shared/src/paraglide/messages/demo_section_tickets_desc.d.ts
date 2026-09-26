/**
* | output |
* | --- |
* | "A ticket is one client's case file. Each client has at most one open ticket. Contact on any channel (call, SMS, email, web intake form, portal message, voice..." |
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
