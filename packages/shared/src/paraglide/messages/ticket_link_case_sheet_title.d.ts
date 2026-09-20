/**
* | output |
* | --- |
* | "Link a {ticket}" |
*
* @param {Ticket_Link_Case_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_sheet_title: ((inputs: Ticket_Link_Case_Sheet_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Link_Case_Sheet_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Link_Case_Sheet_TitleInputs = {
    ticket: NonNullable<unknown>;
};
