/**
* | output |
* | --- |
* | "The ticket list is where volunteers manage incoming cases. Titles, descriptions, and every message are encrypted with keys only the browser holds. The server..." |
*
* @param {Demo_Section_Tickets_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_tickets_desc: ((inputs?: Demo_Section_Tickets_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Tickets_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Tickets_DescInputs = {};
