/**
* | output |
* | --- |
* | "Linked {tickets}" |
*
* @param {Ticket_Linked_Cases_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_linked_cases_title: ((inputs: Ticket_Linked_Cases_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Linked_Cases_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Linked_Cases_TitleInputs = {
    tickets: NonNullable<unknown>;
    Tickets: NonNullable<unknown>;
};
