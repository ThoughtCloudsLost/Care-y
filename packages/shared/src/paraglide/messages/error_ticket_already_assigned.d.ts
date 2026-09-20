/**
* | output |
* | --- |
* | "{Ticket} is already assigned." |
*
* @param {Error_Ticket_Already_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_ticket_already_assigned: ((inputs: Error_Ticket_Already_AssignedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Already_AssignedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Already_AssignedInputs = {
    Ticket: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
