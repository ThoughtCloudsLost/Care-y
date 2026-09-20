/**
* | output |
* | --- |
* | "Linked {tickets}" |
*
* @param {Ticket_Action_Link_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_link_cases: ((inputs: Ticket_Action_Link_CasesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_Link_CasesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_Link_CasesInputs = {
    tickets: NonNullable<unknown>;
    Tickets: NonNullable<unknown>;
};
