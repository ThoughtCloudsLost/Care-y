/**
* | output |
* | --- |
* | "Linked." |
*
* @param {Ticket_Link_Case_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_added: ((inputs?: Ticket_Link_Case_AddedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Link_Case_AddedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Link_Case_AddedInputs = {};
