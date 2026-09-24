/**
* | output |
* | --- |
* | "No linked {tickets}." |
*
* @param {Ticket_Linked_Cases_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_linked_cases_empty: ((inputs: Ticket_Linked_Cases_EmptyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Linked_Cases_EmptyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Linked_Cases_EmptyInputs = {
    tickets: NonNullable<unknown>;
};
