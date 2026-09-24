/**
* | output |
* | --- |
* | "Edit {ticket}" |
*
* @param {Ticket_Action_Edit_CaseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_edit_case: ((inputs: Ticket_Action_Edit_CaseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_Edit_CaseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_Edit_CaseInputs = {
    ticket: NonNullable<unknown>;
};
