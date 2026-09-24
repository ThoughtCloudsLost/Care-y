/**
* | output |
* | --- |
* | "Cannot assign a closed {ticket}." |
*
* @param {Error_Cannot_Assign_Closed_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_assign_closed_ticket: ((inputs: Error_Cannot_Assign_Closed_TicketInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Assign_Closed_TicketInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Assign_Closed_TicketInputs = {
    ticket: NonNullable<unknown>;
};
